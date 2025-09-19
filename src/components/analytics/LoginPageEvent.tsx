'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

export function LoginPageEvent() {
  useEffect(() => {
    trackEvent('login_page_open', { location: 'auth/login' });
  }, []);
  return null;
}

export default LoginPageEvent;
