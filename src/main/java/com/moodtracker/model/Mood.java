package com.moodtracker.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "moods")
public class Mood {
    @Id
    private String id;
    private String userId;
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
