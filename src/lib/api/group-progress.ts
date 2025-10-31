import { API_URL } from '@/constants';
import api from '../clientAxios';
import { ProgressEntry, Comment, CreateCommentDto } from '@/types';

export const getGroupProgressEntries = async (
  goalId: string,
  page: number = 1,
  limit: number = 10,
): Promise<ProgressEntry[]> => {
  try {
    const res = await api.get(`${API_URL}/goals/group/${goalId}/progress-entries`, {
      params: { page, limit },
    });
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const createGroupProgressEntry = async (goalId: string, content: string): Promise<ProgressEntry> => {
  try {
    const res = await api.post(`${API_URL}/goals/group/${goalId}/progress-entries`, {
      content,
    });
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const toggleGroupProgressEntryLike = async (progressEntryId: string): Promise<ProgressEntry> => {
  try {
    const res = await api.post(`${API_URL}/goals/group/progress-entries/${progressEntryId}/like`);
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const getGroupProgressEntryComments = async (
  progressEntryId: string,
  page: number = 1,
  limit: number = 20,
): Promise<Comment[]> => {
  try {
    const res = await api.get(`${API_URL}/goals/group/progress-entries/${progressEntryId}/comments`, {
      params: { page, limit },
    });
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const createGroupProgressEntryComment = async (
  progressEntryId: string,
  createDto: CreateCommentDto,
): Promise<Comment> => {
  try {
    const res = await api.post(`${API_URL}/goals/group/progress-entries/${progressEntryId}/comments`, createDto);
    return res.data;
  } catch (err: any) {
    throw err;
  }
};
