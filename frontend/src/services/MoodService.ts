import axiosInstance from './AxiosInterceptor';

export type MoodType =
  | 'HAPPY'
  | 'SAD'
  | 'OKISH'
  | 'MOODY'
  | 'CRAMPY'
  | 'ENERGETIC'
  | 'TIRED'
  | 'FOCUSED'
  | 'NEUTRAL';

export interface Mood {
  id?: string;
  userId: string;
  moodType: MoodType;
  timestamp?: string;
  notes?: string;
}

class MoodService {
  async recordMood(mood: Mood): Promise<Mood> {
    const response = await axiosInstance.post<Mood>('/moods', mood);
    return response.data;
  }

  async getUserMoods(userId: string): Promise<Mood[]> {
    const response = await axiosInstance.get<Mood[]>(`/moods/user/${userId}`);
    return response.data;
  }

  async getLatestMood(userId: string): Promise<Mood | null> {
    try {
      const response = await axiosInstance.get<Mood>(`/moods/user/${userId}/latest`);
      return response.data;
    } catch {
      return null;
    }
  }

  async getMoodsBetween(userId: string, start: string, end: string): Promise<Mood[]> {
    const response = await axiosInstance.get<Mood[]>(`/moods/user/${userId}/range`, {
      params: { start, end },
    });
    return response.data;
  }
}

const moodService = new MoodService();

export default moodService;
