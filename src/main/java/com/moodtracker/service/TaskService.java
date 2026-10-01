package com.moodtracker.service;

import com.moodtracker.exception.ApiException;
import com.moodtracker.model.Mood;
import com.moodtracker.model.Task;
import com.moodtracker.model.User;
import com.moodtracker.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final UserService userService;
    private final MoodService moodService;

    public Task createTask(Task task) {
        normalizeTaskDefaults(task);
        task.setStatus(Task.TaskStatus.PENDING);
        task.setStartedAt(null);
        task.setCompletedAt(null);
        if (task.getDifficulty() == null) {
            task.setDifficulty(Task.Difficulty.MEDIUM);
        }
        if (task.getScheduledTime() == null) {
            task.setScheduledTime(task.getDeadline());
        }
        return taskRepository.save(task);
    }

    public List<Task> getUserTasks(String userId) {
        return taskRepository.findByUserIdOrderByDeadlineAsc(userId);
    }

    public List<Task> getPendingTasks(String userId) {
        return taskRepository.findByUserIdAndStatusOrderByDeadlineAsc(
            userId, Task.TaskStatus.PENDING);
    }

    public List<Task> getAllUpcomingTasks() {
        return taskRepository.findByStatusAndDeadlineAfterOrderByDeadlineAsc(
            Task.TaskStatus.PENDING, LocalDateTime.now());
    }

    public List<Task> getTasksForTimeRange(String userId, LocalDateTime start, LocalDateTime end) {
        return taskRepository.findByUserIdAndScheduledTimeBetweenOrderByScheduledTimeAsc(
            userId, start, end);
    }

    public Task updateTaskStatus(String taskId, Task.TaskStatus status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        task.setStatus(status);
        
        // Update timestamps based on status
        switch (status) {
            case IN_PROGRESS:
                if (task.getStartedAt() == null) {
                    task.setStartedAt(LocalDateTime.now());
                }
                break;
            case COMPLETED:
                task.setCompletedAt(LocalDateTime.now());
                break;
            case RESCHEDULED:
                // Reset start time if task is rescheduled
                task.setStartedAt(null);
                break;
            default:
                break;
        }
        
        return taskRepository.save(task);
    }

    public List<Task> rescheduleTasksBasedOnMood(String userId) {
        User user = userService.getUserById(userId);
        Mood latestMood = moodService.getLatestMood(userId);
        List<Task> tasks = taskRepository.findByUserIdAndStatusOrderByDeadlineAsc(
            userId, Task.TaskStatus.PENDING);
        
        // Implement rescheduling logic based on mood
        for (Task task : tasks) {
            if (task.isReschedulable()) {
                switch (latestMood.getMoodType()) {
                    case SAD:
                    case MOODY:
                    case CRAMPY:
                        // Reschedule non-urgent tasks
                        if (task.getPriority() != Task.Priority.HIGH) {
                            task.setScheduledTime(task.getScheduledTime().plusDays(1));
                            task.setStatus(Task.TaskStatus.RESCHEDULED);
                        }
                        break;
                    case ENERGETIC:
                    case HAPPY:
                        // Schedule more challenging tasks
                        if (task.getDifficulty() == Task.Difficulty.HIGH) {
                            task.setScheduledTime(LocalDateTime.now().plusHours(1));
                            task.setSuggestedStartTime(LocalDateTime.now().plusHours(1));
                        }
                        break;
                    case FOCUSED:
                        // Prioritize high-difficulty tasks
                        if (task.getDifficulty() == Task.Difficulty.HIGH) {
                            task.setSuggestedStartTime(LocalDateTime.now());
                        }
                        break;
                    case TIRED:
                        // Schedule easier tasks
                        if (task.getDifficulty() == Task.Difficulty.LOW || 
                            task.getDifficulty() == Task.Difficulty.VERY_LOW) {
                            task.setSuggestedStartTime(LocalDateTime.now());
                        }
                        break;
                    default:
                        // Keep original schedule
                        break;
                }
            }
        }
        
        return taskRepository.saveAll(tasks);
    }

    public Optional<Task> getTaskById(String taskId) {
        return taskRepository.findById(taskId);
    }

    public Task updateTask(String taskId, Task taskDetails) {
        Task existingTask = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        // Update task details while preserving status-related fields
        if (taskDetails.getTitle() != null) {
            existingTask.setTitle(taskDetails.getTitle());
        }
        if (taskDetails.getDescription() != null) {
            existingTask.setDescription(taskDetails.getDescription());
        }
        if (taskDetails.getPriority() != null) {
            existingTask.setPriority(taskDetails.getPriority());
        }
        if (taskDetails.getDifficulty() != null) {
            existingTask.setDifficulty(taskDetails.getDifficulty());
        }
        if (taskDetails.getTaskType() != null) {
            existingTask.setTaskType(taskDetails.getTaskType());
        }
        if (taskDetails.getFlexibility() != null) {
            existingTask.setFlexibility(taskDetails.getFlexibility());
        }
        if (taskDetails.getRescheduleCount() != null) {
            existingTask.setRescheduleCount(taskDetails.getRescheduleCount());
        }
        if (taskDetails.getMaxReschedules() != null) {
            existingTask.setMaxReschedules(taskDetails.getMaxReschedules());
        }
        existingTask.setDeadline(taskDetails.getDeadline());
        existingTask.setScheduledTime(taskDetails.getScheduledTime());
        existingTask.setReschedulable(taskDetails.isReschedulable() || existingTask.isReschedulable());
        normalizeTaskDefaults(existingTask);
        
        return taskRepository.save(existingTask);
    }

    public Task rescheduleTask(String taskId, LocalDateTime scheduledTime) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        validateReschedule(task, scheduledTime);
        task.setScheduledTime(scheduledTime);
        task.setSuggestedStartTime(scheduledTime);
        task.setStatus(Task.TaskStatus.RESCHEDULED);
        task.setStartedAt(null);
        task.setRescheduleCount(task.getSafeRescheduleCount() + 1);
        return taskRepository.save(task);
    }

    public void deleteTask(String taskId) {
        taskRepository.deleteById(taskId);
    }

    public boolean hasSchedulingConflict(String userId, String taskId, LocalDateTime scheduledTime) {
        if (userId == null || scheduledTime == null) {
            return false;
        }
        return taskRepository.findByUserIdOrderByDeadlineAsc(userId).stream()
                .filter(existing -> existing.getId() != null && !existing.getId().equals(taskId))
                .filter(existing -> existing.getStatus() == Task.TaskStatus.PENDING
                        || existing.getStatus() == Task.TaskStatus.IN_PROGRESS
                        || existing.getStatus() == Task.TaskStatus.RESCHEDULED)
                .anyMatch(existing -> {
                    LocalDateTime existingTime = existing.getScheduledTime();
                    return existingTime != null && Duration.between(existingTime, scheduledTime).abs().toMinutes() < 60;
                });
    }

    private void validateReschedule(Task task, LocalDateTime scheduledTime) {
        if (scheduledTime == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A new schedule time is required.");
        }
        if (task.getEffectiveTaskType() == Task.TaskType.ROUTINE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Routines cannot be rescheduled. You can skip them instead.");
        }
        if (!task.isReschedulable()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This task is not reschedulable.");
        }
        if (task.getStatus() != Task.TaskStatus.PENDING && task.getStatus() != Task.TaskStatus.RESCHEDULED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only pending tasks can be rescheduled.");
        }
        if (task.getDeadline() != null && scheduledTime.isAfter(task.getDeadline())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "The new schedule cannot go beyond the deadline.");
        }
        if (task.getSafeRescheduleCount() >= task.getSafeMaxReschedules()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This task has reached its reschedule limit.");
        }
        if (hasSchedulingConflict(task.getUserId(), task.getId(), scheduledTime)) {
            throw new ApiException(HttpStatus.CONFLICT, "The selected time conflicts with another scheduled task.");
        }
    }

    private void normalizeTaskDefaults(Task task) {
        if (task.getTaskType() == null) {
            task.setTaskType(Task.TaskType.TASK);
        }
        if (task.getFlexibility() == null) {
            task.setFlexibility(task.getEffectiveTaskType() == Task.TaskType.ROUTINE
                    ? Task.Flexibility.STRICT
                    : Task.Flexibility.FLEXIBLE);
        }
        if (task.getEffectiveTaskType() == Task.TaskType.ROUTINE) {
            task.setReschedulable(false);
            task.setMaxReschedules(0);
        } else {
            if (task.getMaxReschedules() == null) {
                task.setMaxReschedules(task.getSafeMaxReschedules());
            }
            if (!task.isReschedulable()) {
                task.setReschedulable(task.getSafeMaxReschedules() > 0);
            }
        }
        if (task.getRescheduleCount() == null) {
            task.setRescheduleCount(0);
        }
    }
}
