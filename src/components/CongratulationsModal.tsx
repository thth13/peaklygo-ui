'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useUserProfile } from '@/context/UserProfileContext';
import { generateConfettiPieces, confettiStyles } from '@/lib/confetti';

interface CongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CongratulationsModal = ({ isOpen, onClose }: CongratulationsModalProps) => {
  const t = useTranslations('congratulations');

  // Prepare confetti pieces first (hook must run every render in same order)
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const confettiPieces = useMemo(() => {
    return generateConfettiPieces({ count: 40 });
  }, [prefersReducedMotion]);

  const handleStartAndClose = useCallback(() => {
    const evt = new CustomEvent('start-onboarding-tour');
    window.dispatchEvent(evt);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={handleStartAndClose} />

      {/* Confetti container (full screen) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
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

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all border border-blue-100/60 dark:border-blue-400/20">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-gray-800">
              {/* Celebration SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-10 h-10 text-white drop-shadow-sm"
              >
                <path d="M8 12L3 21l9-5 9 5-5-9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 2v5" strokeLinecap="round" />
                <path d="M4.5 7l3.5 2" strokeLinecap="round" />
                <path d="M19.5 7L16 9" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 animate-ping rounded-full bg-white/20" />
            </div>
          </div>
        </div>
        {/* Glow effects */}
        <div className="absolute inset-0 rounded-xl after:content-[''] after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-br after:from-blue-500/10 after:to-transparent pointer-events-none" />

        {/* Content */}
        <div className="p-6 pt-14 relative">
          <div className="text-center">
            <h3 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t('title')}
            </h3>
            <div className="flex items-center justify-center gap-1 mb-4">
              <div className="h-px w-10 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <div className="h-px w-10 bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-center mb-8 leading-relaxed text-sm whitespace-pre-line">
            {t('description')}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleStartAndClose}
              className="group relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium transition shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-indigo-600/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">{t('createFirstGoal')}</span>
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_60%)]" />
            </button>
          </div>
        </div>
      </div>

      {/* Keyframes (scoped) */}
      <style>{confettiStyles}</style>
    </div>
  );
};

export const useCongratulationsModal = () => {
  const { profile, isLoading } = useUserProfile();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    const onProfilePage = pathname?.startsWith('/profile');

    if (!onProfilePage) {
      setIsOpen(false);
      return;
    }
    if (profile && profile.user.tutorialCompleted === false) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [profile, isLoading, pathname]);

  return {
    isOpen,
    onClose: () => setIsOpen(false),
  };
};
