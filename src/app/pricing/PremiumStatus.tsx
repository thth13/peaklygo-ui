'use client';
import { useTranslations } from 'next-intl';
import { useUserProfile } from '@/context/UserProfileContext';
import { useMemo } from 'react';

export const PremiumStatus: React.FC = () => {
  const t = useTranslations('pricing');
  const tb = useTranslations('pricing.proBenefits');
  const { profile } = useUserProfile();

  const formattedExpiry = useMemo(() => {
    const expiresAt = profile?.user.proExpires ? new Date(profile.user.proExpires) : null;
    if (!expiresAt) return null;
    return expiresAt.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [profile?.user.proExpires]);

  const benefits: { key: string; future?: boolean }[] = [
    { key: 'unlimitedGoals' },
    { key: 'proBadge' },
    { key: 'prioritySupport' },
    { key: 'advancedStats', future: true },
    { key: 'aiAssistant', future: true },
    { key: 'groupChallenges', future: true },
  ];

  return (
    <div className="w-full md:w-3/4 px-2 md:px-6 md:py-5">
      <section className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {t('premiumStatus.title')}
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t('premiumStatus.subtitle')}</p>
      </section>
      <div className="rounded-2xl border border-primary-500 ring-2 ring-primary-500/20 bg-white dark:bg-gray-900 p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-600 text-white text-xs font-semibold">
              {t('premiumStatus.badge')}
            </div>
            {formattedExpiry && (
              <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                {t('premiumStatus.expiresLabel', { date: formattedExpiry })}
              </h2>
            )}
          </div>
          {/* <div className="flex gap-3">
            <button
              onClick={onManage}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900/90 dark:bg-gray-800 text-white hover:bg-gray-900"
            >
              {t('premiumStatus.manage')}
            </button>
          </div> */}
        </div>
        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            {t('premiumStatus.yourBenefits')}
          </h3>
          <ul className="grid gap-2 sm:grid-cols-2 text-sm text-gray-700 dark:text-gray-300">
            {benefits.map((b) => (
              <li
                key={b.key}
                className={
                  b.future ? 'text-gray-500 dark:text-gray-400 flex items-center gap-2' : 'flex items-center gap-2'
                }
              >
                <span className="inline-block w-2 h-2 rounded-full bg-primary-500" />
                {tb(b.key)}
                {b.future ? ` (${tb('futureLabel')})` : ''}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
