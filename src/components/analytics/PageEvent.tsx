'use client';
import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

interface PageEventProps {
  name: string;
  params?: Record<string, unknown>;
}

export function PageEvent({ name, params }: PageEventProps) {
  useEffect(() => {
    trackEvent(name, params ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default PageEvent;
