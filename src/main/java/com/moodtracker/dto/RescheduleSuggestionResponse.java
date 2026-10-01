package com.moodtracker.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class RescheduleSuggestionResponse {
    private String taskId;
    private String taskTitle;
    private double rescheduleLikelihoodScore;
    private boolean shouldSuggestReschedule;
    private boolean blocked;
    private String reason;
    private String blockedReason;
    private String mood;
    private String energyLevel;
    private LocalDateTime evaluatedAt;
    private int rescheduleCount;
    private int maxReschedules;
    private int reschedulesRemaining;
    private List<String> constraints;
    private List<RescheduleOption> suggestedOptions;
    private Map<String, Object> signals;

    @Data
    @Builder
    public static class RescheduleOption {
        private String type;
        private String label;
        private String value;
        private LocalDateTime scheduledTime;
    }
}
