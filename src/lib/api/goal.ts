import { API_URL } from '@/constants';
import api from '../clientAxios';
import nProgress from 'nprogress';
import { Goal, GetGoalsPaginationDto, PaginatedGoalsResponse } from '@/types';

export const createGoal = async (goal: FormData) => {
  try {
    const res = await api.post(`${API_URL}/goals`, goal);

    nProgress.start();
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const updateGoal = async (id: string, goal: FormData) => {
  try {
    const res = await api.put(`${API_URL}/goals/${id}`, goal);

    nProgress.start();
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const deleteGoal = async (id: string): Promise<void> => {
  try {
    await api.delete(`/goals/${id}`);
  } catch (err: any) {
    throw err;
  }
};

export const getGoals = async (
  userId: string,
  pagination?: GetGoalsPaginationDto,
): Promise<Goal[] | PaginatedGoalsResponse> => {
  try {
    const params = new URLSearchParams();
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());

    const url = `${API_URL}/goals/userGoals/${userId}${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await api.get(url);

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

export const updateStepStatus = async (goalId: string, stepId: string, isCompleted: boolean): Promise<void> => {
  try {
    await api.put(`${API_URL}/goals/${goalId}/steps/${stepId}/complete`, {
      isCompleted,
    });
  } catch (err: any) {
    throw err;
  }
};

export const createStep = async (goalId: string, stepText: string): Promise<void> => {
  try {
    await api.post(`${API_URL}/goals/${goalId}/steps`, {
      text: stepText,
    });
  } catch (err: any) {
    throw err;
  }
};

export const updateStepText = async (goalId: string, stepId: string, text: string): Promise<void> => {
  try {
    await api.put(`${API_URL}/goals/${goalId}/steps/${stepId}`, {
      text,
    });
  } catch (err: any) {
    throw err;
  }
};

export const deleteStep = async (goalId: string, stepId: string): Promise<void> => {
  try {
    await api.delete(`${API_URL}/goals/${goalId}/steps/${stepId}`);
  } catch (err: any) {
    throw err;
  }
};

export const completeGoal = async (goalId: string): Promise<Goal> => {
  try {
    const res = await api.put(`${API_URL}/goals/${goalId}/completeGoal`);
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const archiveGoal = async (goalId: string): Promise<Goal> => {
  try {
    const res = await api.put(`${API_URL}/goals/${goalId}/archive`);
    return res.data;
  } catch (err: any) {
    throw err;
  }
};
