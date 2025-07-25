import { API_URL } from '@/constants';
import { api } from '../clientAxios';
import { CodeResponse } from '@react-oauth/google';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  id: string;
}

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const res = await api.post(`${API_URL}/user/login`, {
      email,
      password,
    });

    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const googleLoginUser = async (codeResponse: CodeResponse): Promise<AuthResponse> => {
  try {
    const res = await api.post(`${API_URL}/user/google`, {
      codeResponse,
    });

    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const registerUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const res = await api.post(`${API_URL}/user/register`, {
      email,
      password,
    });

    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const refreshAccessToken = async (refreshToken: string): Promise<AuthResponse> => {
  try {
    const res = await api.post(`${API_URL}/user/refresh-access-token`, {
      refreshToken,
    });

    return res.data;
  } catch (err: any) {
    throw err;
  }
};
