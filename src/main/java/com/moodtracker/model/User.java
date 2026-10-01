package com.moodtracker.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalTime;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(name = "uk_users_username", columnNames = "username"),
    @UniqueConstraint(name = "uk_users_email", columnNames = "email")
})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String username;
    private String email;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    private LocalTime wakeUpTime;
    private LocalTime sleepTime;
    @ElementCollection
    @CollectionTable(name = "user_routines", joinColumns = @JoinColumn(name = "user_id"))
    private List<DailyRoutine> routines;
    private boolean trackPeriodCycle;
    @Embedded
    private PeriodCycle periodCycle;
    
    @Data
    @Embeddable
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyRoutine {
        private String activity;
        private LocalTime startTime;
        private LocalTime endTime;
    }
    
    @Data
    @Embeddable
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PeriodCycle {
        private LocalDate startDate;
        private LocalDate endDate;
        private int cycleLength;
    }
}
