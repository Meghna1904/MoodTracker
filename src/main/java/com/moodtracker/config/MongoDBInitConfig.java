package com.moodtracker.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.moodtracker.model.User;
import org.springframework.data.mongodb.core.index.IndexOperations;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.index.Index;

import java.util.Date;

@Configuration
@RequiredArgsConstructor
public class MongoDBInitConfig {

    private final MongoTemplate mongoTemplate;

    @Bean
    public CommandLineRunner initializeDatabase() {
        return args -> {
            // Create collections if they don't exist
            if (!mongoTemplate.collectionExists("users")) {
                mongoTemplate.createCollection("users");
            }
            if (!mongoTemplate.collectionExists("moods")) {
                mongoTemplate.createCollection("moods");
            }
            if (!mongoTemplate.collectionExists("tasks")) {
                mongoTemplate.createCollection("tasks");
            }
            if (!mongoTemplate.collectionExists("analytics")) {
                mongoTemplate.createCollection("analytics");
            }

            // Create indexes
            createIndexes();

            // Create default admin user if not exists
            createDefaultAdminUser();
        };
    }

    private void createIndexes() {
        IndexOperations userIndexOps = mongoTemplate.indexOps("users");
        userIndexOps.ensureIndex(new Index().on("email", Sort.Direction.ASC).unique());

        IndexOperations moodIndexOps = mongoTemplate.indexOps("moods");
        moodIndexOps.ensureIndex(new Index()
                .on("userId", Sort.Direction.ASC)
                .on("timestamp", Sort.Direction.DESC));

        IndexOperations taskIndexOps = mongoTemplate.indexOps("tasks");
        taskIndexOps.ensureIndex(new Index()
                .on("userId", Sort.Direction.ASC)
                .on("status", Sort.Direction.ASC));
    }

    private void createDefaultAdminUser() {
        // Check if admin user already exists
        if (mongoTemplate.findAll(User.class).isEmpty()) {
            User adminUser = User.builder()
                .username("admin")
                .email("admin@moodtracker.com")
                .build();
            
            mongoTemplate.save(adminUser);
        }
    }
}
