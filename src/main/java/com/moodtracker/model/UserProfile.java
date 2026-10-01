package com.moodtracker.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Data
@Document(collection = "user_profiles")
public class UserProfile {
    @Id
    private String id;
    private String userId;
    
    // Basic information
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String bio;
    
    // Profile picture
    private String avatarUrl;
    
    // Menstrual cycle tracking (for female users)
    private boolean cycleTracking;
    private int cycleLength;
    private int periodLength;
    private LocalDate lastPeriodDate;
    
    // Additional health information
    private String[] healthConditions;
    private String[] medications;
    private String[] allergies;
    
    // Emergency contact
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;
}
