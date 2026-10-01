package com.moodtracker.service;

import com.google.firebase.messaging.*;
import com.moodtracker.model.UserDevice;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
@Slf4j
@RequiredArgsConstructor
public class PushNotificationService {
    private final UserDeviceService userDeviceService;

    public void sendPushNotification(String userId, String title, String body, NotificationType type) {
        List<UserDevice> devices = userDeviceService.getUserDevices(userId);
        
        for (UserDevice device : devices) {
            Message message = Message.builder()
                .setNotification(Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build())
                .putData("type", type.toString())
                .setToken(device.getFcmToken())
                .setApnsConfig(ApnsConfig.builder()
                    .setAps(Aps.builder()
                        .setSound("default")
                        .setBadge(1)
                        .build())
                    .build())
                .setAndroidConfig(AndroidConfig.builder()
                    .setNotification(AndroidNotification.builder()
                        .setSound("default")
                        .setClickAction("OPEN_APP")
                        .build())
                    .setPriority(AndroidConfig.Priority.HIGH)
                    .build())
                .build();

        try {
            String response = FirebaseMessaging.getInstance().sendAsync(message).get();
            log.info("Successfully sent notification to device {}: {}", device.getFcmToken(), response);
        } catch (ExecutionException | InterruptedException e) {
            log.error("Failed to send notification to device {}", device.getFcmToken(), e);
            if (e instanceof ExecutionException && 
                e.getCause() instanceof FirebaseMessagingException &&
                ((FirebaseMessagingException) e.getCause()).getMessagingErrorCode() == 
                    MessagingErrorCode.UNREGISTERED) {
                userDeviceService.removeDevice(device.getId());
            }
        }
    }
}

    public void sendTaskReminder(String userId, String taskTitle, String dueTime) {
        String title = "Task Due Soon";
        String body = String.format("'%s' is due %s", taskTitle, dueTime);
        sendPushNotification(userId, title, body, NotificationType.TASK_REMINDER);
    }

    public void sendMoodCheckReminder(String userId) {
        String title = "Mood Check-in Time";
        String body = "How are you feeling? Take a moment to check in.";
        sendPushNotification(userId, title, body, NotificationType.MOOD_REMINDER);
    }

    public void sendMoodSuggestion(String userId, String suggestion) {
        String title = "Mood-Based Suggestion";
        sendPushNotification(userId, title, suggestion, NotificationType.MOOD_SUGGESTION);
    }

    public void sendTaskSuggestion(String userId, String taskTitle) {
        String title = "Task Suggestion";
        String body = String.format("Based on your current mood, we suggest working on '%s'", taskTitle);
        sendPushNotification(userId, title, body, NotificationType.TASK_SUGGESTION);
    }

    public enum NotificationType {
        TASK_REMINDER,
        MOOD_REMINDER,
        MOOD_SUGGESTION,
        TASK_SUGGESTION
    }
}
