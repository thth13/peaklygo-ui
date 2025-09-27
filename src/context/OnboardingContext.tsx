'use client';
import { Step, CallBackProps, EVENTS, STATUS } from 'react-joyride';
import dynamic from 'next/dynamic';
import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'use-intl';
import { markTutorialCompleted } from '@/lib/api/profile';
import { useUserProfile } from './UserProfileContext';

const JoyRideNoSSR = dynamic(() => import('react-joyride'), { ssr: false });

interface OnboardingProviderProps {
  children: ReactNode;
}

interface OnBoardingContextType {
  startTour: () => void;
  stopTour: () => void;
}

const OnboardingContext = createContext<OnBoardingContextType>({
  startTour: () => {},
  stopTour: () => {},
});

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const tOnboarding = useTranslations('onboarding');
  const tCommon = useTranslations('common');
  const { setTutorialCompleted } = useUserProfile();
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const steps = useMemo<Step[]>(
    () => [
      {
        target: '[data-tour="create-goal-button"]',
        content: tOnboarding('createGoalStep'),
        disableBeacon: true,
        placement: 'auto',
      },
      {
        target: '[data-tour="goal-form"]',
        content: tOnboarding('goalFormStep'),
        placement: 'auto',
      },
      {
        target: '[data-tour="save-goal"]',
        content: tOnboarding('saveGoalStep'),
        title: tOnboarding('saveTitle'),
        placement: 'auto',
      },
    ],
    [tOnboarding],
  );

  const startTour = useCallback(() => {
    setStepIndex(0);
    setIsRunning(true);
  }, []);

  const stopTour = useCallback(() => {
    setIsRunning(false);
  }, []);

  const skipTour = () => {
    setIsRunning(false);
    setStepIndex(0);
  };

  const advanceTo = useCallback(
    (next: number) => {
      if (next === 1 && pathname !== '/goal/create') {
        setPendingIndex(next);
        router.push('/goal/create');
        return;
      }
      setStepIndex(next);
    },
    [pathname, router],
  );

  const handleCallback = (data: CallBackProps) => {
    const { status, type, index } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      markTutorialCompleted().catch(() => {});
      setTutorialCompleted();
      skipTour();
      return;
    }

    if (type === EVENTS.STEP_AFTER) {
      const next = index + 1;
      if (next < steps.length) {
        advanceTo(next);
      } else {
        setStepIndex(next);
      }
    }

    if (type === EVENTS.TARGET_NOT_FOUND) {
      const next = index + 1;
      if (next < steps.length) advanceTo(next);
    }
  };

  useEffect(() => {
    if (pendingIndex === null) return;
    if (pathname !== '/goal/create') return;

    let cancelled = false;

    const selector = '[data-tour="goal-form"]';
    const poll = () => {
      if (cancelled) return;
      const el = document.querySelector(selector);
      if (el) {
        setStepIndex(pendingIndex);
        setPendingIndex(null);
      } else {
        requestAnimationFrame(poll);
      }
    };
    poll();

    return () => {
      cancelled = true;
    };
  }, [pendingIndex, pathname]);

  useEffect(() => {
    const handler = () => startTour();
    window.addEventListener('start-onboarding-tour', handler as EventListener);
    return () => window.removeEventListener('start-onboarding-tour', handler as EventListener);
  }, [startTour]);

  useEffect(() => {
    if (!isRunning) return;
    if (stepIndex !== 0) return;

    const selector = '[data-tour="create-goal-button"] a, [data-tour="create-goal-button"] button';
    const el = document.querySelector(selector);
    if (!el) return;

    const handleClick = () => {
      advanceTo(1);
    };

    el.addEventListener('click', handleClick, { once: true });

    return () => {
      el.removeEventListener('click', handleClick);
    };
  }, [isRunning, stepIndex, pathname, advanceTo]);

  return (
    <OnboardingContext.Provider value={{ startTour, stopTour }}>
      <JoyRideNoSSR
        steps={steps}
        run={isRunning}
        stepIndex={stepIndex}
        disableScrolling={stepIndex === 0}
        showProgress
        showSkipButton
        continuous
        disableOverlayClose
        spotlightClicks
        spotlightPadding={4}
        callback={handleCallback}
        locale={{
          back: tCommon('previous'),
          close: tCommon('close'),
          last: tCommon('finish'),
          next: tCommon('next'),
          skip: tCommon('skip'),
          open: tCommon('next'),
        }}
        styles={{
          options: {
            primaryColor: '#3b82f6',
            zIndex: 20000,
          },
          tooltip: {
            maxWidth: 'min(360px, calc(100vw - 24px))',
            width: 'auto',
            overflowWrap: 'break-word',
          },
          tooltipContainer: {
            maxHeight: 'calc(100vh - 24px)',
            overflowY: 'auto',
          },
          buttonBack: {
            display: 'none',
          },
        }}
      />
      {children}
    </OnboardingContext.Provider>
  );
};
