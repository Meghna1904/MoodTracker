package com.moodtracker.model;

import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "moods", indexes = {
    @Index(name = "idx_moods_user_timestamp", columnList = "user_id,timestamp")
})
public class Mood {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @Column(name = "user_id", nullable = false)
    private String userId;
    @Enumerated(EnumType.STRING)
    private MoodType moodType;
    private LocalDateTime timestamp;
    private String notes;
    
    public enum MoodType {
        HAPPY(5),
        SAD(1),
        OKISH(3),
        MOODY(2),
        CRAMPY(1),
        ENERGETIC(5),
        TIRED(1),
        FOCUSED(4),
        NEUTRAL(3);

        private final int numericValue;

        MoodType(int numericValue) {
            this.numericValue = numericValue;
        }

        public int getNumericValue() {
            return numericValue;
        }
    }
}
