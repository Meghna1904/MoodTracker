package com.moodtracker.controller;

import com.moodtracker.service.AnalyticsService;
import com.moodtracker.service.AnalyticsService.MoodAnalytics;
import com.moodtracker.service.AnalyticsService.Suggestion;
import com.moodtracker.service.AnalyticsService.TaskAnalytics;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    @GetMapping("/mood/{userId}")
    public ResponseEntity<MoodAnalytics> getMoodAnalytics(
            @PathVariable String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(analyticsService.analyzeMoodTrends(userId, start, end));
    }

    @GetMapping("/tasks/{userId}")
    public ResponseEntity<TaskAnalytics> getTaskAnalytics(
            @PathVariable String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(analyticsService.analyzeTaskPerformance(userId, start, end));
    }

    @GetMapping("/suggestions/{userId}")
    public ResponseEntity<List<Suggestion>> getTaskSuggestions(@PathVariable String userId) {
        LocalDateTime now = LocalDateTime.now();
        return ResponseEntity.ok(analyticsService.getSuggestions(userId, now.minusDays(30), now));
    }
}
