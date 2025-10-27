import { API_URL } from '@/constants';
import api from '../clientAxios';
import nProgress from 'nprogress';
import {
  Goal,
  GroupGoal,
  GetGoalsPaginationDto,
  PaginatedGoalsResponse,
  LandingGoal,
  GoalFilterType,
  MarkHabitDayDto,
  GroupGoalStats,
} from '@/types';
import { AxiosInstance } from 'axios';

export const createGoal = async (goal: FormData) => {
  try {
    const res = await api.post(`${API_URL}/goals`, goal);

    nProgress.start();
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const createGroupGoal = async (goal: FormData) => {
  try {
    const res = await api.post(`${API_URL}/goals/group`, goal);

    nProgress.start();
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const updateGroupGoal = async (goalId: string, goal: FormData) => {
  try {
    const res = await api.put(`${API_URL}/goals/group/${goalId}`, goal);

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

export const getLandingGoals = async (apiInstance?: AxiosInstance): Promise<LandingGoal[]> => {
  try {
    const client = apiInstance ?? api;
    const res = await client.get(`${API_URL}/goals/landing`);

    return res.data as LandingGoal[];
  } catch (err: any) {
    throw err;
  }
};

export const getGoal = async (id: string, apiInstance?: AxiosInstance): Promise<Goal> => {
  try {
    const client = apiInstance ?? api;
    const res = await client.get(`${API_URL}/goals/${id}`);

    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const getGroupGoal = async (id: string, apiInstance?: AxiosInstance): Promise<GroupGoal> => {
  try {
    const client = apiInstance ?? api;
    const res = await client.get(`${API_URL}/goals/group/${id}`);

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

export const markGroupCheckIn = async (goalId: string, date: Date, isCompleted: boolean): Promise<void> => {
  try {
    await api.patch(`${API_URL}/goals/group/${goalId}/check-in`, {
      date,
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

export const unarchiveGoal = async (goalId: string): Promise<Goal> => {
  try {
    const res = await api.put(`${API_URL}/goals/${goalId}/unarchive`);
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const getGoals = async (
  userId: string,
  pagination?: GetGoalsPaginationDto,
  apiInstance?: AxiosInstance,
): Promise<Goal[] | PaginatedGoalsResponse> => {
  try {
    const params = new URLSearchParams();
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    if (pagination?.filter) params.append('filter', pagination.filter);

    const url = `${API_URL}/goals/userGoals/${userId}${params.toString() ? `?${params.toString()}` : ''}`;
    const client = apiInstance ?? api;
    const res = await client.get(url);

    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const getActiveGoals = async (
  userId: string,
  pagination?: GetGoalsPaginationDto,
  apiInstance?: AxiosInstance,
): Promise<Goal[] | PaginatedGoalsResponse> => {
  return getGoals(userId, { ...pagination, filter: GoalFilterType.ACTIVE }, apiInstance);
};

export const getArchivedGoals = async (
  userId: string,
  pagination?: GetGoalsPaginationDto,
  apiInstance?: AxiosInstance,
): Promise<Goal[] | PaginatedGoalsResponse> => {
  return getGoals(userId, { ...pagination, filter: GoalFilterType.ARCHIVED }, apiInstance);
};

export const getCompletedGoals = async (
  userId: string,
  pagination?: GetGoalsPaginationDto,
  apiInstance?: AxiosInstance,
): Promise<Goal[] | PaginatedGoalsResponse> => {
  return getGoals(userId, { ...pagination, filter: GoalFilterType.COMPLETED }, apiInstance);
};

export const markHabitDay = async (goalId: string, date: Date, isCompleted: boolean): Promise<any> => {
  try {
    const dateString = date.toLocaleDateString('en-CA');

    const markHabitDayDto: MarkHabitDayDto = {
      date: dateString,
      isCompleted,
    };

    const res = await api.put(`/goals/${goalId}/markHabitDay`, markHabitDayDto);

    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export interface GroupGoalUserSearchResult {
  userId: string;
  username: string;
  name: string;
  avatar?: string;
}

interface GroupGoalUserSearchParams {
  query: string;
  limit?: number;
  goalId?: string;
  excludeUserIds?: string[];
}

export const searchGroupGoalUsers = async ({
  query,
  limit = 10,
  goalId,
  excludeUserIds = [],
}: GroupGoalUserSearchParams): Promise<GroupGoalUserSearchResult[]> => {
  try {
    const params = new URLSearchParams({ query });
    if (limit) {
      params.append('limit', Math.min(limit, 50).toString());
    }
    if (goalId) {
      params.append('goalId', goalId);
    }
    if (excludeUserIds.length > 0) {
      params.append('excludeUserIds', excludeUserIds.join(','));
    }

    const res = await api.get(`${API_URL}/goals/group/users/search?${params.toString()}`);
    return res.data as GroupGoalUserSearchResult[];
  } catch (err: any) {
    throw err;
  }
};

export const getMyGroupGoals = async (
  pagination?: GetGoalsPaginationDto,
  apiInstance?: AxiosInstance,
): Promise<Goal[] | PaginatedGoalsResponse> => {
  try {
    const params = new URLSearchParams();
    if (pagination?.page) {
      params.append('page', pagination.page.toString());
    }
    if (pagination?.limit) {
      params.append('limit', pagination.limit.toString());
    }
    if (pagination?.filter) {
      params.append('filter', pagination.filter);
    }

    const query = params.toString();
    const url = `${API_URL}/goals/group/my${query ? `?${query}` : ''}`;
    const client = apiInstance ?? api;
    const res = await client.get(url);

    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const getGroupGoalStats = async (goalId: string, apiInstance?: AxiosInstance): Promise<GroupGoalStats> => {
  try {
    const client = apiInstance ?? api;
    const res = await client.get(`${API_URL}/goals/${goalId}/group/stats`);

    return res.data as GroupGoalStats;
  } catch (err: any) {
    throw err;
  }
};
