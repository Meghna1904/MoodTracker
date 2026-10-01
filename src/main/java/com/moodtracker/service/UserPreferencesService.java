package com.moodtracker.service;

import com.moodtracker.model.UserPreferences;
import com.moodtracker.repository.UserPreferencesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserPreferencesService {
    private final UserPreferencesRepository preferencesRepository;

    public UserPreferences getUserPreferences(String userId) {
        return preferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));
    }

    public List<UserPreferences> getAllUserPreferences() {
        return preferencesRepository.findAll();
    }

    @Transactional
    public UserPreferences updateUserPreferences(UserPreferences preferences) {
        UserPreferences existing = preferencesRepository.findByUserId(preferences.getUserId())
                .orElseGet(() -> new UserPreferences());
        existing.setUserId(preferences.getUserId());
        
        // Update all fields
        existing.setNotifications(preferences.isNotifications());
        existing.setEmailNotifications(preferences.isEmailNotifications());
        existing.setTaskReminders(preferences.isTaskReminders());
        existing.setMoodReminders(preferences.isMoodReminders());
        existing.setDarkMode(preferences.isDarkMode());
        existing.setLanguage(preferences.getLanguage());
        existing.setTimeZone(preferences.getTimeZone());
        existing.setWorkStartTime(preferences.getWorkStartTime());
        existing.setWorkEndTime(preferences.getWorkEndTime());
        existing.setBreakDuration(preferences.getBreakDuration());
        existing.setAdaptiveScheduling(preferences.isAdaptiveScheduling());
        existing.setMoodBasedScheduling(preferences.isMoodBasedScheduling());
        existing.setMaxTasksPerDay(preferences.getMaxTasksPerDay());
        existing.setShareProfile(preferences.isShareProfile());
        existing.setShareMoodData(preferences.isShareMoodData());
        existing.setShareTaskData(preferences.isShareTaskData());

        return preferencesRepository.save(existing);
    }

    @Transactional
    public UserPreferences updateNotificationSettings(String userId, boolean enabled) {
        UserPreferences preferences = getUserPreferences(userId);
        preferences.setNotifications(enabled);
        preferences.setEmailNotifications(enabled);
        preferences.setTaskReminders(enabled);
        preferences.setMoodReminders(enabled);
        return preferencesRepository.save(preferences);
    }

    @Transactional
    public UserPreferences updateThemePreference(String userId, boolean darkMode) {
        UserPreferences preferences = getUserPreferences(userId);
        preferences.setDarkMode(darkMode);
        return preferencesRepository.save(preferences);
    }

    @Transactional
    public UserPreferences updateWorkSchedule(String userId, String startTime, String endTime, int breakDuration) {
        UserPreferences preferences = getUserPreferences(userId);
        preferences.setWorkStartTime(startTime);
        preferences.setWorkEndTime(endTime);
        preferences.setBreakDuration(breakDuration);
        return preferencesRepository.save(preferences);
    }

    private UserPreferences createDefaultPreferences(String userId) {
        UserPreferences preferences = new UserPreferences();
        preferences.setUserId(userId);
        preferences.setNotifications(true);
        preferences.setEmailNotifications(true);
        preferences.setTaskReminders(true);
        preferences.setMoodReminders(true);
        preferences.setDarkMode(false);
        preferences.setLanguage("en");
        preferences.setTimeZone("UTC+5:30");
        preferences.setWorkStartTime("09:00");
        preferences.setWorkEndTime("17:00");
        preferences.setBreakDuration(30);
        preferences.setAdaptiveScheduling(true);
        preferences.setMoodBasedScheduling(true);
        preferences.setMaxTasksPerDay(10);
        preferences.setShareProfile(false);
        preferences.setShareMoodData(false);
        preferences.setShareTaskData(false);
        return preferencesRepository.save(preferences);
    }
}
