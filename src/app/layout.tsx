import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import ProgressBar from './ProgressBar';
import './globals.css';
import { UserProfileProvider } from '@/context/UserProfileContext';
import { Header } from '@/components/layout/Header';

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
      <body className="bg-gray-50 dark:bg-gray-900 font-sans transition-colors">
        <Header />
        <AuthProvider>
          <UserProfileProvider>
            <ProgressBar />
            {children}
            <Toaster position="top-right" />
          </UserProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
