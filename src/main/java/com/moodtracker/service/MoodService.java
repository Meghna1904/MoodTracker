package com.moodtracker.service;

import com.moodtracker.model.Mood;
import com.moodtracker.repository.MoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MoodService {
    private final MoodRepository moodRepository;

    public Mood recordMood(Mood mood) {
        mood.setTimestamp(LocalDateTime.now());
        return moodRepository.save(mood);
    }

    public List<Mood> getUserMoods(String userId) {
        return moodRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public List<Mood> getUserMoodsBetween(String userId, LocalDateTime start, LocalDateTime end) {
        return moodRepository.findByUserIdAndTimestampBetween(userId, start, end);
    }

    public Mood getLatestMood(String userId) {
        return moodRepository.findFirstByUserIdOrderByTimestampDesc(userId);
    }

    public List<Mood> getRecentMoods(String userId, LocalDateTime before) {
        return moodRepository.findByUserIdAndTimestampBeforeOrderByTimestampDesc(userId, before);
    }
}
