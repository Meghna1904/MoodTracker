package com.moodtracker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WeatherService {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${openweathermap.api.key}")
    private String apiKey;

    @Value("${openweathermap.api.url}")
    private String apiUrl;

    @Cacheable(value = "weatherScores", key = "#dateTime.toLocalDate()")
    public double getWeatherScore(LocalDateTime dateTime) {
        try {
            WeatherData weather = getCurrentWeather();
            return calculateWeatherScore(weather);
        } catch (Exception e) {
            // Return neutral score if weather data is unavailable
            return 0.5;
        }
    }

    private WeatherData getCurrentWeather() {
        String url = String.format("%s?appid=%s&units=metric", apiUrl, apiKey);
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        
        try {
            JsonNode root = objectMapper.readTree(response.getBody());
            
            return WeatherData.builder()
                .temperature(root.path("main").path("temp").asDouble())
                .humidity(root.path("main").path("humidity").asDouble())
                .cloudiness(root.path("clouds").path("all").asDouble())
                .weatherCode(root.path("weather").get(0).path("id").asInt())
                .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse weather data", e);
        }
    }

    private double calculateWeatherScore(WeatherData weather) {
        double score = 0.5; // Start with neutral score
        
        // Temperature impact (optimal range: 20-25°C)
        double tempScore;
        if (weather.getTemperature() < 10) {
            tempScore = 0.3;
        } else if (weather.getTemperature() < 20) {
            tempScore = 0.7;
        } else if (weather.getTemperature() <= 25) {
            tempScore = 1.0;
        } else if (weather.getTemperature() <= 30) {
            tempScore = 0.7;
        } else {
            tempScore = 0.3;
        }
        
        // Cloudiness impact (less clouds = better mood)
        double cloudScore = 1.0 - (weather.getCloudiness() / 100.0) * 0.5;
        
        // Weather condition impact
        double conditionScore = getWeatherConditionScore(weather.getWeatherCode());
        
        // Combine scores with different weights
        score = (tempScore * 0.4) + (cloudScore * 0.3) + (conditionScore * 0.3);
        
        return Math.max(0.0, Math.min(1.0, score));
    }

    private double getWeatherConditionScore(int weatherCode) {
        // Weather condition codes based on OpenWeatherMap API
        if (weatherCode >= 200 && weatherCode < 300) { // Thunderstorm
            return 0.2;
        } else if (weatherCode >= 300 && weatherCode < 400) { // Drizzle
            return 0.4;
        } else if (weatherCode >= 500 && weatherCode < 600) { // Rain
            return 0.3;
        } else if (weatherCode >= 600 && weatherCode < 700) { // Snow
            return 0.5;
        } else if (weatherCode >= 700 && weatherCode < 800) { // Atmosphere
            return 0.6;
        } else if (weatherCode == 800) { // Clear
            return 1.0;
        } else if (weatherCode > 800 && weatherCode < 900) { // Clouds
            return 0.7;
        }
        return 0.5; // Default neutral score
    }

    @lombok.Builder
    @lombok.Data
    private static class WeatherData {
        private double temperature;
        private double humidity;
        private double cloudiness;
        private int weatherCode;
    }
}
