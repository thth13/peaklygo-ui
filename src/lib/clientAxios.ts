import axios, { AxiosError, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { refreshAccessToken } from './api';
import { API_URL } from '@/constants';

export const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const refreshToken = Cookies.get('refreshToken');

    if (refreshToken && error.response?.status === 401) {
      try {
        const { accessToken } = await refreshAccessToken(refreshToken);
        Cookies.set('accessToken', accessToken);

        if (error.config) {
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return api.request(error.config);
        }
      } catch (refreshError) {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');

        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }

        console.error('Failed to refresh access token:', refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
