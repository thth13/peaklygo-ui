import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import ProgressBar from './ProgressBar';
import './globals.css';
import { UserProfileProvider } from '@/context/UserProfileContext';
import { Header } from '@/components/layout/Header';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'PeaklyGo - Делайте прогресс видимым. Достигайте цели осознанно',
  description:
    'Место, где ваши цели превращаются в чёткий план и понятную историю прогресса. Без сложностей, без шума — только движение вперёд.',
  openGraph: {
    title: 'PeaklyGo - Делайте прогресс видимым. Достигайте цели осознанно',
    description:
      'Место, где ваши цели превращаются в чёткий план и понятную историю прогресса. Без сложностей, без шума — только движение вперёд.',
    url: 'https://peaklygo.com',
    siteName: 'PeaklyGo',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PeaklyGo',
      },
    ],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 font-sans transition-colors">
        <GoogleAnalytics gaId="G-2T8QM142RE" />
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
      </body>
    </html>
  );
}
