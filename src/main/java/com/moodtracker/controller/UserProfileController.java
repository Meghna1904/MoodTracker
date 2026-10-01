package com.moodtracker.controller;

import com.moodtracker.model.UserProfile;
import com.moodtracker.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {
    private final UserProfileService profileService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<UserProfile> getUserProfile(@PathVariable String userId) {
        return ResponseEntity.ok(profileService.getUserProfile(userId));
    }

    @PutMapping("/user/{userId}")
    public ResponseEntity<UserProfile> updateUserProfile(
            @PathVariable String userId,
            @RequestBody UserProfile profile) {
        profile.setUserId(userId);
        return ResponseEntity.ok(profileService.updateUserProfile(profile));
    }

    @PostMapping(value = "/user/{userId}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserProfile> updateProfilePicture(
            @PathVariable String userId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(profileService.updateProfilePicture(userId, file));
    }

    @PostMapping("/user/{userId}/cycle")
    public ResponseEntity<UserProfile> updateCycleTracking(
            @PathVariable String userId,
            @RequestParam int cycleLength,
            @RequestParam int periodLength,
            @RequestParam String lastPeriodDate) {
        return ResponseEntity.ok(profileService.updateCycleTracking(userId, cycleLength, periodLength, lastPeriodDate));
    }
}
