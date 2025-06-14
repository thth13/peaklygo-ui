import { API_URL } from '@/constants';
import api from '../clientAxios';
import nProgress from 'nprogress';

export const createGoal = async (userId: string, goal: FormData) => {
  try {
    const res = await api.post(`${API_URL}/goals/${userId}`, goal);

    nProgress.start();
    return res.data;
  } catch (err: any) {
    throw err;
  }
};
