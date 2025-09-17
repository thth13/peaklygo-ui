import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

const locales = ['en', 'ua', 'ru'] as const;

// Function to get user's device locale from Accept-Language header
const getDeviceLocaleFromHeaders = (acceptLanguage: string | null): string => {
  if (!acceptLanguage) return 'en';

  // Parse Accept-Language header (e.g., "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7")
  const languages = acceptLanguage
    .split(',')
    .map((lang) => lang.split(';')[0].split('-')[0].trim().toLowerCase())
    .filter((lang) => locales.includes(lang as any));

  return languages[0] || 'en';
};

export default getRequestConfig(async () => {
  // Get locale from cookie or header set by middleware
  const cookieStore = await cookies();
  const headersList = await headers();

  let locale =
    cookieStore.get('locale')?.value ||
    headersList.get('x-locale') ||
    getDeviceLocaleFromHeaders(headersList.get('accept-language'));

  // Validate locale
  if (!locales.includes(locale as any)) {
    locale = 'en';
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
