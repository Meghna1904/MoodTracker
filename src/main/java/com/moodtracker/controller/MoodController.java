package com.moodtracker.controller;

import com.moodtracker.model.Mood;
import com.moodtracker.service.MoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/moods")
@RequiredArgsConstructor
public class MoodController {
    private final MoodService moodService;

    @PostMapping
    public ResponseEntity<Mood> recordMood(@RequestBody Mood mood) {
        return ResponseEntity.ok(moodService.recordMood(mood));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Mood>> getUserMoods(@PathVariable String userId) {
        return ResponseEntity.ok(moodService.getUserMoods(userId));
    }

    @GetMapping("/user/{userId}/range")
    public ResponseEntity<List<Mood>> getUserMoodsBetween(
            @PathVariable String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(moodService.getUserMoodsBetween(userId, start, end));
    }

    @GetMapping("/user/{userId}/latest")
    public ResponseEntity<Mood> getLatestMood(@PathVariable String userId) {
        return ResponseEntity.ok(moodService.getLatestMood(userId));
    }
}
