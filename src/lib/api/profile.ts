import { API_URL } from '@/constants';
import { UserProfile, ProfileStats } from '@/types';
import api from '../clientAxios';
import nProgress from 'nprogress';

export const getProfile = async (id: string): Promise<UserProfile> => {
  try {
    const res = await api.get(`${API_URL}/profile/${id}`);

    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const editProfile = async (id: string, profile: FormData): Promise<UserProfile> => {
  try {
    const res = await api.put(`${API_URL}/profile/${id}`, profile, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    nProgress.start();

    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const getProfileStats = async (id: string): Promise<ProfileStats> => {
  try {
    const res = await api.get(`${API_URL}/profile/${id}/stats`);

    return res.data;
  } catch (err: any) {
    throw err;
  }
};
