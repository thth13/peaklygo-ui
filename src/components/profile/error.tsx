'use client';

import { useEffect } from 'react';
import LinkWithProgress from '@/components/Link';
import { LeftSidebar } from '@/components/layout/sidebar';
import { useTranslations } from 'next-intl';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProfileError({ error, reset }: ErrorPageProps) {
  const t = useTranslations('profile');

  useEffect(() => {
    console.error('Profile page error:', error);
  }, [error]);

  return (
    <main className="max-w-7xl mx-auto mt-6 px-4 flex">
      <LeftSidebar />
      <div id="main-content" className="w-3/5 px-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('error.loadingError')}</h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6">{t('error.errorDescription')}</p>

          {error.message && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-6 font-mono bg-red-50 dark:bg-red-950 p-3 rounded border">
              {error.message}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              {t('error.tryAgain')}
            </button>

            <LinkWithProgress
              href="/"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              {t('error.backToHome')}
            </LinkWithProgress>
          </div>
        </div>
      </div>

      <div className="w-1/5 pl-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('error.whatCanDo')}</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• {t('error.refreshPage')}</li>
            <li>• {t('error.checkConnection')}</li>
            <li>• {t('error.tryLater')}</li>
            <li>• {t('error.contactSupport')}</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
