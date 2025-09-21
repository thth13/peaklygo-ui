'use client';
import NProgress from 'nprogress';
import { createContext, useState, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';
import { googleLoginUser, loginUser, registerUser } from '../lib/api';
import { api } from '../lib/clientAxios';
import { CodeResponse } from '@react-oauth/google';
import { trackEvent } from '@/lib/analytics';

interface AuthContextType {
  userId: string;
  authUser: (email: string, password: string, isLogin: boolean, username?: string) => Promise<void>;
  googleLogin: (codeResponse: CodeResponse) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  userId: '',
  authUser: async () => {},
  googleLogin: async () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const cookiesUserId = Cookies.get('userId');
    if (cookiesUserId && !userId) {
      setUserId(cookiesUserId);
    }
  }, [userId]);

  const googleLogin = async (codeResponse: CodeResponse) => {
    try {
      const data = await googleLoginUser(codeResponse);
      trackEvent('register_success', { method: 'credentials' });
      signIn(data);
    } catch (err) {
      throw err;
    }
  };

  const authUser = async (email: string, password: string, isLogin: boolean, username?: string) => {
    try {
      let data;

      if (isLogin) {
        data = await loginUser(email, password);
      } else {
        if (!username) {
          throw new Error('Username is required for registration');
        }
        data = await registerUser(email, username, password);
      }

      signIn(data);
    } catch (err) {
      throw err;
    }
  };

  const signIn = (userData: any) => {
    const { id, accessToken, refreshToken } = userData;
    NProgress.start();

    Cookies.set('accessToken', accessToken, { path: '/' });
    Cookies.set('refreshToken', refreshToken, { path: '/' });
    Cookies.set('userId', id, { path: '/' });

    setUserId(id);

    // For update cookie on the ssr
    window.location.reload();
  };

  const logout = () => {
    setUserId('');
    NProgress.start();

    const cookiesToRemove = ['accessToken', 'refreshToken', 'userId'];
    cookiesToRemove.forEach((cookie) => Cookies.remove(cookie, { path: '/' }));

    api.defaults.headers.common['Authorization'] = '';

    window.location.href = '/';
  };

  return <AuthContext.Provider value={{ userId, authUser, googleLogin, logout }}>{children}</AuthContext.Provider>;
};
