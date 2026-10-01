package com.moodtracker.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ApplyRescheduleRequest {
    private LocalDateTime scheduledTime;
}
