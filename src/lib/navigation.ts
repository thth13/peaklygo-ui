export { default as Link } from 'next/link';
export { redirect } from 'next/navigation';
export { usePathname, useRouter } from 'next/navigation';

import { LOCALES } from '../constants';
export const locales = LOCALES;

// Function to get user's device locale
export const getDeviceLocale = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side: use navigator language
    const browserLocale = navigator.language.split('-')[0];
    return locales.includes(browserLocale as any) ? browserLocale : 'en';
  }

  // Server-side: return fallback
  return 'en';
};

export const defaultLocale = getDeviceLocale();
