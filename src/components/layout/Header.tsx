'use client';

import { usePathname } from 'next/navigation';
import LinkWithProgress from '../Link';
import ThemeToggle from '../ThemeToggle';
import Image from 'next/image';
import { useUserProfile } from '@/context/UserProfileContext';
import { useState } from 'react';
import OverlaySidebar from './sidebar/OverlaySidebar';
import { IMAGE_URL } from '@/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

export const Header = () => {
  const pathname = usePathname();
  const { profile, isLoading } = useUserProfile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === '/auth/login' || pathname === '/auth/register') return null;

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-sm py-4 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <LinkWithProgress href="/">
              <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 cursor-pointer">PeaklyGo</h1>
            </LinkWithProgress>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <i className="fa-solid fa-bell"></i>
            </button>
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <i className="fa-solid fa-envelope"></i>
            </button>
            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" aria-hidden />
            ) : profile ? (
              <button
                aria-label="Open profile menu"
                aria-expanded={sidebarOpen}
                onClick={() => setSidebarOpen(true)}
                className="h-8 w-8 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {profile.avatar ? (
                  <Image
                    src={`${IMAGE_URL}/${profile.avatar}`}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} className="text-white text-xl" />
                  </div>
                )}
              </button>
            ) : (
              <a
                href="/auth/login"
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100"
              >
                Регистрация
              </a>
            )}
          </div>
        </div>
      </header>

      {sidebarOpen && <OverlaySidebar onClose={() => setSidebarOpen(false)} />}
    </>
  );
};
