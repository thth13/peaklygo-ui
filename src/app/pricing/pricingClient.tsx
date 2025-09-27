'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProActivatedModal } from '@/components/ProActivatedModal';
import { getPremium } from '@/lib/api';
import { useUserProfile } from '@/context/UserProfileContext';
import { PremiumStatus } from './PremiumStatus';
import { PlanType } from '@/types';

const plans = [
  { key: 'basic', highlight: false },
  { key: 'monthly', highlight: true },
  { key: 'annual', highlight: false },
];

export default function PricingClient() {
  const t = useTranslations('pricing');
  const tb = useTranslations('pricing.proBenefits');
  const { profile, refetchProfile, isLoading } = useUserProfile();
  const [activatedPlan, setActivatedPlan] = useState<PlanType | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);

  const proBenefits: { key: string; future?: boolean }[] = [
    { key: 'unlimitedGoals' },
    { key: 'proBadge' },
    { key: 'prioritySupport' },
    { key: 'advancedStats', future: true },
    { key: 'aiAssistant', future: true },
    { key: 'groupChallenges', future: true },
  ];

  // const planToPremiumTypeMap: Record<PlanType, PremiumType> = {
  //   monthly: 'monthly',
  //   annual: 'year',
  // };

  const handleSelect = async (plan: PlanType) => {
    if (loadingPlan) return;
    setLoadingPlan(plan);
    try {
      // Временно всегда активируем 'year', раскомментировать строку ниже для возврата к нормальной логике
      // const premiumType = planToPremiumTypeMap[plan];
      const premiumType = 'year';
      await getPremium(premiumType);
      setActivatedPlan(plan);
    } catch (e) {
      // Minimal error handling; extend with toast/notification if available
      console.error('Failed to activate premium:', e);
    } finally {
      setLoadingPlan(null);
    }
  };

  if (isLoading) {
    return (
      <div id="main-content" className="w-full md:w-3/4 px-2 md:px-6 md:py-16 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <svg
            className="w-5 h-5 animate-spin text-primary-600 dark:text-primary-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (profile?.user.isPro) {
    return <PremiumStatus />;
  }

  return (
    <div id="main-content" className="w-full md:w-3/4 px-2 md:px-6 md:py-5">
      <section className="text-center mb-12 md:mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {t('hero.title')}
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t('hero.subtitle')}</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {plans.map((plan) => {
          const planPath = `plans.${plan.key}`;
          const isHighlight = plan.highlight;
          return (
            <div
              key={plan.key}
              className={`relative rounded-2xl border bg-white dark:bg-gray-900 p-6 flex flex-col ${
                isHighlight
                  ? 'border-primary-500 shadow-lg ring-2 ring-primary-500/20'
                  : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              {isHighlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                  {t(`${planPath}.popular`)}
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t(`${planPath}.name`)}</h3>
              <div className="mt-4 flex flex-wrap items-end gap-2">
                {plan.key === 'basic' ? (
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{t(`${planPath}.price`)}</span>
                ) : (
                  <>
                    <span className="text-lg md:text-xl font-semibold text-gray-400 dark:text-gray-500 line-through relative -top-1">
                      {t(`${planPath}.price`)}
                    </span>
                    <span className="text-3xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                      $0
                    </span>
                  </>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400 w-full sm:w-auto leading-snug break-words">
                  {t(`${planPath}.period`)}
                </span>
              </div>
              {plan.key !== 'basic' && (
                <div className="mt-1 text-[11px] font-medium text-primary-600 dark:text-primary-400">
                  {t('earlyBird.label')}
                </div>
              )}
              {/* {plan.key === 'annual' && (
                <div className="mt-1 text-xs text-primary-600 dark:text-primary-400 font-medium">
                  {t('plans.annual.note')}
                </div>
              )} */}
              <ul className="mt-6 space-y-2 text-sm text-gray-700 dark:text-gray-300 flex-1">
                {plan.key === 'basic' && (
                  <>
                    <li>{t('features.upTo5Goals')}</li>
                    <li>{t('features.basicAnalytics')}</li>
                    <li>{t('features.joinChallenges')}</li>
                  </>
                )}
                {(plan.key === 'monthly' || plan.key === 'annual') &&
                  proBenefits.map((benefit) => (
                    <li key={benefit.key} className={benefit.future ? 'text-gray-500 dark:text-gray-400' : ''}>
                      {tb(benefit.key)}
                      {benefit.future ? ` (${tb('futureLabel')})` : ''}
                    </li>
                  ))}
              </ul>
              <div className="mt-6">
                {plan.key === 'basic' ? (
                  <button
                    disabled
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm"
                  >
                    {t('plans.basic.current')}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelect(plan.key as PlanType)}
                    disabled={loadingPlan === (plan.key as PlanType)}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                      isHighlight
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-900/90 dark:bg-gray-800 text-white hover:bg-gray-900'
                    }`}
                  >
                    {loadingPlan === plan.key ? (
                      <svg
                        className="w-4 h-4 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                    ) : null}
                    {t(`${planPath}.cta`)}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">{t('comparison.title')}</h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-semibold text-gray-700 dark:text-gray-300 w-1/3">{t('comparison.feature')}</th>
                <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">{t('comparison.basic')}</th>
                <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">{t('comparison.monthly')}</th>
                <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">{t('comparison.annual')}</th>
              </tr>
            </thead>
            <tbody>
              {featureRows.map((row) => (
                <tr key={row.key} className="border-t border-gray-200 dark:border-gray-800">
                  <td className="p-4 text-gray-900 dark:text-white">{t(`comparison.rows.${row.key}`)}</td>
                  <td className="p-4 text-gray-700 dark:text-gray-300">{row.basic}</td>
                  <td className="p-4 text-gray-700 dark:text-gray-300">{row.monthly}</td>
                  <td className="p-4 text-gray-700 dark:text-gray-300">{row.annual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section> */}

      <ProActivatedModal
        plan={activatedPlan}
        onClose={async () => {
          if (activatedPlan) {
            try {
              await refetchProfile();
            } catch (e) {
              console.error('Failed to refresh profile after activation', e);
            }
          }
          setActivatedPlan(null);
        }}
      />
    </div>
  );
}
