package com.moodtracker.model;

import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "tasks", indexes = {
    @Index(name = "idx_tasks_user_status", columnList = "user_id,status"),
    @Index(name = "idx_tasks_deadline", columnList = "deadline")
})
public class Task {
    private static final int DEFAULT_MAX_RESCHEDULES = 3;

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @Column(name = "user_id", nullable = false)
    private String userId;
    private String title;  // This field will be used for taskName/getTitle()
    private String description;
    @Enumerated(EnumType.STRING)
    private Priority priority;
    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;
    private LocalDateTime deadline;
    private LocalDateTime scheduledTime;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime suggestedStartTime;
    @Enumerated(EnumType.STRING)
    private TaskStatus status;
    @Enumerated(EnumType.STRING)
    private TaskType taskType;
    @Enumerated(EnumType.STRING)
    private Flexibility flexibility;
    @Column(name = "reschedulable")
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
