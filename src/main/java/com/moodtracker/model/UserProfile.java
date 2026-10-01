package com.moodtracker.model;

import lombok.Data;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@Data
@Entity
@Table(name = "user_profiles", uniqueConstraints = {
    @UniqueConstraint(name = "uk_profile_user", columnNames = "user_id")
})
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @Column(name = "user_id", nullable = false)
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
    @ElementCollection
    @CollectionTable(name = "user_profile_health_conditions", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "condition_name")
    private List<String> healthConditions;
    @ElementCollection
    @CollectionTable(name = "user_profile_medications", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "medication_name")
    private List<String> medications;
    @ElementCollection
    @CollectionTable(name = "user_profile_allergies", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "allergy_name")
    private List<String> allergies;
    
    // Emergency contact
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;
}
