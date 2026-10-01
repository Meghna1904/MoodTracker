package com.moodtracker.repository;

import com.moodtracker.model.UserDevice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserDeviceRepository extends MongoRepository<UserDevice, String> {
    List<UserDevice> findByUserId(String userId);
    UserDevice findByUserIdAndFcmToken(String userId, String fcmToken);
    List<UserDevice> findByLastActiveBefore(LocalDateTime dateTime);
}
