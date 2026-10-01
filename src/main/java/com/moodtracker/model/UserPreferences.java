package com.moodtracker.model;

import lombok.Data;
import jakarta.persistence.*;

@Data
@Entity
@Table(name = "user_preferences", uniqueConstraints = {
    @UniqueConstraint(name = "uk_preferences_user", columnNames = "user_id")
})
public class UserPreferences {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    // Notification preferences
    private boolean notifications;
    private boolean emailNotifications;
    private boolean taskReminders;
    private boolean moodReminders;
    
    // Appearance preferences
    private boolean darkMode;
    private String language;
    private String timeZone;
    
    // Work schedule preferences
    private String workStartTime;
    private String workEndTime;
    private int breakDuration;
    
    // Task scheduling preferences
    private boolean adaptiveScheduling;
    private boolean moodBasedScheduling;
    private int maxTasksPerDay;
    
    // Privacy preferences
    private boolean shareProfile;
    private boolean shareMoodData;
    private boolean shareTaskData;
}
