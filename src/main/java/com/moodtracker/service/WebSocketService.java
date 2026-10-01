package com.moodtracker.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class WebSocketService {
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public void sendNotification(String userId, Object payload) {
        try {
            String destination = "/topic/notifications/" + userId;
            messagingTemplate.convertAndSend(destination, objectMapper.writeValueAsString(payload));
        } catch (Exception e) {
            log.error("Failed to send notification to user: " + userId, e);
        }
    }

    public void sendMoodUpdate(String userId, Object moodData) {
        try {
            String destination = "/topic/mood/" + userId;
            messagingTemplate.convertAndSend(destination, objectMapper.writeValueAsString(moodData));
        } catch (Exception e) {
            log.error("Failed to send mood update to user: " + userId, e);
        }
    }

    public void sendTaskUpdate(String userId, Object taskData) {
        try {
            String destination = "/topic/tasks/" + userId;
            messagingTemplate.convertAndSend(destination, objectMapper.writeValueAsString(taskData));
        } catch (Exception e) {
            log.error("Failed to send task update to user: " + userId, e);
        }
    }
}
