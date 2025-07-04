import type { Metadata } from 'next';
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
      <body className="bg-gray-50 font-sans">
        <Header />
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
