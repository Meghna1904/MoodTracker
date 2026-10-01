package com.moodtracker.service;

import com.moodtracker.model.UserDevice;
import com.moodtracker.repository.UserDeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDeviceService {
    private final UserDeviceRepository deviceRepository;

    public UserDevice registerDevice(String userId, String fcmToken, String deviceType, 
            String deviceModel, String osVersion, String appVersion) {
        // Check if device already exists
        UserDevice existingDevice = deviceRepository.findByUserIdAndFcmToken(userId, fcmToken);
        
        if (existingDevice != null) {
            existingDevice.setLastActive(LocalDateTime.now());
            existingDevice.setDeviceType(deviceType);
            existingDevice.setDeviceModel(deviceModel);
            existingDevice.setOsVersion(osVersion);
            existingDevice.setAppVersion(appVersion);
            existingDevice.setUpdatedAt(LocalDateTime.now());
            return deviceRepository.save(existingDevice);
        }

        // Create new device
        UserDevice newDevice = new UserDevice();
        newDevice.setUserId(userId);
        newDevice.setFcmToken(fcmToken);
        newDevice.setDeviceType(deviceType);
        newDevice.setDeviceModel(deviceModel);
        newDevice.setOsVersion(osVersion);
        newDevice.setAppVersion(appVersion);
        newDevice.setNotificationsEnabled(true);
        newDevice.setLastActive(LocalDateTime.now());
        newDevice.setCreatedAt(LocalDateTime.now());
        newDevice.setUpdatedAt(LocalDateTime.now());

        return deviceRepository.save(newDevice);
    }

    public void updateDeviceToken(String userId, String oldToken, String newToken) {
        UserDevice device = deviceRepository.findByUserIdAndFcmToken(userId, oldToken);
        if (device != null) {
            device.setFcmToken(newToken);
            device.setUpdatedAt(LocalDateTime.now());
            deviceRepository.save(device);
        }
    }

    public void removeDevice(String deviceId) {
        deviceRepository.deleteById(deviceId);
    }

    public void updateNotificationSettings(String userId, String fcmToken, boolean enabled) {
        UserDevice device = deviceRepository.findByUserIdAndFcmToken(userId, fcmToken);
        if (device != null) {
            device.setNotificationsEnabled(enabled);
            device.setUpdatedAt(LocalDateTime.now());
            deviceRepository.save(device);
        }
    }

    public List<UserDevice> getUserDevices(String userId) {
        return deviceRepository.findByUserId(userId);
    }

    public void cleanupInactiveDevices() {
        LocalDateTime threshold = LocalDateTime.now().minusMonths(3);
        List<UserDevice> inactiveDevices = deviceRepository.findByLastActiveBefore(threshold);
        deviceRepository.deleteAll(inactiveDevices);
    }

    public void updateLastActive(String userId, String fcmToken) {
        UserDevice device = deviceRepository.findByUserIdAndFcmToken(userId, fcmToken);
        if (device != null) {
            device.setLastActive(LocalDateTime.now());
            deviceRepository.save(device);
        }
    }
}
