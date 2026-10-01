package com.moodtracker.controller;

import com.moodtracker.dto.AuthResponse;
import com.moodtracker.dto.LoginRequest;
import com.moodtracker.model.User;
import com.moodtracker.security.JwtTokenProvider;
import com.moodtracker.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Login attempt for username: {}", loginRequest.getUsername());
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );
            
            log.info("Authentication successful for username: {}", loginRequest.getUsername());
            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userService.getUserByUsername(loginRequest.getUsername());
            log.info("User found: {}", user.getUsername());
            
            String token = jwtTokenProvider.generateToken(loginRequest.getUsername());
            log.info("JWT token generated for username: {}", loginRequest.getUsername());
            
            return ResponseEntity.ok(new AuthResponse(token, user.getId()));
        } catch (Exception e) {
            log.error("Login failed for username: {}", loginRequest.getUsername(), e);
            throw e;
        }
    }
}
