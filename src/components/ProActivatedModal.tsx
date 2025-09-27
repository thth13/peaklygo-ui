'use client';
import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { generateConfettiPieces, confettiStyles } from '@/lib/confetti';
import { PlanType } from '@/types';

interface ProActivatedModalProps {
  plan: PlanType | null;
  onClose: () => void;
}

export const ProActivatedModal = ({ plan, onClose }: ProActivatedModalProps) => {
  const t = useTranslations('pricing.modal');
  const tb = useTranslations('pricing.proBenefits');
  const [mounted] = useState<boolean>(true);
  const [showConfetti, setShowConfetti] = useState<boolean>(true);

  // Prepare confetti pieces

  const confettiPieces = useMemo(() => {
    return generateConfettiPieces({
      count: 200,
      maxDelay: 5,
      minDuration: 3,
      maxDuration: 5,
    });
  }, []);

  useEffect(() => {
    if (!plan) return;
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, [plan]);

  if (!plan || !mounted) return null;

  const title = plan === 'monthly' ? t('proActivatedTitle') : t('annualActivatedTitle');
  const benefits: { key: string; future?: boolean }[] = [
    { key: 'unlimitedGoals' },
    { key: 'proBadge' },
    { key: 'prioritySupport' },
    { key: 'advancedStats', future: true },
    { key: 'aiAssistant', future: true },
    { key: 'groupChallenges', future: true },
  ];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {confettiPieces.map((p) => (
            <span
              key={p.id}
              className="block absolute top-[-20px] animate-[confetti-fall_linear_infinite] will-change-transform"
              style={{
                left: `${p.left}%`,
                width: p.shape > 0.5 ? p.size : p.size * 0.4,
                height: p.size,
                background: `hsl(${p.hue} 90% 55%)`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                transform: `rotate(${p.rotate}deg)`,
                borderRadius: p.shape > 0.8 ? '50%' : '2px',
              }}
            />
          ))}
        </div>
      )}
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-xl animate-scaleIn overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_30%_20%,#6366F1,transparent_60%),radial-gradient(circle_at_70%_80%,#EC4899,transparent_55%)]" />
        <div className="relative">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-400 shadow-lg ring-4 ring-primary-500/25">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1"
              aria-hidden="true"
              className="text-white drop-shadow"
            >
              <path d="M12 2.7l2.65 5.37 5.93.86-4.29 4.18 1.01 5.9L12 16.98 6.7 19.01l1.01-5.9L3.42 8.93l5.93-.86L12 2.7Z" />
            </svg>
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white text-center mb-1">
            {t('congrats')}
          </h3>
          <h4 className="text-lg font-semibold text-primary-600 dark:text-primary-400 text-center mb-3">{title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 text-center leading-relaxed">
            {t('description')}
          </p>
          <ul className="space-y-2 mb-6 text-sm">
            {benefits.map((b) => (
              <li
                key={b.key}
                className={`flex items-start gap-2 rounded-md px-2 py-1.5 ${
                  b.future
                    ? 'bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400'
                    : 'bg-primary-50 dark:bg-primary-900/30 text-gray-700 dark:text-gray-200'
                }`}
              >
                <span
                  className={`mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-sm text-[10px] font-bold ${
                    b.future
                      ? 'bg-gray-300/60 dark:bg-gray-600 text-gray-700 dark:text-gray-100'
                      : 'bg-primary-600 text-white'
                  }`}
                >
                  {b.future ? '…' : '✓'}
                </span>
                <span className="flex-1">
                  {tb(b.key)}{' '}
                  {b.future && (
                    <span className="ml-1 inline-block align-middle text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {tb('futureLabel')}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <button
            onClick={onClose}
            className="w-full px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold tracking-wide shadow focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 transition-colors"
          >
            {t('close')}
          </button>
        </div>
        <style>{confettiStyles}</style>
      </div>
    </div>,
    document.body,
  );
};
