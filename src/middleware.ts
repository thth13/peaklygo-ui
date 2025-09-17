import { NextResponse, NextRequest } from 'next/server';

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

export function middleware(req: NextRequest) {
  const token = req.cookies.get('accessToken')?.value;
  const userId = req.cookies.get('userId')?.value;

  // Handle auth redirect
  if (
    req.nextUrl.pathname === '/' ||
    req.nextUrl.pathname === '/auth/login' ||
    req.nextUrl.pathname === '/auth/register'
  ) {
    if (token && userId) {
      return NextResponse.redirect(new URL(`/profile/${userId}`, req.url));
    }
  }

  // Set locale header from cookie or Accept-Language
  const response = NextResponse.next();

  let locale = req.cookies.get('locale')?.value;

  if (!locale) {
    // Detect locale from Accept-Language header
    const acceptLanguage = req.headers.get('accept-language');
    locale = getDeviceLocaleFromHeaders(acceptLanguage);

    // Set cookie for future requests
    response.cookies.set('locale', locale, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  response.headers.set('x-locale', locale);

  return response;
}
