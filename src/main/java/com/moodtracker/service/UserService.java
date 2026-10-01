package com.moodtracker.service;

import com.moodtracker.exception.ApiException;
import com.moodtracker.model.User;
import com.moodtracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User createUser(User user) {
        log.info("Creating user: {}", user.getUsername());
        
        if (userRepository.existsByUsername(user.getUsername())) {
            log.warn("Username already exists: {}", user.getUsername());
            throw new ApiException(HttpStatus.BAD_REQUEST, "Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            log.warn("Email already exists: {}", user.getEmail());
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email already exists");
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        
        log.info("User created successfully: {}", savedUser.getUsername());
        return savedUser;
    }

    public User updateUser(String userId, User userDetails) {
        log.info("Updating user with ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", userId);
                    return new ApiException(HttpStatus.NOT_FOUND, "User not found");
                });
        
        user.setWakeUpTime(userDetails.getWakeUpTime());
        user.setSleepTime(userDetails.getSleepTime());
        user.setRoutines(userDetails.getRoutines());
        user.setTrackPeriodCycle(userDetails.isTrackPeriodCycle());
        user.setPeriodCycle(userDetails.getPeriodCycle());
        
        User updatedUser = userRepository.save(user);
        log.info("User updated successfully: {}", updatedUser.getUsername());
        return updatedUser;
    }

    public User getUserById(String userId) {
        log.info("Fetching user by ID: {}", userId);
        return userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", userId);
                    return new ApiException(HttpStatus.NOT_FOUND, "User not found");
                });
    }

    public User getUserByUsername(String username) {
        log.info("Fetching user by username: {}", username);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.error("User not found with username: {}", username);
                    return new ApiException(HttpStatus.NOT_FOUND, "User not found");
                });
    }

    public String getUserEmail(String userId) {
        log.info("Fetching user email for ID: {}", userId);
        User user = getUserById(userId);
        return user.getEmail();
    }
}
