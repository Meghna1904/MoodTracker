package com.moodtracker.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "tasks")
public class Task {
    private static final int DEFAULT_MAX_RESCHEDULES = 3;

    @Id
    private String id;
    private String userId;
    private String title;  // This field will be used for taskName/getTitle()
    private String description;
    private Priority priority;
    private Difficulty difficulty;
    private LocalDateTime deadline;
    private LocalDateTime scheduledTime;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime suggestedStartTime;
    private TaskStatus status;
    private TaskType taskType;
    private Flexibility flexibility;
    private boolean isReschedulable;
    private Integer rescheduleCount;
    private Integer maxReschedules;
    
    public enum Priority {
        HIGH,
        MEDIUM,
        LOW
    }
    
    public enum Difficulty {
        HIGH,
        MEDIUM,
        LOW,
        VERY_LOW
    }
    
    public enum TaskStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        RESCHEDULED
    }

    public enum TaskType {
        TASK,
        ROUTINE
    }

    public enum Flexibility {
        STRICT,
        LIMITED,
        FLEXIBLE
    }

    public int getSafeRescheduleCount() {
        return rescheduleCount == null ? 0 : rescheduleCount;
    }

    public int getSafeMaxReschedules() {
        if (maxReschedules != null) {
            return maxReschedules;
        }
        return switch (getEffectiveFlexibility()) {
            case STRICT -> 0;
            case LIMITED -> 1;
            case FLEXIBLE -> DEFAULT_MAX_RESCHEDULES;
        };
    }

    public TaskType getEffectiveTaskType() {
        return taskType == null ? TaskType.TASK : taskType;
    }

    public Flexibility getEffectiveFlexibility() {
        return flexibility == null ? Flexibility.FLEXIBLE : flexibility;
    }
}
