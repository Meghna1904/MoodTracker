package com.moodtracker.service;

import com.moodtracker.model.Mood;
import com.moodtracker.model.Task;
import com.moodtracker.model.UserProfile;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.stereotype.Service;
import smile.data.DataFrame;
import smile.data.formula.Formula;
import smile.data.type.DataTypes;
import smile.data.type.StructField;
import smile.data.type.StructType;
import smile.regression.RandomForest;
import smile.data.vector.BaseVector;
import smile.data.vector.DoubleVector;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MoodPredictionService {
    private final MoodService moodService;
    private final TaskService taskService;
    private final UserProfileService userProfileService;
    private final WeatherService weatherService;

    // Cache for trained models
    private final Map<String, RandomForest> moodPredictionModels = new HashMap<>();

    public MoodPrediction predictMood(String userId, LocalDateTime targetDateTime) {
        try {
            UserProfile profile = userProfileService.getUserProfile(userId);
            
            // Gather features for prediction
            Map<String, Double> features = extractFeatures(userId, targetDateTime);
            
            // Get or train the model
            RandomForest model = getMoodPredictionModel(userId);
            if (model == null) {
                model = trainMoodPredictionModel(userId);
            }
            
            if (model == null) {
                return new MoodPrediction(
                    Mood.MoodType.NEUTRAL,
                    0.5,
                    Collections.singletonList("Insufficient data for prediction")
                );
            }
            
            // Convert features to DataFrame
            DataFrame featureFrame = createFeatureDataFrame(features);
            if (featureFrame == null) {
                return new MoodPrediction(
                    Mood.MoodType.NEUTRAL,
                    0.5,
                    Collections.singletonList("Error creating feature frame")
                );
            }
            
            // Make prediction
            double[] predictions = model.predict(featureFrame);
            if (predictions == null || predictions.length == 0) {
                return new MoodPrediction(
                    Mood.MoodType.NEUTRAL,
                    0.5,
                    Collections.singletonList("Unable to make prediction")
                );
            }
            
            return convertPredictionToMood(predictions[0]);
        } catch (Exception e) {
            System.err.println("Error in predictMood: " + e.getMessage());
            return new MoodPrediction(
                Mood.MoodType.NEUTRAL,
                0.5,
                Collections.singletonList("Error during prediction: " + e.getMessage())
            );
        }
    }

    private DataFrame createFeatureDataFrame(Map<String, Double> features) {
        try {
            // Sort feature names for consistent ordering
            List<String> sortedFeatureNames = new ArrayList<>(features.keySet());
            Collections.sort(sortedFeatureNames);

            // Create vectors for each feature
            List<BaseVector> vectors = new ArrayList<>();
            for (String featureName : sortedFeatureNames) {
                double[] values = new double[]{features.get(featureName)};
                vectors.add(DoubleVector.of(featureName, values));
            }

            // Create DataFrame from vectors
            return DataFrame.of(vectors.toArray(new BaseVector[0]));
        } catch (Exception e) {
            System.err.println("Error creating DataFrame: " + e.getMessage());
            return null;
        }
    }

    private Map<String, Double> extractFeatures(String userId, LocalDateTime dateTime) {
        Map<String, Double> features = new TreeMap<>(); // Use TreeMap for consistent ordering
        
        try {
            // Time-based features
            features.put("hourOfDay", (double) dateTime.getHour());
            features.put("dayOfWeek", (double) dateTime.getDayOfWeek().getValue());
            features.put("isWeekend", dateTime.getDayOfWeek().getValue() > 5 ? 1.0 : 0.0);
            
            // Recent mood history
            List<Mood> recentMoods = moodService.getRecentMoods(userId, dateTime);
            double avgMood = calculateAverageMood(recentMoods);
            features.put("recentMoodAvg", avgMood);
            
            // Task-related features
            List<Task> tasks = taskService.getTasksForTimeRange(userId, 
                dateTime.minusDays(1), dateTime);
            features.put("pendingTasksCount", (double) tasks.stream()
                .filter(t -> t.getStatus() == Task.TaskStatus.PENDING)
                .count());
            features.put("completedTasksCount", (double) tasks.stream()
                .filter(t -> t.getStatus() == Task.TaskStatus.COMPLETED)
                .count());
            
            // Weather features
            double weatherScore = weatherService.getWeatherScore(dateTime);
            features.put("weatherScore", normalizeWeatherScore(weatherScore));
        } catch (Exception e) {
            System.err.println("Error extracting features: " + e.getMessage());
        }
        
        return features;
    }

    private double calculateAverageMood(List<Mood> moods) {
        if (moods == null || moods.isEmpty()) return 3.0; // Neutral mood as default
        return moods.stream()
            .mapToDouble(mood -> mood.getMoodType().getNumericValue())
            .average()
            .orElse(3.0);
    }

    private double normalizeWeatherScore(double score) {
        return Math.max(0.0, Math.min(1.0, score / 10.0));
    }

    private RandomForest getMoodPredictionModel(String userId) {
        return moodPredictionModels.get(userId);
    }

    private RandomForest trainMoodPredictionModel(String userId) {
        try {
            List<Mood> moods = moodService.getUserMoods(userId);
            if (moods == null || moods.isEmpty()) {
                return null;
            }
            
            DataFrame trainingData = prepareTrainingData(userId, moods);
            if (trainingData == null) {
                return null;
            }
            
            // Train the model using the 'mood' column as target
            Formula formula = Formula.lhs("mood");
            RandomForest model = RandomForest.fit(formula, trainingData);
            
            moodPredictionModels.put(userId, model);
            return model;
        } catch (Exception e) {
            System.err.println("Error training model: " + e.getMessage());
            return null;
        }
    }

    private DataFrame prepareTrainingData(String userId, List<Mood> moods) {
        try {
            if (moods == null || moods.isEmpty()) {
                return null;
            }

            // Get feature names from first mood
            Map<String, Double> sampleFeatures = extractFeatures(userId, moods.get(0).getTimestamp());
            List<String> sortedFeatureNames = new ArrayList<>(sampleFeatures.keySet());
            Collections.sort(sortedFeatureNames);

            // Create vectors for features and target
            List<BaseVector> vectors = new ArrayList<>();
            
            // Initialize arrays for each feature
            Map<String, double[]> featureArrays = new HashMap<>();
            for (String featureName : sortedFeatureNames) {
                featureArrays.put(featureName, new double[moods.size()]);
            }
            double[] moodValues = new double[moods.size()];

            // Fill arrays
            for (int i = 0; i < moods.size(); i++) {
                Map<String, Double> features = extractFeatures(userId, moods.get(i).getTimestamp());
                for (String featureName : sortedFeatureNames) {
                    featureArrays.get(featureName)[i] = features.get(featureName);
                }
                moodValues[i] = moods.get(i).getMoodType().getNumericValue();
            }

            // Create vectors
            for (String featureName : sortedFeatureNames) {
                vectors.add(DoubleVector.of(featureName, featureArrays.get(featureName)));
            }
            vectors.add(DoubleVector.of("mood", moodValues));

            return DataFrame.of(vectors.toArray(new BaseVector[0]));
        } catch (Exception e) {
            System.err.println("Error preparing training data: " + e.getMessage());
            return null;
        }
    }

    private MoodPrediction convertPredictionToMood(double prediction) {
        try {
            Mood.MoodType predictedType = Arrays.stream(Mood.MoodType.values())
                .min(Comparator.comparingDouble(type -> 
                    Math.abs(type.getNumericValue() - prediction)))
                .orElse(Mood.MoodType.NEUTRAL);
            
            double confidence = 1.0 - Math.min(1.0, 
                Math.abs(predictedType.getNumericValue() - prediction) / 2.0);
            
            List<String> factors = determineContributingFactors(prediction);
            
            return new MoodPrediction(predictedType, confidence, factors);
        } catch (Exception e) {
            System.err.println("Error converting prediction: " + e.getMessage());
            return new MoodPrediction(
                Mood.MoodType.NEUTRAL,
                0.5,
                Collections.singletonList("Error in prediction conversion")
            );
        }
    }

    private List<String> determineContributingFactors(double prediction) {
        List<String> factors = new ArrayList<>();
        
        if (prediction >= 4.0) {
            factors.add("Positive weather conditions");
            factors.add("High task completion rate");
        } else if (prediction <= 2.0) {
            factors.add("Pending tasks accumulation");
            factors.add("Recent mood fluctuations");
        }
        
        return factors;
    }

    @Value
    public static class MoodPrediction {
        Mood.MoodType predictedMood;
        double confidence;
        List<String> factors;
    }
}
