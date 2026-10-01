package com.moodtracker.model;

import lombok.Data;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "user_devices", uniqueConstraints = {
    @UniqueConstraint(name = "uk_device_user_token", columnNames = {"user_id", "fcm_token"})
})
public class UserDevice {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @Column(name = "user_id", nullable = false)
    private String userId;
    @Column(name = "fcm_token", nullable = false)
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
