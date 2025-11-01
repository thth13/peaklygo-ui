'use client';

import { usePathname } from 'next/navigation';
import LinkWithProgress from '../Link';
import ThemeToggle from '../ThemeToggle';
import Image from 'next/image';
import { useUserProfile } from '@/context/UserProfileContext';
import { useState, useContext } from 'react';
import OverlaySidebar from './sidebar/OverlaySidebar';
import { IMAGE_URL } from '@/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { AuthContext } from '@/context/AuthContext';
import { NotificationsDropdown } from './NotificationsDropdown';

export const Header = () => {
  const pathname = usePathname();
  const { profile, isLoading } = useUserProfile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const t = useTranslations('header');

  if (pathname === '/auth/login' || pathname === '/auth/register') return null;

  // Show different header for homepage
  if (pathname === '/') {
    return (
      <header className="bg-white shadow-sm py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-primary-600">PeaklyGo</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-6">
            <LanguageSwitcher />
            <a
              href="#how-it-works"
              className="hidden sm:block text-gray-600 hover:text-primary-600 font-medium cursor-pointer"
            >
              {t('howItWorks')}
            </a>
            <a href="#cta" className="hidden sm:block text-gray-600 hover:text-primary-600 font-medium cursor-pointer">
              {t('community')}
            </a>
            <LinkWithProgress
              href="/auth/login"
              className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 sm:px-6 rounded-lg font-medium text-sm sm:text-base"
            >
              {t('login')}
            </LinkWithProgress>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-sm py-4 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <LinkWithProgress href="/">
              <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 cursor-pointer flex items-baseline gap-2">
                <span>PeaklyGo</span>
                <span className="text-[0.55rem] leading-none px-1 py-0.5 rounded bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-semibold tracking-wide">
                  beta
                </span>
              </h1>
            </LinkWithProgress>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
              className="sm:hidden p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-primary-300 dark:hover:bg-gray-800 transition-colors"
            >
              <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
            </button>
            <div className="sm:hidden">
              <NotificationsDropdown />
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <NotificationsDropdown />
              <ThemeToggle />
              {/* <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                <FontAwesomeIcon icon={faBell} />
              </button>
              <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                <FontAwesomeIcon icon={faEnvelope} />
              </button> */}
              {isLoading ? (
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" aria-hidden />
              ) : profile ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={logout}
                    className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={t('logout')}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                  </button>
                  <button
                    aria-label={t('profileMenu')}
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
                </div>
              ) : (
                <a
                  href="/auth/register"
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100"
                >
                  {t('register')}
                </a>
              )}
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {sidebarOpen && <OverlaySidebar onClose={() => setSidebarOpen(false)} />}
    </>
  );
};
