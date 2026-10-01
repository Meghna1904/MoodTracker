package com.moodtracker.service;

import com.moodtracker.model.Task;
import com.moodtracker.model.UserPreferences;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final TaskService taskService;
    private final UserPreferencesService preferencesService;
    private final EmailService emailService;
    private final WebSocketService webSocketService;

    // Cache to prevent duplicate notifications
    private final ConcurrentMap<String, LocalDateTime> lastNotificationSent = new ConcurrentHashMap<>();

    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    public void checkAndSendTaskReminders() {
        LocalDateTime now = LocalDateTime.now();
        List<Task> upcomingTasks = taskService.getAllUpcomingTasks();

        for (Task task : upcomingTasks) {
            UserPreferences preferences = preferencesService.getUserPreferences(task.getUserId());
            
            if (!preferences.isTaskReminders()) {
                continue;
            }

            if (shouldSendTaskReminder(task, now)) {
                sendTaskReminder(task, preferences);
            }
        }
    }

    @Scheduled(cron = "0 0 10,15,20 * * *") // Run at 10 AM, 3 PM, and 8 PM
    public void checkAndSendMoodReminders() {
        LocalDateTime now = LocalDateTime.now();
        
        preferencesService.getAllUserPreferences().stream()
            .filter(UserPreferences::isMoodReminders)
            .forEach(preferences -> {
                String userId = preferences.getUserId();
                if (shouldSendMoodReminder(userId, now)) {
                    sendMoodReminder(userId, preferences);
                }
            });
    }

    public void sendTaskCreatedNotification(Task task) {
        UserPreferences preferences = preferencesService.getUserPreferences(task.getUserId());
        
        if (preferences.isNotifications()) {
            NotificationPayload payload = NotificationPayload.builder()
                .type(NotificationType.TASK_CREATED)
                .title("New Task Created")
                .message("Task '" + task.getTitle() + "' has been created")
                .data(task)
                .build();

            sendNotification(task.getUserId(), payload, preferences);
        }
    }

    public void sendTaskDueNotification(Task task) {
        UserPreferences preferences = preferencesService.getUserPreferences(task.getUserId());
        
        if (preferences.isNotifications()) {
            NotificationPayload payload = NotificationPayload.builder()
                .type(NotificationType.TASK_DUE)
                .title("Task Due Soon")
                .message("Task '" + task.getTitle() + "' is due in " + 
                        getTimeUntilDue(task.getDeadline()))
                .data(task)
                .build();

            sendNotification(task.getUserId(), payload, preferences);
        }
    }

    public void sendMoodSuggestionNotification(String userId, String suggestion) {
        UserPreferences preferences = preferencesService.getUserPreferences(userId);
        
        if (preferences.isNotifications()) {
            NotificationPayload payload = NotificationPayload.builder()
                .type(NotificationType.MOOD_SUGGESTION)
                .title("Mood Check-in Suggestion")
                .message(suggestion)
                .build();

            sendNotification(userId, payload, preferences);
        }
    }

    private boolean shouldSendTaskReminder(Task task, LocalDateTime now) {
        if (task.getDeadline() == null || task.getStatus() == Task.TaskStatus.COMPLETED) {
            return false;
        }

        String notificationKey = "task_" + task.getId();
        LocalDateTime lastSent = lastNotificationSent.get(notificationKey);
        
        if (lastSent != null && lastSent.plusHours(1).isAfter(now)) {
            return false;
        }

        long minutesUntilDue = java.time.Duration.between(now, task.getDeadline()).toMinutes();
        return minutesUntilDue <= 60 && minutesUntilDue > 0;
    }

    private boolean shouldSendMoodReminder(String userId, LocalDateTime now) {
        String notificationKey = "mood_" + userId;
        LocalDateTime lastSent = lastNotificationSent.get(notificationKey);
        
        if (lastSent != null && lastSent.plusHours(4).isAfter(now)) {
            return false;
        }

        return true;
    }

    private void sendTaskReminder(Task task, UserPreferences preferences) {
        NotificationPayload payload = NotificationPayload.builder()
            .type(NotificationType.TASK_REMINDER)
            .title("Task Reminder")
            .message("Don't forget: '" + task.getTitle() + "' is due " + 
                    getTimeUntilDue(task.getDeadline()))
            .data(task)
            .build();

        sendNotification(task.getUserId(), payload, preferences);
        lastNotificationSent.put("task_" + task.getId(), LocalDateTime.now());
    }

    private void sendMoodReminder(String userId, UserPreferences preferences) {
        NotificationPayload payload = NotificationPayload.builder()
            .type(NotificationType.MOOD_REMINDER)
            .title("Mood Check-in")
            .message("How are you feeling? Take a moment to check in.")
            .build();

        sendNotification(userId, payload, preferences);
        lastNotificationSent.put("mood_" + userId, LocalDateTime.now());
    }

    private void sendNotification(String userId, NotificationPayload payload, UserPreferences preferences) {
        // Send real-time notification via WebSocket
        webSocketService.sendNotification(userId, payload);

        // Send email notification if enabled
        if (preferences.isEmailNotifications()) {
            emailService.sendNotificationEmail(userId, payload);
        }
    }

    private String getTimeUntilDue(LocalDateTime deadline) {
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(now, deadline).toMinutes();
        
        if (minutes < 60) {
            return minutes + " minutes";
        } else if (minutes < 1440) {
            return (minutes / 60) + " hours";
        } else {
            return (minutes / 1440) + " days";
        }
    }

    @lombok.Builder
    @lombok.Data
    public static class NotificationPayload {
        private NotificationType type;
        private String title;
        private String message;
        private Object data;
    }

    public enum NotificationType {
        TASK_CREATED,
        TASK_REMINDER,
        TASK_DUE,
        MOOD_REMINDER,
        MOOD_SUGGESTION
    }
}
