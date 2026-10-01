package com.moodtracker.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "user_devices")
public class UserDevice {
    @Id
    private String id;
    private String userId;
    private String fcmToken;
    private String deviceType; // IOS, ANDROID
    private String deviceModel;
    private String osVersion;
    private String appVersion;
    private LocalDateTime lastActive;
    private boolean notificationsEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
