import { API_URL } from '@/constants';
import { api } from '../clientAxios';

export type PremiumType = 'monthly' | 'year';

export const getPremium = async (type: PremiumType): Promise<any> => {
  try {
    const res = await api.post(`${API_URL}/user/get-premium`, { type });

    return res.data;
  } catch (err: any) {
    throw err;
  }
};
