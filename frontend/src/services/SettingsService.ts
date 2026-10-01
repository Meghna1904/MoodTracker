import axiosInstance from './AxiosInterceptor';

export interface UserPreferences {
  id?: string;
  userId: string;
  notifications?: boolean;
  emailNotifications?: boolean;
  darkMode?: boolean;
  workStartTime?: string;
  workEndTime?: string;
  breakDuration?: number;
  taskReminders?: boolean;
  moodReminders?: boolean;
  language?: string;
  timeZone?: string;
}

class SettingsService {
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      const response = await axiosInstance.get<UserPreferences>(`/preferences/user/${userId}`);
      return response.data;
    } catch (error) {
      // Return default preferences if not found
      console.warn('Could not fetch user preferences, using defaults:', error);
      return this.getDefaultPreferences(userId);
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const existingPreferences = await this.getUserPreferences(userId);
      const response = await axiosInstance.put<UserPreferences>(
        `/preferences/user/${userId}`,
        {
          ...existingPreferences,
          ...preferences,
          userId,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  private getDefaultPreferences(userId: string): UserPreferences {
    return {
      userId,
      notifications: true,
      emailNotifications: true,
      darkMode: false,
      workStartTime: '09:00',
      workEndTime: '17:00',
      breakDuration: 30,
      taskReminders: true,
      moodReminders: true,
      language: 'en',
      timeZone: 'UTC',
    };
  }
}

const settingsService = new SettingsService();

export default settingsService;
