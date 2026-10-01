package com.moodtracker.controller;

import com.moodtracker.model.UserPreferences;
import com.moodtracker.service.UserPreferencesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
public class UserPreferencesController {
    private final UserPreferencesService preferencesService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<UserPreferences> getUserPreferences(@PathVariable String userId) {
        return ResponseEntity.ok(preferencesService.getUserPreferences(userId));
    }

    @PutMapping("/user/{userId}")
    public ResponseEntity<UserPreferences> updateUserPreferences(
            @PathVariable String userId,
            @RequestBody UserPreferences preferences) {
        preferences.setUserId(userId);
        return ResponseEntity.ok(preferencesService.updateUserPreferences(preferences));
    }

    @PostMapping("/user/{userId}/notifications")
    public ResponseEntity<UserPreferences> updateNotificationSettings(
            @PathVariable String userId,
            @RequestParam boolean enabled) {
        return ResponseEntity.ok(preferencesService.updateNotificationSettings(userId, enabled));
    }

    @PostMapping("/user/{userId}/theme")
    public ResponseEntity<UserPreferences> updateThemePreference(
            @PathVariable String userId,
            @RequestParam boolean darkMode) {
        return ResponseEntity.ok(preferencesService.updateThemePreference(userId, darkMode));
    }

    @PostMapping("/user/{userId}/workSchedule")
    public ResponseEntity<UserPreferences> updateWorkSchedule(
            @PathVariable String userId,
            @RequestParam String startTime,
            @RequestParam String endTime,
            @RequestParam int breakDuration) {
        return ResponseEntity.ok(preferencesService.updateWorkSchedule(userId, startTime, endTime, breakDuration));
    }
}
