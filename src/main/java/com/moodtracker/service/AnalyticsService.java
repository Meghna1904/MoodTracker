package com.moodtracker.service;

import com.moodtracker.model.Mood;
import com.moodtracker.model.Task;
import com.moodtracker.model.UserProfile;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final TaskService taskService;
    private final MoodService moodService;
    private final UserProfileService userProfileService;

    public MoodAnalytics analyzeMoodTrends(String userId, LocalDateTime startDate, LocalDateTime endDate) {
        List<Mood> moods = moodService.getUserMoodsBetween(userId, startDate, endDate);
        List<Task> tasks = taskService.getTasksForTimeRange(userId, startDate, endDate);
        
        // Calculate mood distribution
        Map<Mood.MoodType, Long> distribution = moods.stream()
            .collect(Collectors.groupingBy(
                Mood::getMoodType,
                Collectors.counting()
            ));
        
        // Find most common mood
        Mood.MoodType dominantMood = distribution.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse(Mood.MoodType.NEUTRAL);
        
        // Calculate mood stability
        double moodVariance = calculateMoodVariance(moods);
        double moodStability = 1.0 / (1.0 + moodVariance);
        
        // Calculate mood-productivity correlation
        double correlation = calculateMoodProductivityCorrelation(moods, tasks);
        
        // Analyze patterns
        Map<String, Object> patterns = analyzeMoodPatterns(moods);
        
        return MoodAnalytics.builder()
            .moodDistribution(distribution)
            .dominantMood(dominantMood)
            .moodStability(moodStability)
            .productivityCorrelation(correlation)
            .patterns(patterns)
            .build();
    }

    public TaskAnalytics analyzeTaskPerformance(String userId, LocalDateTime startDate, LocalDateTime endDate) {
        List<Task> tasks = taskService.getTasksForTimeRange(userId, startDate, endDate);
        
        return TaskAnalytics.builder()
            .productivityScore(calculateProductivityScore(tasks))
            .completionRate(calculateTaskCompletionRate(tasks))
            .averageTaskDuration(calculateAverageTaskDuration(tasks))
            .peakProductivityHours(findPeakProductivityHours(tasks))
            .taskDistribution(analyzeTaskDistribution(tasks))
            .recommendations(generateTaskRecommendations(tasks))
            .build();
    }

    public List<Suggestion> getSuggestions(String userId, LocalDateTime startDate, LocalDateTime endDate) {
        TaskAnalytics taskAnalytics = analyzeTaskPerformance(userId, startDate, endDate);
        List<String> recommendations = taskAnalytics.getRecommendations();

        if (recommendations == null || recommendations.isEmpty()) {
            return Collections.singletonList(
                Suggestion.builder()
                    .id("general-check-in")
                    .title("Keep checking in")
                    .description("You do not have enough recent activity for personalized suggestions yet. Keep logging moods and tasks.")
                    .type("productivity")
                    .priority("low")
                    .actionable(false)
                    .build()
            );
        }

        List<Suggestion> suggestions = new ArrayList<>();
        for (int i = 0; i < recommendations.size(); i++) {
            suggestions.add(
                Suggestion.builder()
                    .id("suggestion-" + (i + 1))
                    .title("Suggestion " + (i + 1))
                    .description(recommendations.get(i))
                    .type("productivity")
                    .priority(i == 0 ? "high" : "medium")
                    .actionable(true)
                    .build()
            );
        }
        return suggestions;
    }

    private double calculateProductivityScore(List<Task> tasks) {
        if (tasks == null || tasks.isEmpty()) return 0.0;
        
        double completedOnTime = tasks.stream()
            .filter(task -> task.getStatus() == Task.TaskStatus.COMPLETED)
            .filter(task -> task.getCompletedAt() != null && 
                          task.getDeadline() != null && 
                          !task.getCompletedAt().isAfter(task.getDeadline()))
            .count();
        
        return (completedOnTime / tasks.size()) * 100.0;
    }

    private double calculateTaskCompletionRate(List<Task> tasks) {
        if (tasks == null || tasks.isEmpty()) return 0.0;
        
        long completedTasks = tasks.stream()
            .filter(task -> task.getStatus() == Task.TaskStatus.COMPLETED)
            .count();
        
        return (double) completedTasks / tasks.size() * 100.0;
    }

    private double calculateAverageTaskDuration(List<Task> tasks) {
        if (tasks == null || tasks.isEmpty()) return 0.0;
        
        List<Long> durations = tasks.stream()
            .filter(task -> task.getStartedAt() != null && task.getCompletedAt() != null)
            .map(task -> ChronoUnit.MINUTES.between(task.getStartedAt(), task.getCompletedAt()))
            .collect(Collectors.toList());
        
        if (durations.isEmpty()) return 0.0;
        
        return durations.stream()
            .mapToLong(Long::longValue)
            .average()
            .orElse(0.0);
    }

    private double calculateMoodVariance(List<Mood> moods) {
        if (moods == null || moods.isEmpty()) return 0.0;
        
        List<Double> moodValues = moods.stream()
            .map(mood -> (double) mood.getMoodType().getNumericValue())
            .collect(Collectors.toList());
        
        double mean = moodValues.stream()
            .mapToDouble(Double::doubleValue)
            .average()
            .orElse(0.0);
        
        return moodValues.stream()
            .mapToDouble(value -> Math.pow(value - mean, 2))
            .average()
            .orElse(0.0);
    }

    private Map<String, Object> analyzeMoodPatterns(List<Mood> moods) {
        if (moods == null || moods.isEmpty()) {
            return new HashMap<>();
        }
        
        Map<String, Object> patterns = new HashMap<>();
        
        // Analyze daily patterns
        Map<Integer, Double> hourlyMoods = moods.stream()
            .collect(Collectors.groupingBy(
                mood -> mood.getTimestamp().getHour(),
                Collectors.averagingDouble(mood -> mood.getMoodType().getNumericValue())
            ));
        patterns.put("hourlyPatterns", hourlyMoods);
        
        // Analyze weekly patterns
        Map<Integer, Double> weeklyMoods = moods.stream()
            .collect(Collectors.groupingBy(
                mood -> mood.getTimestamp().getDayOfWeek().getValue(),
                Collectors.averagingDouble(mood -> mood.getMoodType().getNumericValue())
            ));
        patterns.put("weeklyPatterns", weeklyMoods);
        
        return patterns;
    }

    private double calculateMoodProductivityCorrelation(List<Mood> moods, List<Task> tasks) {
        if (moods == null || moods.isEmpty() || tasks == null || tasks.isEmpty()) {
            return 0.0;
        }

        Map<LocalDateTime, List<Task>> tasksByDate = tasks.stream()
            .filter(task -> task.getCompletedAt() != null)
            .collect(Collectors.groupingBy(
                task -> task.getCompletedAt().truncatedTo(ChronoUnit.DAYS)
            ));

        Map<LocalDateTime, Double> averageMoodByDate = moods.stream()
            .collect(Collectors.groupingBy(
                mood -> mood.getTimestamp().truncatedTo(ChronoUnit.DAYS),
                Collectors.averagingDouble(mood -> mood.getMoodType().getNumericValue())
            ));

        Set<LocalDateTime> commonDates = new HashSet<>(tasksByDate.keySet());
        commonDates.retainAll(averageMoodByDate.keySet());

        if (commonDates.isEmpty()) return 0.0;

        List<Double> moodScores = new ArrayList<>();
        List<Double> productivityScores = new ArrayList<>();

        for (LocalDateTime date : commonDates) {
            moodScores.add(averageMoodByDate.get(date));
            productivityScores.add(calculateDailyProductivity(tasksByDate.get(date)));
        }

        return calculatePearsonCorrelation(moodScores, productivityScores);
    }

    private double calculatePearsonCorrelation(List<Double> x, List<Double> y) {
        if (x == null || y == null || x.size() != y.size() || x.isEmpty()) {
            return 0.0;
        }

        int n = x.size();
        double sumX = 0.0, sumY = 0.0, sumXY = 0.0;
        double sumXSquare = 0.0, sumYSquare = 0.0;

        for (int i = 0; i < n; i++) {
            double xi = x.get(i);
            double yi = y.get(i);

            sumX += xi;
            sumY += yi;
            sumXY += xi * yi;
            sumXSquare += xi * xi;
            sumYSquare += yi * yi;
        }

        double numerator = n * sumXY - sumX * sumY;
        double denominator = Math.sqrt((n * sumXSquare - sumX * sumX) * (n * sumYSquare - sumY * sumY));

        if (denominator == 0) return 0.0;

        return numerator / denominator;
    }

    private double calculateDailyProductivity(List<Task> tasks) {
        if (tasks == null || tasks.isEmpty()) return 0.0;

        double score = 0.0;
        for (Task task : tasks) {
            if (task.getStatus() == Task.TaskStatus.COMPLETED) {
                score += 1.0;
                
                if (task.getDeadline() != null && 
                    task.getCompletedAt() != null && 
                    !task.getCompletedAt().isAfter(task.getDeadline())) {
                    score += 0.5;
                }
                
                switch (task.getDifficulty()) {
                    case HIGH:
                        score += 0.3;
                        break;
                    case MEDIUM:
                        score += 0.2;
                        break;
                    case LOW:
                        score += 0.1;
                        break;
                }
            }
        }

        return score / tasks.size();
    }

    private Map<Integer, Double> findPeakProductivityHours(List<Task> tasks) {
        if (tasks == null || tasks.isEmpty()) {
            return new HashMap<>();
        }
        
        Map<Integer, List<Task>> tasksByHour = tasks.stream()
            .filter(task -> task.getCompletedAt() != null)
            .collect(Collectors.groupingBy(
                task -> task.getCompletedAt().getHour()
            ));
        
        return tasksByHour.entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                entry -> calculateProductivityScore(entry.getValue())
            ));
    }

    private Map<String, Map<?, Long>> analyzeTaskDistribution(List<Task> tasks) {
        if (tasks == null || tasks.isEmpty()) {
            return new HashMap<>();
        }
        
        Map<String, Map<?, Long>> distribution = new HashMap<>();
        
        distribution.put("byPriority", tasks.stream()
            .collect(Collectors.groupingBy(
                Task::getPriority,
                Collectors.counting()
            )));
        
        distribution.put("byDifficulty", tasks.stream()
            .collect(Collectors.groupingBy(
                Task::getDifficulty,
                Collectors.counting()
            )));
        
        distribution.put("byStatus", tasks.stream()
            .collect(Collectors.groupingBy(
                Task::getStatus,
                Collectors.counting()
            )));
        
        return distribution;
    }

    private List<String> generateTaskRecommendations(List<Task> tasks) {
        if (tasks == null || tasks.isEmpty()) {
            return Collections.singletonList("No tasks available for analysis");
        }
        
        List<String> recommendations = new ArrayList<>();
        
        // Analyze completion rates
        double completionRate = calculateTaskCompletionRate(tasks);
        if (completionRate < 50.0) {
            recommendations.add("Consider breaking down tasks into smaller, more manageable pieces");
        }
        
        // Analyze task difficulty distribution
        Map<Task.Difficulty, Long> difficultyDistribution = tasks.stream()
            .collect(Collectors.groupingBy(Task::getDifficulty, Collectors.counting()));
        
        long highDifficultyCount = difficultyDistribution.getOrDefault(Task.Difficulty.HIGH, 0L);
        if (highDifficultyCount > tasks.size() * 0.5) {
            recommendations.add("You have many high-difficulty tasks. Consider alternating between high and low difficulty tasks");
        }
        
        // Analyze time management
        Map<Integer, Double> productivityHours = findPeakProductivityHours(tasks);
        OptionalDouble maxProductivity = productivityHours.values().stream()
            .mapToDouble(Double::doubleValue)
            .max();
        
        if (maxProductivity.isPresent()) {
            int peakHour = productivityHours.entrySet().stream()
                .filter(e -> e.getValue() == maxProductivity.getAsDouble())
                .map(Map.Entry::getKey)
                .findFirst()
                .orElse(-1);
                
            if (peakHour >= 0) {
                recommendations.add(String.format("Your peak productivity is at %d:00. Consider scheduling important tasks during this time", peakHour));
            }
        }
        
        return recommendations;
    }

    @Data
    @Builder
    public static class MoodAnalytics {
        private final Map<Mood.MoodType, Long> moodDistribution;
        private final Mood.MoodType dominantMood;
        private final double moodStability;
        private final double productivityCorrelation;
        private final Map<String, Object> patterns;
    }

    @Data
    @Builder
    public static class TaskAnalytics {
        private final double productivityScore;
        private final double completionRate;
        private final double averageTaskDuration;
        private final Map<Integer, Double> peakProductivityHours;
        private final Map<String, Map<?, Long>> taskDistribution;
        private final List<String> recommendations;
    }

    @Data
    @Builder
    public static class Suggestion {
        private final String id;
        private final String title;
        private final String description;
        private final String type;
        private final String priority;
        private final boolean actionable;
    }
}
