package com.moodtracker.service;

import com.moodtracker.model.Mood;
import com.moodtracker.model.Task;
import com.moodtracker.model.UserPreferences;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskSuggestionService {
    private final TaskService taskService;
    private final MoodService moodService;
    private final UserPreferencesService preferencesService;

    public List<Task> suggestTasksBasedOnMood(String userId) {
        Mood currentMood = moodService.getLatestMood(userId);
        UserPreferences preferences = preferencesService.getUserPreferences(userId);
        List<Task> pendingTasks = taskService.getUserTasks(userId).stream()
                .filter(task -> task.getStatus() == Task.TaskStatus.PENDING)
                .collect(Collectors.toList());

        return optimizeTaskSchedule(pendingTasks, currentMood, preferences);
    }

    private List<Task> optimizeTaskSchedule(List<Task> tasks, Mood currentMood, UserPreferences preferences) {
        // Convert work hours to LocalTime
        LocalTime workStart = LocalTime.parse(preferences.getWorkStartTime());
        LocalTime workEnd = LocalTime.parse(preferences.getWorkEndTime());
        LocalDateTime now = LocalDateTime.now();

        // Calculate available time slots
        List<TimeSlot> timeSlots = generateTimeSlots(workStart, workEnd, preferences.getBreakDuration());

        // Score tasks based on mood and priority
        List<ScoredTask> scoredTasks = tasks.stream()
                .map(task -> scoreTask(task, currentMood))
                .sorted(Comparator.comparing(ScoredTask::getScore).reversed())
                .collect(Collectors.toList());

        // Assign tasks to time slots
        return assignTasksToTimeSlots(scoredTasks, timeSlots, preferences.getMaxTasksPerDay());
    }

    private List<TimeSlot> generateTimeSlots(LocalTime workStart, LocalTime workEnd, int breakDuration) {
        List<TimeSlot> slots = new ArrayList<>();
        LocalTime current = workStart;

        while (current.plusMinutes(30).isBefore(workEnd)) {
            // Add 30-minute slots
            slots.add(new TimeSlot(current, current.plusMinutes(30)));
            current = current.plusMinutes(30);

            // Add break if needed
            if (current.getHour() == 13) { // Lunch break
                current = current.plusMinutes(breakDuration);
            }
        }

        return slots;
    }

    private ScoredTask scoreTask(Task task, Mood mood) {
        double score = 0.0;

        // Base score from priority
        switch (task.getPriority()) {
            case HIGH:
                score += 3.0;
                break;
            case MEDIUM:
                score += 2.0;
                break;
            case LOW:
                score += 1.0;
                break;
        }

        // Adjust score based on mood
        switch (mood.getMoodType()) {
            case HAPPY:
            case ENERGETIC:
                // When happy/energetic, prioritize challenging tasks
                if (task.getDifficulty() == Task.Difficulty.HIGH) {
                    score *= 1.5;
                }
                break;
            case SAD:
            case MOODY:
                // When sad/moody, prioritize easier, more achievable tasks
                if (task.getDifficulty() == Task.Difficulty.LOW) {
                    score *= 1.3;
                }
                break;
            case TIRED:
                // When tired, significantly prefer easier tasks
                if (task.getDifficulty() == Task.Difficulty.LOW || 
                    task.getDifficulty() == Task.Difficulty.VERY_LOW) {
                    score *= 1.8;
                }
                break;
            case FOCUSED:
                // When focused, slightly prefer challenging tasks
                if (task.getDifficulty() == Task.Difficulty.HIGH || 
                    task.getDifficulty() == Task.Difficulty.MEDIUM) {
                    score *= 1.3;
                }
                break;
            default:
                // No adjustment for neutral mood
                break;
        }

        // Deadline adjustment
        if (task.getDeadline() != null) {
            LocalDateTime now = LocalDateTime.now();
            long hoursUntilDue = java.time.Duration.between(now, task.getDeadline()).toHours();
            if (hoursUntilDue < 24) {
                score *= 2.0; // Urgent tasks get double score
            } else if (hoursUntilDue < 48) {
                score *= 1.5; // Soon-due tasks get 50% boost
            }
        }

        return new ScoredTask(task, score);
    }

    private List<Task> assignTasksToTimeSlots(List<ScoredTask> scoredTasks, List<TimeSlot> timeSlots, int maxTasks) {
        List<Task> scheduledTasks = new ArrayList<>();
        int currentSlot = 0;

        for (ScoredTask scoredTask : scoredTasks) {
            if (scheduledTasks.size() >= maxTasks || currentSlot >= timeSlots.size()) {
                break;
            }

            Task task = scoredTask.getTask();
            TimeSlot slot = timeSlots.get(currentSlot);

            // Set suggested start time
            task.setSuggestedStartTime(LocalDateTime.now()
                .withHour(slot.getStart().getHour())
                .withMinute(slot.getStart().getMinute()));

            scheduledTasks.add(task);
            currentSlot++;
        }

        return scheduledTasks;
    }

    @Value
    private static class TimeSlot {
        LocalTime start;
        LocalTime end;
    }

    @Value
    private static class ScoredTask {
        Task task;
        double score;
    }
}
