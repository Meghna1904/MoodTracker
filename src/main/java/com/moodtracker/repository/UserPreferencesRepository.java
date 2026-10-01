package com.moodtracker.repository;

import com.moodtracker.model.UserPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserPreferencesRepository extends JpaRepository<UserPreferences, String> {
    Optional<UserPreferences> findByUserId(String userId);
}
