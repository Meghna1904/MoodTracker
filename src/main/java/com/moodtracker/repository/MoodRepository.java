package com.moodtracker.repository;

import com.moodtracker.model.Mood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MoodRepository extends JpaRepository<Mood, String> {
    List<Mood> findByUserIdOrderByTimestampDesc(String userId);
    
    List<Mood> findByUserIdAndTimestampBetween(String userId, LocalDateTime start, LocalDateTime end);
    
    Mood findFirstByUserIdOrderByTimestampDesc(String userId);
    
    List<Mood> findByUserIdAndTimestampBeforeOrderByTimestampDesc(String userId, LocalDateTime before);
}
