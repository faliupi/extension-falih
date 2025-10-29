// src/lib/axios.ts
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Define your base API URL
const API_URL = 'http://localhost:8080/api/v2' ;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get token from Chrome storage
    const token = await new Promise<string | null>((resolve) => {
      chrome.storage.local.get('accessToken', (result) => resolve(result.accessToken || null));
    });

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && originalRequest) {
      try {
        // Get refresh token from Chrome storage
        const refreshToken = await new Promise<string | null>((resolve) => {
          chrome.storage.local.get('refreshToken', (result) => resolve(result.refreshToken || null));
        });

        if (!refreshToken) {
          // Handle no refresh token (logout user)
          handleLogout();
          return Promise.reject(error);
        }

        // Call refresh token endpoint
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken
        });

        if (response.data.access_token) {
          // Save new tokens in Chrome storage
          chrome.storage.local.set({
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token || refreshToken,
          });

          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token fails, logout user
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

// Logout helper function
const handleLogout = () => {
  chrome.storage.local.remove(['accessToken', 'refreshToken']);
  
  // Optional: Redirect to login page (if applicable in Chrome extension context)
  window.location.href = '/login';
};

export default apiClient;

// Optional: Export types for responses
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface ErrorResponse {
  error: boolean;
  message: string;
  status: number;
}
