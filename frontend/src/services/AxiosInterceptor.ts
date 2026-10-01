import axios from 'axios';
import { AuthStorage } from './AuthStorage';

// Create an axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8081/api'
});

// Request interceptor to add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = AuthStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthorized errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Clear stale credentials without redirecting to the deferred login flow.
    if (error.response && error.response.status === 401) {
      AuthStorage.clearSession();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
