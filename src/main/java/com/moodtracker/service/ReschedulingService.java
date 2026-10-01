package com.moodtracker.service;

import com.moodtracker.dto.RescheduleSuggestionResponse;
import com.moodtracker.model.Mood;
import com.moodtracker.model.Task;
import com.moodtracker.model.UserPreferences;
import com.moodtracker.model.UserProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReschedulingService {
    private static final DateTimeFormatter DISPLAY_FORMAT = DateTimeFormatter.ofPattern("EEE, MMM d 'at' h:mm a");
    private static final int MAX_LOOKAHEAD_DAYS = 7;
    private static final int SLOT_MINUTES = 30;

    private final TaskService taskService;
    private final MoodService moodService;
    private final UserPreferencesService userPreferencesService;
    private final UserProfileService userProfileService;

    private final Map<String, LocalDate> suggestionShownDates = new ConcurrentHashMap<>();

    public List<RescheduleSuggestionResponse> getSuggestions(String userId, Optional<String> taskId) {
        LocalDateTime now = LocalDateTime.now();
        List<Task> userTasks = taskService.getUserTasks(userId);
        List<Task> activeTasks = userTasks.stream()
                .filter(task -> task.getStatus() == Task.TaskStatus.PENDING || task.getStatus() == Task.TaskStatus.IN_PROGRESS)
                .collect(Collectors.toList());

        if (taskId.isPresent()) {
            activeTasks = activeTasks.stream()
                    .filter(task -> taskId.get().equals(task.getId()))
                    .collect(Collectors.toList());
        }

        Mood latestMood = moodService.getLatestMood(userId);
        List<Mood> recentMoods = moodService.getUserMoodsBetween(userId, now.minusDays(7), now);
        UserPreferences preferences = userPreferencesService.getUserPreferences(userId);
        UserProfile profile = userProfileService.getUserProfile(userId);
        int pendingTaskCount = (int) activeTasks.stream()
                .filter(task -> task.getStatus() == Task.TaskStatus.PENDING)
                .count();

        List<RescheduleSuggestionResponse> suggestions = new ArrayList<>();
        for (Task task : activeTasks) {
            suggestions.add(evaluateTask(task, activeTasks, latestMood, recentMoods, preferences, profile, pendingTaskCount, now));
        }
        return suggestions;
    }

    public void dismissSuggestion(String taskId) {
        suggestionShownDates.put(taskId, LocalDate.now());
    }

    private RescheduleSuggestionResponse evaluateTask(
            Task task,
            List<Task> userTasks,
            Mood latestMood,
            List<Mood> recentMoods,
            UserPreferences preferences,
            UserProfile profile,
            int pendingTaskCount,
            LocalDateTime now
    ) {
        Map<String, Object> signals = new HashMap<>();
        Task.Difficulty difficulty = task.getDifficulty() == null ? Task.Difficulty.MEDIUM : task.getDifficulty();
        Mood.MoodType moodType = latestMood != null ? latestMood.getMoodType() : Mood.MoodType.NEUTRAL;
        boolean lowEnergyCyclePhase = isLowEnergyCyclePhase(profile, now.toLocalDate());
        boolean badMood = isBadMood(moodType);
        boolean scheduledToday = task.getScheduledTime() != null && task.getScheduledTime().toLocalDate().equals(now.toLocalDate());
        boolean pendingTask = task.getStatus() == Task.TaskStatus.PENDING;
        boolean alreadyShownToday = isAlreadyShownToday(task.getId(), now.toLocalDate());
        boolean withinRescheduleLimit = task.getSafeRescheduleCount() < task.getSafeMaxReschedules();
        boolean deadlineAllowsReschedule = task.getDeadline() == null || task.getDeadline().isAfter(now);
        double score = calculateContextScore(moodType, recentMoods, difficulty, pendingTaskCount, lowEnergyCyclePhase);

        signals.put("currentMood", moodType);
        signals.put("lowEnergyCyclePhase", lowEnergyCyclePhase);
        signals.put("badMood", badMood);
        signals.put("scheduledToday", scheduledToday);
        signals.put("pendingTask", pendingTask);
        signals.put("alreadyShownToday", alreadyShownToday);
        signals.put("withinRescheduleLimit", withinRescheduleLimit);
        signals.put("deadlineAllowsReschedule", deadlineAllowsReschedule);
        signals.put("taskType", task.getEffectiveTaskType());
        signals.put("flexibility", task.getEffectiveFlexibility());

        boolean contextTrigger = (badMood || lowEnergyCyclePhase) && pendingTask && scheduledToday;
        boolean eligible = task.getEffectiveTaskType() == Task.TaskType.TASK
                && Boolean.TRUE.equals(task.isReschedulable())
                && withinRescheduleLimit
                && deadlineAllowsReschedule
                && !alreadyShownToday;

        List<String> constraints = buildConstraints(task);
        List<RescheduleSuggestionResponse.RescheduleOption> options = List.of();
        String blockedReason = determineBlockedReason(
                task,
                alreadyShownToday,
                withinRescheduleLimit,
                deadlineAllowsReschedule,
                scheduledToday,
                pendingTask,
                badMood,
                lowEnergyCyclePhase
        );

        if (contextTrigger && eligible) {
            options = buildSuggestedOptions(task, userTasks, preferences, now);
            if (options.isEmpty()) {
                eligible = false;
                blockedReason = "No conflict-free slots are available before the deadline.";
            }
        }

        boolean shouldSuggest = contextTrigger && eligible;
        if (task.getId() != null && shouldSuggest) {
            suggestionShownDates.put(task.getId(), now.toLocalDate());
        }

        return RescheduleSuggestionResponse.builder()
                .taskId(task.getId())
                .taskTitle(task.getTitle())
                .rescheduleLikelihoodScore(Math.min(100.0, Math.max(0.0, score)))
                .shouldSuggestReschedule(shouldSuggest)
                .blocked(contextTrigger && !shouldSuggest)
                .reason(buildReason(shouldSuggest, blockedReason, moodType, difficulty, lowEnergyCyclePhase, task))
                .blockedReason(blockedReason)
                .mood(moodType.name())
                .energyLevel(resolveEnergyLevel(moodType, lowEnergyCyclePhase))
                .evaluatedAt(now)
                .rescheduleCount(task.getSafeRescheduleCount())
                .maxReschedules(task.getSafeMaxReschedules())
                .reschedulesRemaining(Math.max(0, task.getSafeMaxReschedules() - task.getSafeRescheduleCount()))
                .constraints(constraints)
                .suggestedOptions(options)
                .signals(signals)
                .build();
    }

    private double calculateContextScore(
            Mood.MoodType moodType,
            List<Mood> recentMoods,
            Task.Difficulty difficulty,
            int pendingTaskCount,
            boolean lowEnergyCyclePhase
    ) {
        double score = switch (moodType) {
            case TIRED, CRAMPY -> 70;
            case SAD, MOODY -> 58;
            case OKISH, NEUTRAL -> 35;
            case FOCUSED, ENERGETIC -> 10;
            case HAPPY -> 18;
        };
        score += getRecentMoodPenalty(recentMoods);
        score += switch (difficulty) {
            case HIGH -> 18;
            case MEDIUM -> 10;
            case LOW -> 5;
            case VERY_LOW -> 0;
        };
        score += pendingTaskCount >= 6 ? 10 : pendingTaskCount >= 4 ? 5 : 0;
        if (lowEnergyCyclePhase) {
            score += 12;
        }
        return score;
    }

    private double getRecentMoodPenalty(List<Mood> recentMoods) {
        if (recentMoods == null || recentMoods.isEmpty()) {
            return 0.0;
        }
        double averageMood = recentMoods.stream()
                .limit(5)
                .mapToInt(mood -> mood.getMoodType().getNumericValue())
                .average()
                .orElse(3.0);

        if (averageMood <= 2.0) {
            return 18.0;
        }
        if (averageMood <= 2.5) {
            return 10.0;
        }
        return 0.0;
    }

    private boolean isBadMood(Mood.MoodType moodType) {
        return switch (moodType) {
            case SAD, MOODY, CRAMPY, TIRED -> true;
            default -> false;
        };
    }

    private boolean isLowEnergyCyclePhase(UserProfile profile, LocalDate currentDate) {
        if (profile == null || !profile.isCycleTracking() || profile.getLastPeriodDate() == null) {
            return false;
        }
        int cycleLength = profile.getCycleLength() > 0 ? profile.getCycleLength() : 28;
        int periodLength = profile.getPeriodLength() > 0 ? profile.getPeriodLength() : 5;
        long daysSinceLastPeriod = java.time.temporal.ChronoUnit.DAYS.between(profile.getLastPeriodDate(), currentDate);
        if (daysSinceLastPeriod < 0) {
            return false;
        }
        long cycleDay = daysSinceLastPeriod % cycleLength;
        return cycleDay < periodLength || cycleDay >= cycleLength - 2;
    }

    private boolean isAlreadyShownToday(String taskId, LocalDate currentDate) {
        if (taskId == null) {
            return false;
        }
        return currentDate.equals(suggestionShownDates.get(taskId));
    }

    private String determineBlockedReason(
            Task task,
            boolean alreadyShownToday,
            boolean withinRescheduleLimit,
            boolean deadlineAllowsReschedule,
            boolean scheduledToday,
            boolean pendingTask,
            boolean badMood,
            boolean lowEnergyCyclePhase
    ) {
        if (task.getEffectiveTaskType() == Task.TaskType.ROUTINE) {
            return "Routines are fixed in place. If today is hard, allow a skip instead of a reschedule.";
        }
        if (alreadyShownToday) {
            return "A rescheduling suggestion was already shown for this task today.";
        }
        if (!withinRescheduleLimit) {
            return "This task has already used all of its allowed reschedules.";
        }
        if (!deadlineAllowsReschedule) {
            return "This task cannot move because its deadline has already arrived.";
        }
        if (!pendingTask) {
            return "Only pending tasks can receive a context-based reschedule prompt.";
        }
        if (!scheduledToday) {
            return "This prompt only appears for tasks scheduled for today.";
        }
        if (!(badMood || lowEnergyCyclePhase)) {
            return "Your current context does not require a reschedule suggestion right now.";
        }
        return null;
    }

    private String buildReason(
            boolean shouldSuggest,
            String blockedReason,
            Mood.MoodType moodType,
            Task.Difficulty difficulty,
            boolean lowEnergyCyclePhase,
            Task task
    ) {
        if (!shouldSuggest) {
            if (blockedReason != null && !blockedReason.isBlank()) {
                return blockedReason;
            }
            if (moodType == Mood.MoodType.FOCUSED || moodType == Mood.MoodType.ENERGETIC || moodType == Mood.MoodType.HAPPY) {
                return "You seem in a good state to keep working on this task right now.";
            }
            return "This task does not currently need a rescheduling prompt.";
        }

        if (lowEnergyCyclePhase) {
            return String.format(
                    "You seem low today, and %s may fit better in a lighter slot. You still have %d reschedules left.",
                    task.getTitle(),
                    Math.max(0, task.getSafeMaxReschedules() - task.getSafeRescheduleCount())
            );
        }

        return String.format(
                "You seem a bit low on energy right now. This %s-effort task may be easier to handle in a different slot.",
                difficulty.name().toLowerCase()
        );
    }

    private List<String> buildConstraints(Task task) {
        List<String> constraints = new ArrayList<>();
        constraints.add(String.format("%d reschedules remaining", Math.max(0, task.getSafeMaxReschedules() - task.getSafeRescheduleCount())));
        if (task.getDeadline() != null) {
            constraints.add("Cannot exceed deadline");
        }
        constraints.add("Conflicts with other scheduled tasks are blocked");
        if (task.getEffectiveTaskType() == Task.TaskType.ROUTINE) {
            constraints.add("Routines cannot be rescheduled");
        }
        return constraints;
    }

    private String resolveEnergyLevel(Mood.MoodType moodType, boolean lowEnergyCyclePhase) {
        if (lowEnergyCyclePhase || moodType == Mood.MoodType.TIRED || moodType == Mood.MoodType.CRAMPY) {
            return "LOW";
        }
        if (moodType == Mood.MoodType.ENERGETIC || moodType == Mood.MoodType.FOCUSED || moodType == Mood.MoodType.HAPPY) {
            return "HIGH";
        }
        return "MEDIUM";
    }

    private List<RescheduleSuggestionResponse.RescheduleOption> buildSuggestedOptions(
            Task task,
            List<Task> userTasks,
            UserPreferences preferences,
            LocalDateTime now
    ) {
        List<LocalDateTime> candidates = generateCandidateSlots(task, userTasks, preferences, now);
        LocalDateTime originalTime = task.getScheduledTime() != null ? task.getScheduledTime() : now;
        int preferredHour = getPreferredHour(userTasks, preferences);

        return candidates.stream()
                .sorted(Comparator.comparingDouble(slot -> scoreSlot(slot, originalTime, preferredHour, userTasks)))
                .limit(3)
                .map(slot -> toOption(task, slot, originalTime.toLocalDate()))
                .collect(Collectors.toList());
    }

    private List<LocalDateTime> generateCandidateSlots(
            Task task,
            List<Task> userTasks,
            UserPreferences preferences,
            LocalDateTime now
    ) {
        List<LocalDateTime> candidates = new ArrayList<>();
        LocalTime workStart = parseTime(preferences.getWorkStartTime(), LocalTime.of(9, 0));
        LocalTime workEnd = parseTime(preferences.getWorkEndTime(), LocalTime.of(17, 0));
        LocalDateTime lowerBound = now.plusHours(1).withSecond(0).withNano(0);
        LocalDateTime upperBound = task.getDeadline() != null ? task.getDeadline() : now.plusDays(MAX_LOOKAHEAD_DAYS);

        for (int dayOffset = 1; dayOffset <= MAX_LOOKAHEAD_DAYS; dayOffset++) {
            LocalDate date = now.toLocalDate().plusDays(dayOffset);
            if (date.atTime(workStart).isAfter(upperBound)) {
                break;
            }
            LocalDateTime slot = date.atTime(workStart);
            while (!slot.toLocalTime().isAfter(workEnd.minusMinutes(60))) {
                if (!slot.isBefore(lowerBound)
                        && !slot.isAfter(upperBound)
                        && !taskConflicts(task, userTasks, slot)) {
                    candidates.add(slot);
                }
                slot = slot.plusMinutes(SLOT_MINUTES);
            }
        }

        return candidates.stream().distinct().collect(Collectors.toList());
    }

    private boolean taskConflicts(Task currentTask, List<Task> userTasks, LocalDateTime slot) {
        return userTasks.stream()
                .filter(task -> task.getId() != null && !task.getId().equals(currentTask.getId()))
                .anyMatch(task -> {
                    LocalDateTime scheduledTime = task.getScheduledTime();
                    return scheduledTime != null && Duration.between(scheduledTime, slot).abs().toMinutes() < 60;
                });
    }

    private int getPreferredHour(List<Task> userTasks, UserPreferences preferences) {
        return userTasks.stream()
                .map(Task::getScheduledTime)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(LocalDateTime::getHour, Collectors.counting()))
                .entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(parseTime(preferences.getWorkStartTime(), LocalTime.of(9, 0)).getHour());
    }

    private double scoreSlot(LocalDateTime slot, LocalDateTime originalTime, int preferredHour, List<Task> userTasks) {
        long minutesFromOriginal = Duration.between(originalTime, slot).abs().toMinutes();
        long dayLoad = userTasks.stream()
                .map(task -> task.getScheduledTime() != null ? task.getScheduledTime() : task.getDeadline())
                .filter(Objects::nonNull)
                .filter(time -> time.toLocalDate().equals(slot.toLocalDate()))
                .count();
        long preferredPenalty = Math.abs(slot.getHour() - preferredHour) * 20L;
        return minutesFromOriginal + preferredPenalty + (dayLoad * 30.0);
    }

    private RescheduleSuggestionResponse.RescheduleOption toOption(Task task, LocalDateTime slot, LocalDate originalDate) {
        boolean nextDaySameDate = slot.toLocalDate().equals(originalDate.plusDays(1));
        String label = nextDaySameDate ? "Move to same time tomorrow" : "Move to " + slot.format(DISPLAY_FORMAT);
        return RescheduleSuggestionResponse.RescheduleOption.builder()
                .type(nextDaySameDate ? "time" : "day")
                .label(label)
                .value(label)
                .scheduledTime(slot)
                .build();
    }

    private LocalTime parseTime(String value, LocalTime fallback) {
        try {
            return value != null ? LocalTime.parse(value) : fallback;
        } catch (Exception ignored) {
            return fallback;
        }
    }
}
