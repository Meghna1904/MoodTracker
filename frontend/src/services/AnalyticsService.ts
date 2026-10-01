import axiosInstance from './AxiosInterceptor';

export interface MoodAnalytics {
  moodDistribution: Record<string, number>;
  dominantMood: string;
  moodStability: number;
  productivityCorrelation: number;
  patterns: {
    hourlyPatterns?: Record<string, number>;
    weeklyPatterns?: Record<string, number>;
  };
}

export interface TaskAnalytics {
  productivityScore: number;
  completionRate: number;
  averageTaskDuration: number;
  peakProductivityHours: Record<string, number>;
  taskDistribution: {
    byPriority?: Record<string, number>;
    byDifficulty?: Record<string, number>;
    byStatus?: Record<string, number>;
  };
  recommendations: string[];
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  type: 'mood' | 'task' | 'productivity' | 'health';
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

class AnalyticsService {
  async getMoodAnalytics(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<MoodAnalytics> {
    try {
      const response = await axiosInstance.get<MoodAnalytics>(`/analytics/mood/${userId}`, {
        params: {
          start: startDate,
          end: endDate,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching mood analytics:', error);
      throw error;
    }
  }

  async getTaskAnalytics(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<TaskAnalytics> {
    try {
      const response = await axiosInstance.get<TaskAnalytics>(`/analytics/tasks/${userId}`, {
        params: {
          start: startDate,
          end: endDate,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching task analytics:', error);
      throw error;
    }
  }

  async getSuggestions(userId: string): Promise<Suggestion[]> {
    try {
      const response = await axiosInstance.get<Suggestion[]>(`/analytics/suggestions/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  }

  // Helper function to calculate date range (last 7 days)
  static getLast7Days(): { start: string; end: string } {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    return {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };
  }

  // Helper function to calculate date range (last 30 days)
  static getLast30Days(): { start: string; end: string } {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    return {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };
  }

  // Helper function to calculate date range (current month)
  static getCurrentMonth(): { start: string; end: string } {
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    return {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };
  }
}

const analyticsService = new AnalyticsService();

export default analyticsService;
