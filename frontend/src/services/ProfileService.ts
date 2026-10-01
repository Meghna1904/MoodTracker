import axiosInstance from './AxiosInterceptor';

export interface UserProfile {
  id?: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  cycleTracking?: boolean;
  cycleLength?: number;
  periodLength?: number;
  lastPeriodDate?: string;
}

export interface CycleTrackingData {
  cycleLength: number;
  periodLength: number;
  lastPeriodDate: string;
}

class ProfileService {
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await axiosInstance.get<UserProfile>(`/profile/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await axiosInstance.put<UserProfile>(`/profile/user/${userId}`, profile);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async updateProfilePicture(userId: string, file: File): Promise<UserProfile> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post<UserProfile>(
        `/profile/user/${userId}/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }

  async updateCycleTracking(userId: string, cycleData: CycleTrackingData): Promise<UserProfile> {
    try {
      const response = await axiosInstance.post<UserProfile>(
        `/profile/user/${userId}/cycle`,
        null,
        {
          params: {
            cycleLength: cycleData.cycleLength,
            periodLength: cycleData.periodLength,
            lastPeriodDate: cycleData.lastPeriodDate,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating cycle tracking:', error);
      throw error;
    }
  }
}

const profileService = new ProfileService();

export default profileService;
