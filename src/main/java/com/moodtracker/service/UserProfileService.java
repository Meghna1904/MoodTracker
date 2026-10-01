package com.moodtracker.service;

import com.moodtracker.model.UserProfile;
import com.moodtracker.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserProfileService {
    private final UserProfileRepository profileRepository;
    private final StorageService storageService;

    public UserProfile getUserProfile(String userId) {
        return profileRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultProfile(userId));
    }

    @Transactional
    public UserProfile updateUserProfile(UserProfile profile) {
        UserProfile existing = profileRepository.findByUserId(profile.getUserId())
                .orElseGet(() -> new UserProfile());
        existing.setUserId(profile.getUserId());
        
        // Update basic information
        existing.setFirstName(profile.getFirstName());
        existing.setLastName(profile.getLastName());
        existing.setEmail(profile.getEmail());
        existing.setPhone(profile.getPhone());
        existing.setDateOfBirth(profile.getDateOfBirth());
        existing.setGender(profile.getGender());
        existing.setBio(profile.getBio());
        
        // Update health information
        existing.setHealthConditions(profile.getHealthConditions());
        existing.setMedications(profile.getMedications());
        existing.setAllergies(profile.getAllergies());
        
        // Update emergency contact
        existing.setEmergencyContactName(profile.getEmergencyContactName());
        existing.setEmergencyContactPhone(profile.getEmergencyContactPhone());
        existing.setEmergencyContactRelation(profile.getEmergencyContactRelation());

        return profileRepository.save(existing);
    }

    @Transactional
    public UserProfile updateProfilePicture(String userId, MultipartFile file) {
        UserProfile profile = getUserProfile(userId);
        
        // Delete old avatar if exists
        if (profile.getAvatarUrl() != null) {
            storageService.deleteFile(profile.getAvatarUrl());
        }
        
        // Generate unique filename
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        String avatarUrl = storageService.uploadFile(file, filename);
        
        profile.setAvatarUrl(avatarUrl);
        return profileRepository.save(profile);
    }

    @Transactional
    public UserProfile updateCycleTracking(String userId, int cycleLength, int periodLength, String lastPeriodDate) {
        UserProfile profile = getUserProfile(userId);
        profile.setCycleTracking(true);
        profile.setCycleLength(cycleLength);
        profile.setPeriodLength(periodLength);
        profile.setLastPeriodDate(LocalDate.parse(lastPeriodDate));
        return profileRepository.save(profile);
    }

    private UserProfile createDefaultProfile(String userId) {
        UserProfile profile = new UserProfile();
        profile.setUserId(userId);
        profile.setCycleTracking(false);
        profile.setCycleLength(28);
        profile.setPeriodLength(5);
        return profileRepository.save(profile);
    }
}
