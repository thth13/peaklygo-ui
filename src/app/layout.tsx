import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import ProgressBar from './ProgressBar';
import './globals.css';
import { UserProfileProvider } from '@/context/UserProfileContext';
import { Header } from '@/components/layout/Header';
import { Suspense } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale, getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations('metadata');
  const keywords = (t.raw('keywords') as string[]) ?? [];

  const ogLocaleMap: Record<string, string> = {
    en: 'en_US',
    ru: 'ru_RU',
    ua: 'uk_UA',
  };

  return {
    metadataBase: new URL('https://peaklygo.com'),
    title: t('title'),
    description: t('description'),
    keywords,
    icons: {
      icon: [
        { url: '/favicons/favicon_16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicons/favicon_32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicons/favicon_192x192.png', sizes: '192x192', type: 'image/png' },
      ],
      shortcut: '/favicons/favicon_32x32.png',
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://peaklygo.com',
      siteName: 'PeaklyGo',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'PeaklyGo' }],
      type: 'website',
      locale: ogLocaleMap[locale] ?? 'en_US',
      alternateLocale: Object.values(ogLocaleMap).filter((l) => l !== (ogLocaleMap[locale] ?? 'en_US')),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/og-image.png'],
    },
    category: 'Productivity',
    applicationName: 'PeaklyGo',
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="bg-gray-50 dark:bg-gray-900 font-sans transition-colors">
        <GoogleAnalytics gaId="G-2T8QM142RE" />
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <UserProfileProvider>
              <Header />
              <Suspense fallback={null}>
                <ProgressBar />
              </Suspense>
              {children}
              <Toaster position="top-right" />
            </UserProfileProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
