import { API_URL } from '@/constants';
import api from '../clientAxios';
import { ProgressEntry, CreateProgressEntryDto } from '@/types';

export const getProgressEntries = async (
  goalId: string,
  page: number = 1,
  limit: number = 10,
): Promise<ProgressEntry[]> => {
  try {
    const res = await api.get(`${API_URL}/progress-entries/goal/${goalId}`, {
      params: { page, limit },
    });
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const createProgressEntry = async (createDto: CreateProgressEntryDto): Promise<ProgressEntry> => {
  try {
    const res = await api.post(`${API_URL}/progress-entries`, createDto);
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const toggleLike = async (progressEntryId: string): Promise<ProgressEntry> => {
  try {
    const res = await api.post(`${API_URL}/progress-entries/${progressEntryId}/like`);
    return res.data;
  } catch (err: any) {
    throw err;
  }
};
