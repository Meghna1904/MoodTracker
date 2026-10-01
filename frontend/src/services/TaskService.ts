import axiosInstance from './AxiosInterceptor';

export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskDifficulty = 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'RESCHEDULED';
export type TaskType = 'TASK' | 'ROUTINE';
export type TaskFlexibility = 'STRICT' | 'LIMITED' | 'FLEXIBLE';
export type SuggestionMood = 'HAPPY' | 'SAD' | 'TIRED' | 'ENERGETIC' | 'MOODY' | 'CRAMPY' | 'FOCUSED';
export type SuggestionEnergyLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  difficulty?: TaskDifficulty;
  deadline?: string;
  scheduledTime?: string;
  startedAt?: string;
  completedAt?: string;
  status: TaskStatus;
  taskType?: TaskType;
  flexibility?: TaskFlexibility;
  isReschedulable?: boolean;
  rescheduleCount?: number;
  maxReschedules?: number;
}

export interface RescheduleOption {
  type: 'time' | 'day';
  label?: string;
  value: string;
  scheduledTime?: string;
}

export interface RescheduleSuggestion {
  taskId: string;
  taskTitle?: string;
  rescheduleLikelihoodScore: number;
  shouldSuggestReschedule: boolean;
  blocked?: boolean;
  reason: string;
  blockedReason?: string;
  evaluatedAt: string;
  mood?: SuggestionMood;
  energyLevel?: SuggestionEnergyLevel;
  rescheduleCount?: number;
  maxReschedules?: number;
  reschedulesRemaining?: number;
  constraints?: string[];
  suggestedOptions: RescheduleOption[];
  signals: Record<string, unknown>;
}

class TaskService {
  async createTask(task: Task): Promise<Task> {
    const response = await axiosInstance.post<Task>('/tasks', task);
    return response.data;
  }

  async getTask(taskId: string): Promise<Task> {
    const response = await axiosInstance.get<Task>(`/tasks/${taskId}`);
    return response.data;
  }

  async updateTask(taskId: string, task: Partial<Task>): Promise<Task> {
    const response = await axiosInstance.put<Task>(`/tasks/${taskId}`, task);
    return response.data;
  }

  async deleteTask(taskId: string): Promise<void> {
    await axiosInstance.delete(`/tasks/${taskId}`);
  }

  async getUserTasks(userId: string): Promise<Task[]> {
    const response = await axiosInstance.get<Task[]>(`/tasks/user/${userId}`);
    return response.data;
  }

  async getPendingTasks(userId: string): Promise<Task[]> {
    const response = await axiosInstance.get<Task[]>(`/tasks/user/${userId}/pending`);
    return response.data;
  }

  async getRescheduleSuggestions(userId: string, taskId?: string): Promise<RescheduleSuggestion[]> {
    const response = await axiosInstance.get<RescheduleSuggestion[]>('/tasks/reschedule-suggestions', {
      params: { userId, taskId },
    });
    return response.data;
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    const response = await axiosInstance.put<Task>(`/tasks/${taskId}/status`, null, {
      params: { status },
    });
    return response.data;
  }

  async applyReschedule(taskId: string, scheduledTime: string): Promise<Task> {
    const response = await axiosInstance.post<Task>(`/tasks/${taskId}/apply-reschedule`, {
      scheduledTime,
    });
    return response.data;
  }

  async dismissRescheduleSuggestion(taskId: string): Promise<void> {
    await axiosInstance.post(`/tasks/${taskId}/dismiss-reschedule-suggestion`);
  }
}

const taskService = new TaskService();

export default taskService;
