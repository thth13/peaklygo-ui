import axios, { AxiosInstance } from 'axios';
import { cookies } from 'next/headers';
import { API_URL } from '@/constants';

// SSR Axios for accessToken in SSR
export async function createServerApi(): Promise<AxiosInstance> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
  });

  return instance;
}
