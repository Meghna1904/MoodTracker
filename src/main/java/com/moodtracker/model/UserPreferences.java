package com.moodtracker.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "user_preferences")
public class UserPreferences {
    @Id
    private String id;
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
