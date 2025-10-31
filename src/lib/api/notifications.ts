import { AxiosInstance } from 'axios';
import api from '../clientAxios';
import { API_URL } from '@/constants';
import { GetNotificationsQuery, NotificationsResponse } from '@/types';

export const getNotifications = async (
  query: GetNotificationsQuery = {},
  apiInstance?: AxiosInstance,
): Promise<NotificationsResponse> => {
  const client = apiInstance ?? api;
  const response = await client.get(`${API_URL}/notifications`, {
    params: query,
  });

  return response.data as NotificationsResponse;
};

export const markNotificationAsRead = async (notificationId: string, apiInstance?: AxiosInstance): Promise<void> => {
  const client = apiInstance ?? api;
  await client.patch(`${API_URL}/notifications/${notificationId}/read`);
};

export const markNotificationsAsRead = async (
  notificationIds: string[],
  apiInstance?: AxiosInstance,
): Promise<void> => {
  if (!notificationIds.length) {
    return;
  }
  const client = apiInstance ?? api;
  await client.patch(`${API_URL}/notifications/mark-read`, {
    notificationIds,
  });
};

export const markAllNotificationsAsRead = async (apiInstance?: AxiosInstance): Promise<void> => {
  const client = apiInstance ?? api;
  await client.patch(`${API_URL}/notifications/mark-all-read`);
};

export const markNotificationResponse = async (
  notificationId: string,
  response: 'accepted' | 'declined',
  apiInstance?: AxiosInstance,
): Promise<void> => {
  const client = apiInstance ?? api;
  await client.patch(`${API_URL}/notifications/${notificationId}/respond`, {
    response,
  });
};
