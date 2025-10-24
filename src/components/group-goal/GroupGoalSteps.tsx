'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

import { InvitationStatus, Step } from '@/types';
import { markGroupStepCompleted } from '@/lib/api/goal';

interface GroupGoalStepsProps {
  goalId: string;
  steps: Step[];
  canComplete: boolean;
  invitationStatus?: InvitationStatus;
}

export default function GroupGoalSteps({
  goalId,
  steps: initialSteps,
  canComplete,
  invitationStatus,
}: GroupGoalStepsProps) {
  const [steps, setSteps] = useState<Step[]>(() => initialSteps.map((step) => ({ ...step })));
  const [updatingStepId, setUpdatingStepId] = useState<string | null>(null);

  useEffect(() => {
    setSteps(initialSteps.map((step) => ({ ...step })));
  }, [initialSteps]);

  const handleToggleStep = async (step: Step) => {
    if (!canComplete) return;

    const stepId = step.id;
    if (!stepId) {
      toast.error('Не удалось определить шаг');
      return;
    }

    const nextStatus = !step.isCompleted;
    setUpdatingStepId(stepId);

    try {
      await markGroupStepCompleted(goalId, stepId, nextStatus);

      setSteps((prev) => prev.map((item) => (item.id === stepId ? { ...item, isCompleted: nextStatus } : item)));
      toast.success(nextStatus ? 'Шаг отмечен выполненным' : 'Отметка снята');
    } catch (error) {
      console.error('Failed to update group step status:', error);
      toast.error('Не удалось обновить статус шага');
    } finally {
      setUpdatingStepId(null);
    }
  };

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const isCompleted = Boolean(step.isCompleted);
        const isLoading = updatingStepId === step.id;

        return (
          <div
            key={step.id ?? `step-${index}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-4 py-3 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={isCompleted ? faCircleCheck : faCircle}
                className={isCompleted ? 'text-green-500' : 'text-gray-400'}
              />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{step.text}</span>
            </div>

            {canComplete ? (
              <button
                type="button"
                onClick={() => handleToggleStep(step)}
                disabled={isLoading}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  isCompleted
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400'
                } ${isLoading ? 'opacity-80' : ''}`}
              >
                {isLoading ? <FontAwesomeIcon icon={faSpinner} spin className="h-4 w-4" /> : isCompleted ? 'Сбросить' : 'Я выполнил'}
              </button>
            ) : (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  isCompleted
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700/60 dark:text-gray-300'
                }`}
              >
                {isCompleted ? 'Выполнено' : 'Ожидает'}
              </span>
            )}
          </div>
        );
      })}

      {!canComplete && invitationStatus === InvitationStatus.Pending && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Ожидайте подтверждения приглашения, чтобы отмечать выполнение шагов.
        </p>
      )}

      {!canComplete && invitationStatus === InvitationStatus.Declined && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Вы не можете отмечать шаги, так как приглашение отклонено.
        </p>
      )}
    </div>
  );
}
