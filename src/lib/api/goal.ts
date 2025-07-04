import { API_URL } from '@/constants';
import api from '../clientAxios';
import nProgress from 'nprogress';
import { Goal } from '@/types';

export const createGoal = async (goal: FormData) => {
  try {
    const res = await api.post(`${API_URL}/goals`, goal);

    nProgress.start();
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const getGoals = async (userId: string): Promise<Goal[]> => {
  try {
    const res = await api.get(`${API_URL}/goals/userGoals/${userId}`);

    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const getGoal = async (id: string): Promise<Goal> => {
  try {
    const res = await api.get(`${API_URL}/goals/${id}`);

    return res.data;
  } catch (err: any) {
    throw err;
  }
};
