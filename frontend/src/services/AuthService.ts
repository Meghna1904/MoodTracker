import axiosInstance from './AxiosInterceptor';
import { AuthStorage } from './AuthStorage';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      AuthStorage.setSession(response.data.token, response.data.userId);
    }
    return response.data;
  }

  async register(data: RegisterRequest): Promise<{ id: string; username: string }> {
    const response = await axiosInstance.post<{ id: string; username: string }>('/users/register', {
      username: data.username,
      email: data.email,
      password: data.password,
    });
    return response.data;
  }

  logout() {
    AuthStorage.clearSession();
  }

  isAuthenticated(): boolean {
    return !!AuthStorage.getToken();
  }

  getToken(): string | null {
    return AuthStorage.getToken();
  }

  getUserId(): string | null {
    return AuthStorage.getUserId();
  }
}

const authService = new AuthService();

export default authService;
