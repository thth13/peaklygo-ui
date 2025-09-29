'use client';

import { Goal, Step } from '@/types';
import type { StepCompletionRatingPayload } from '@/context/UserProfileContext';
import { faCheck, faCircle, faEdit, faPlus, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { updateStepStatus, updateStepText, createStep, completeGoal } from '@/lib/api/goal';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import type { ConfettiProps } from 'react-confetti-boom';

interface StepsProps {
  steps: Step[];
  goalId: string;
  currentUserId?: string;
  goalUserId: string;
  goal: Goal;
  onStepsUpdate?: (updatedSteps: Step[]) => void;
  onProgressUpdate?: (progress: number) => void;
  onGoalComplete?: () => void;
  onStepRatingUpdate?: (payload: StepCompletionRatingPayload) => void;
}

interface ConfettiShot {
  id: string;
  x: number;
  y: number;
}

const ConfettiBoom = dynamic<ConfettiProps>(() => import('react-confetti-boom'), { ssr: false });

export const GoalSteps = (props: StepsProps) => {
  const {
    steps: initialSteps,
    goalId,
    currentUserId,
    goalUserId,
    goal,
    onStepsUpdate,
    onProgressUpdate,
    onGoalComplete,
    onStepRatingUpdate,
  } = props;

  const t = useTranslations();

  // Локальное состояние для шагов
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [loadingSteps, setLoadingSteps] = useState<Set<string>>(new Set());
  const [confettiShots, setConfettiShots] = useState<ConfettiShot[]>([]);

  // Состояние для формы добавления этапа
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStepText, setNewStepText] = useState('');
  const [isCreatingStep, setIsCreatingStep] = useState(false);

  // Состояние для удаления этапов
  const [deletingSteps] = useState<Set<string>>(new Set());

  // Состояние для завершения цели
  const [isCompletingGoal, setIsCompletingGoal] = useState(false);

  // Состояние для редактирования этапов
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingStepText, setEditingStepText] = useState('');
  const [isUpdatingStep, setIsUpdatingStep] = useState(false);
  const confettiTimeouts = useRef<number[]>([]);

  // Проверяем является ли пользователь владельцем цели
  const isOwner = currentUserId === goalUserId;

  // Синхронизируем с пропсами при их изменении
  useEffect(() => {
    setSteps(initialSteps);
  }, [initialSteps]);

  useEffect(() => {
    return () => {
      confettiTimeouts.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      confettiTimeouts.current = [];
    };
  }, []);

  // Функция для вычисления прогресса
  const calculateProgress = (stepsList: Step[]): number => {
    if (stepsList.length === 0) return 0;
    const completedSteps = stepsList.filter((step) => step.isCompleted).length;
    return Math.round((completedSteps / stepsList.length) * 100);
  };

  const currentStepIndex = steps.findIndex((step) => !step.isCompleted);
  const allStepsCompleted = steps.length > 0 && steps.every((step) => step.isCompleted);

  const triggerConfetti = (buttonElement: HTMLButtonElement) => {
    if (typeof window === 'undefined') return;
    const rect = buttonElement.getBoundingClientRect();
    const { innerWidth, innerHeight } = window;
    if (innerWidth === 0 || innerHeight === 0) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const shotId = `confetti-${Date.now()}-${Math.random()}`;
    const x = Math.min(Math.max(centerX / innerWidth, 0), 1);
    const y = Math.min(Math.max(centerY / innerHeight, 0), 1);
    setConfettiShots((prev) => [...prev, { id: shotId, x, y }]);
    const timeoutId = window.setTimeout(() => {
      setConfettiShots((prev) => prev.filter((shot) => shot.id !== shotId));
      confettiTimeouts.current = confettiTimeouts.current.filter((id) => id !== timeoutId);
    }, 2000);
    confettiTimeouts.current = [...confettiTimeouts.current, timeoutId];
  };

  const handleStepToggle = async (step: Step, buttonElement: HTMLButtonElement) => {
    const newStatus = !step.isCompleted;

    // Устанавливаем состояние загрузки
    setLoadingSteps((prev) => new Set([...prev, step.id]));

    try {
      // Отправляем запрос на сервер
      await updateStepStatus(goalId, step.id, newStatus);

      // Обновляем локальное состояние после успешного запроса
      const updatedSteps = steps.map((s) => (s.id === step.id ? { ...s, isCompleted: newStatus } : s));

      setSteps(updatedSteps);

      // Уведомляем родительский компонент об изменениях
      onStepsUpdate?.(updatedSteps);

      if (isOwner) {
        onStepRatingUpdate?.({ goalValue: goal.value, isCompleted: newStatus });
      }

      // Обновляем прогресс в родительском компоненте
      const newProgress = calculateProgress(updatedSteps);
      onProgressUpdate?.(newProgress);

      if (newStatus) {
        triggerConfetti(buttonElement);
      }

      // Показываем уведомление
      toast.success(newStatus ? t('steps.completed') : t('steps.markedIncomplete'), { duration: 2000 });
    } catch (error) {
      console.error('Failed to update step status:', error);
      toast.error(t('steps.updateFailed'));
    } finally {
      // Убираем состояние загрузки
      setLoadingSteps((prev) => {
        const newSet = new Set(prev);
        newSet.delete(step.id);
        return newSet;
      });
    }
  };

  const handleAddStep = async () => {
    if (!newStepText.trim()) {
      toast.error(t('steps.enterName'));
      return;
    }

    setIsCreatingStep(true);

    try {
      // Создаем этап на сервере
      await createStep(goalId, newStepText.trim());

      // Создаем временный ID для нового этапа
      const tempId = `temp-${Date.now()}`;
      const newStep: Step = {
        id: tempId,
        text: newStepText.trim(),
        isCompleted: false,
      };

      // Обновляем локальное состояние
      const updatedSteps = [...steps, newStep];
      setSteps(updatedSteps);

      // Уведомляем родительский компонент
      onStepsUpdate?.(updatedSteps);

      // Перерасчитываем прогресс
      const newProgress = calculateProgress(updatedSteps);
      onProgressUpdate?.(newProgress);

      // Сбрасываем форму
      setNewStepText('');
      setShowAddForm(false);

      toast.success(t('steps.completed'));
    } catch (error) {
      console.error('Failed to create step:', error);
      toast.error(t('steps.addFailed'));
    } finally {
      setIsCreatingStep(false);
    }
  };

  const handleCancelAdd = () => {
    setNewStepText('');
    setShowAddForm(false);
  };

  // const handleDeleteStep = async (stepId: string) => {
  //   if (steps.length <= 1) {
  //     toast.error('Нельзя удалить последний этап');
  //     return;
  //   }

  //   setDeletingSteps((prev) => new Set([...prev, stepId]));

  //   try {
  //     // Удаляем этап на сервере
  //     await deleteStep(goalId, stepId);

  //     // Обновляем локальное состояние
  //     const updatedSteps = steps.filter((step) => step.id !== stepId);
  //     setSteps(updatedSteps);

  //     // Уведомляем родительский компонент
  //     onStepsUpdate?.(updatedSteps);

  //     // Перерасчитываем прогресс
  //     const newProgress = calculateProgress(updatedSteps);
  //     onProgressUpdate?.(newProgress);

  //     toast.success('Этап удален!');
  //   } catch (error) {
  //     console.error('Failed to delete step:', error);
  //     toast.error('Не удалось удалить этап');
  //   } finally {
  //     setDeletingSteps((prev) => {
  //       const newSet = new Set(prev);
  //       newSet.delete(stepId);
  //       return newSet;
  //     });
  //   }
  // };

  const handleCompleteGoal = async () => {
    if (!allStepsCompleted) {
      toast.error(t('steps.completeAllFirst'));
      return;
    }

    setIsCompletingGoal(true);
    try {
      await completeGoal(goalId);
      toast.success(t('goals.completed'));
      onGoalComplete?.();
    } catch (error) {
      console.error('Failed to complete goal:', error);
      toast.error(t('steps.completeFailed'));
    } finally {
      setIsCompletingGoal(false);
    }
  };

  const handleStartEdit = (step: Step) => {
    setEditingStepId(step.id);
    setEditingStepText(step.text);
  };

  const handleCancelEdit = () => {
    setEditingStepId(null);
    setEditingStepText('');
  };

  const handleSaveEdit = async () => {
    if (!editingStepId || !editingStepText.trim()) {
      toast.error(t('steps.enterName'));
      return;
    }

    setIsUpdatingStep(true);

    try {
      // Обновляем этап на сервере
      await updateStepText(goalId, editingStepId, editingStepText.trim());

      // Обновляем локальное состояние
      const updatedSteps = steps.map((step) =>
        step.id === editingStepId ? { ...step, text: editingStepText.trim() } : step,
      );
      setSteps(updatedSteps);

      // Уведомляем родительский компонент
      onStepsUpdate?.(updatedSteps);

      // Сбрасываем состояние редактирования
      setEditingStepId(null);
      setEditingStepText('');

      toast.success(t('steps.completed'));
    } catch (error) {
      console.error('Failed to update step text:', error);
      toast.error(t('steps.updateTextFailed'));
    } finally {
      setIsUpdatingStep(false);
    }
  };

  const getStepStatus = (step: Step, index: number) => {
    if (step.isCompleted) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'pending';
  };

  const getStepStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          container: 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700',
          circle: 'bg-green-500 dark:bg-green-400 text-white cursor-pointer hover:bg-green-600 dark:hover:bg-green-500',
          title: 'text-green-800 dark:text-green-200',
          description: 'text-green-600 dark:text-green-300',
        };
      case 'current':
        return {
          container: 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700',
          circle:
            'border-2 border-blue-500 dark:border-blue-400 bg-white dark:bg-gray-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-800',
          title: 'text-gray-900 dark:text-gray-100',
          description: 'text-blue-600 dark:text-blue-300',
        };
      default:
        return {
          container: 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600',
          circle:
            'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600',
          title: 'text-gray-900 dark:text-gray-100',
          description: 'text-gray-500 dark:text-gray-400',
        };
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('steps.title')} ({steps.filter((s) => s.isCompleted).length}/{steps.length})
        </h3>
        <div className="flex items-center space-x-3">
          {isOwner && allStepsCompleted && (
            <button
              onClick={handleCompleteGoal}
              disabled={isCompletingGoal}
              className="bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCompletingGoal ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="w-4 mr-2 animate-spin" />
                  Завершаем...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} className="w-4 mr-2" />
                  Завершить цель
                </>
              )}
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => setShowAddForm(true)}
              disabled={showAddForm}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 mr-1" />
              Добавить этап
            </button>
          )}
        </div>
      </div>

      {/* Форма добавления нового этапа */}
      {showAddForm && (
        <div className="mb-4 p-4 border border-blue-200 dark:border-blue-600 rounded-lg bg-blue-50 dark:bg-blue-900">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newStepText}
              onChange={(e) => setNewStepText(e.target.value)}
              placeholder={t('steps.enterName')}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              disabled={isCreatingStep}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddStep();
                } else if (e.key === 'Escape') {
                  handleCancelAdd();
                }
              }}
              autoFocus
            />
            <button
              onClick={handleAddStep}
              disabled={isCreatingStep || !newStepText.trim()}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreatingStep ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin mr-1" />
                  Создание...
                </>
              ) : (
                t('steps.add')
              )}
            </button>
            <button
              onClick={handleCancelAdd}
              disabled={isCreatingStep}
              className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {steps.map((step, index) => {
          const status = getStepStatus(step, index);
          const styles = getStepStyles(status);
          const isLoading = loadingSteps.has(step.id);
          const isDeleting = deletingSteps.has(step.id);

          return (
            <div
              key={step.id}
              className={`group flex items-center space-x-3 p-3 rounded-lg transition-all relative ${styles.container}`}
            >
              {isOwner && (
                <button
                  onClick={(event) => handleStepToggle(step, event.currentTarget)}
                  disabled={isLoading || isDeleting}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${styles.circle} ${
                    isLoading || isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={step.isCompleted ? t('steps.markIncomplete') : t('steps.markComplete')}
                >
                  {isLoading ? (
                    <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                  ) : step.isCompleted ? (
                    <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                  ) : status === 'current' ? (
                    <FontAwesomeIcon icon={faCircle} className="w-2 h-2 text-blue-500 dark:text-blue-400" />
                  ) : null}
                </button>
              )}

              <div className="flex-1">
                {editingStepId === step.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingStepText}
                      onChange={(e) => setEditingStepText(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      disabled={isUpdatingStep}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit();
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleSaveEdit}
                      disabled={isUpdatingStep || !editingStepText.trim()}
                      className="px-2 py-1 bg-green-600 dark:bg-green-500 text-white rounded text-xs hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUpdatingStep ? (
                        <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                      ) : (
                        <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isUpdatingStep}
                      className="px-2 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h4 className={`font-medium transition-colors ${styles.title}`}>{step.text}</h4>
                    <p className={`text-sm transition-colors ${styles.description}`}>
                      {step.isCompleted
                        ? t('steps.stepCompleted')
                        : status === 'current'
                        ? t('steps.inProgress')
                        : t('steps.pending')}
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {isOwner && editingStepId !== step.id && editingStepId === null && (
                  <button
                    onClick={() => handleStartEdit(step)}
                    disabled={isLoading || isDeleting}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t('steps.edit')}
                  >
                    <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                  </button>
                )}
                {status === 'current' && editingStepId !== step.id && (
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {confettiShots.map((shot) => (
        <ConfettiBoom
          key={shot.id}
          mode="boom"
          x={shot.x}
          y={shot.y}
          particleCount={80}
          spreadDeg={75}
          effectCount={1}
          effectInterval={1}
          launchSpeed={1.2}
          opacityDeltaMultiplier={1.4}
          style={{ position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: 50 }}
        />
      ))}
    </div>
  );
};
