import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import ProgressBar from './ProgressBar';
import './globals.css';
import { UserProfileProvider } from '@/context/UserProfileContext';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'PeaklyGo',
  description: 'PeaklyGo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <UserProfileProvider>
            <ProgressBar />
            {children}
          </UserProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
