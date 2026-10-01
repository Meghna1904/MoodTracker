package com.moodtracker.service;

import com.moodtracker.service.NotificationService.NotificationPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender emailSender;
    private final TemplateEngine templateEngine;
    private final UserService userService;

    public void sendNotificationEmail(String userId, NotificationPayload payload) {
        try {
            String userEmail = userService.getUserEmail(userId);
            if (userEmail == null || userEmail.isEmpty()) {
                return;
            }

            Context context = new Context();
            Map<String, Object> templateModel = new HashMap<>();
            templateModel.put("title", payload.getTitle());
            templateModel.put("message", payload.getMessage());
            templateModel.put("type", payload.getType().toString());
            context.setVariables(templateModel);

            String htmlContent = templateEngine.process("notification-email", context);
            sendHtmlEmail(userEmail, payload.getTitle(), htmlContent);
        } catch (Exception e) {
            // Log error but don't throw - notifications should not break the main flow
            e.printStackTrace();
        }
    }

    public void sendTaskDueSoonEmail(String userId, String taskTitle, String dueTime) {
        try {
            String userEmail = userService.getUserEmail(userId);
            if (userEmail == null || userEmail.isEmpty()) {
                return;
            }

            Context context = new Context();
            Map<String, Object> templateModel = new HashMap<>();
            templateModel.put("taskTitle", taskTitle);
            templateModel.put("dueTime", dueTime);
            context.setVariables(templateModel);

            String htmlContent = templateEngine.process("task-due-email", context);
            sendHtmlEmail(userEmail, "Task Due Soon: " + taskTitle, htmlContent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void sendMoodCheckInEmail(String userId) {
        try {
            String userEmail = userService.getUserEmail(userId);
            if (userEmail == null || userEmail.isEmpty()) {
                return;
            }

            Context context = new Context();
            String htmlContent = templateEngine.process("mood-check-email", context);
            sendHtmlEmail(userEmail, "Time for a Mood Check-in!", htmlContent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
        
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        
        emailSender.send(message);
    }
}
