import { API_URL } from '@/constants';
import api from '../clientAxios';
import nProgress from 'nprogress';
import { GoalFormData } from '@/app/goal/create/page';

export const getProfile = async (goal: GoalFormData) => {
  try {
    const res = await api.post(`${API_URL}/goals`, { goal });

    return res.data;
  } catch (err: any) {
    throw err;
  }
};
