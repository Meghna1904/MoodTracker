package com.moodtracker.controller;

import com.moodtracker.dto.ApplyRescheduleRequest;
import com.moodtracker.dto.RescheduleSuggestionResponse;
import com.moodtracker.model.Task;
import com.moodtracker.service.ReschedulingService;
import com.moodtracker.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;
    private final ReschedulingService reschedulingService;

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        return ResponseEntity.ok(taskService.createTask(task));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<Task> getTask(@PathVariable String taskId) {
        return ResponseEntity.ok(taskService.getTaskById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found")));
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<Task> updateTask(
            @PathVariable String taskId,
            @RequestBody Task taskDetails) {
        return ResponseEntity.ok(taskService.updateTask(taskId, taskDetails));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable String taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Task>> getUserTasks(@PathVariable String userId) {
        return ResponseEntity.ok(taskService.getUserTasks(userId));
    }

    @GetMapping("/user/{userId}/pending")
    public ResponseEntity<List<Task>> getPendingTasks(@PathVariable String userId) {
        return ResponseEntity.ok(taskService.getPendingTasks(userId));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Task>> getAllUpcomingTasks() {
        return ResponseEntity.ok(taskService.getAllUpcomingTasks());
    }

    @PutMapping("/{taskId}/status")
    public ResponseEntity<Task> updateTaskStatus(
            @PathVariable String taskId,
            @RequestParam Task.TaskStatus status) {
        return ResponseEntity.ok(taskService.updateTaskStatus(taskId, status));
    }

    @PostMapping("/user/{userId}/reschedule")
    public ResponseEntity<List<Task>> rescheduleTasksBasedOnMood(@PathVariable String userId) {
        return ResponseEntity.ok(taskService.rescheduleTasksBasedOnMood(userId));
    }

    @GetMapping("/user/{userId}/range")
    public ResponseEntity<List<Task>> getTasksForTimeRange(
            @PathVariable String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(taskService.getTasksForTimeRange(userId, start, end));
    }

    @GetMapping("/reschedule-suggestions")
    public ResponseEntity<List<RescheduleSuggestionResponse>> getRescheduleSuggestions(
            @RequestParam String userId,
            @RequestParam(required = false) String taskId) {
        return ResponseEntity.ok(reschedulingService.getSuggestions(userId, java.util.Optional.ofNullable(taskId)));
    }

    @PostMapping("/{taskId}/apply-reschedule")
    public ResponseEntity<Task> applyReschedule(
            @PathVariable String taskId,
            @RequestBody ApplyRescheduleRequest request) {
        return ResponseEntity.ok(taskService.rescheduleTask(taskId, request.getScheduledTime()));
    }

    @PostMapping("/{taskId}/dismiss-reschedule-suggestion")
    public ResponseEntity<Void> dismissRescheduleSuggestion(@PathVariable String taskId) {
        reschedulingService.dismissSuggestion(taskId);
        return ResponseEntity.ok().build();
    }
}
