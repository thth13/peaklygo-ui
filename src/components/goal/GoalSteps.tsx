'use client';

import { Step } from '@/types';
import { faCheck, faCircle, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { updateStepStatus } from '@/lib/api/goal';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface StepsProps {
  steps: Step[];
  goalId: string;
  onStepsUpdate?: (updatedSteps: Step[]) => void;
}

export const GoalSteps = (props: StepsProps) => {
  const { steps: initialSteps, goalId, onStepsUpdate } = props;

  // Локальное состояние для шагов
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [loadingSteps, setLoadingSteps] = useState<Set<string>>(new Set());

  // Синхронизируем с пропсами при их изменении
  useEffect(() => {
    setSteps(initialSteps);
  }, [initialSteps]);

  const currentStepIndex = steps.findIndex((step) => !step.isCompleted);

  const handleStepToggle = async (step: Step, index: number) => {
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

      // Показываем уведомление
      toast.success(newStatus ? 'Этап выполнен!' : 'Этап отмечен как невыполненный', { duration: 2000 });
    } catch (error) {
      console.error('Failed to update step status:', error);
      toast.error('Не удалось обновить статус этапа');
    } finally {
      // Убираем состояние загрузки
      setLoadingSteps((prev) => {
        const newSet = new Set(prev);
        newSet.delete(step.id);
        return newSet;
      });
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
          Этапы выполнения ({steps.filter((s) => s.isCompleted).length}/{steps.length})
        </h3>
        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors">
          <FontAwesomeIcon icon={faPlus} className="w-4 mr-1" />
          Добавить этап
        </button>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const status = getStepStatus(step, index);
          const styles = getStepStyles(status);
          const isLoading = loadingSteps.has(step.id);

          return (
            <div
              key={step.id}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${styles.container}`}
            >
              <button
                onClick={() => handleStepToggle(step, index)}
                disabled={isLoading}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${styles.circle} ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={step.isCompleted ? 'Отметить как невыполненный' : 'Отметить как выполненный'}
              >
                {isLoading ? (
                  <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                ) : step.isCompleted ? (
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                ) : status === 'current' ? (
                  <FontAwesomeIcon icon={faCircle} className="w-2 h-2 text-blue-500 dark:text-blue-400" />
                ) : null}
              </button>

              <div className="flex-1">
                <h4 className={`font-medium transition-colors ${styles.title}`}>{step.text}</h4>
                <p className={`text-sm transition-colors ${styles.description}`}>
                  {step.isCompleted ? 'Завершено' : status === 'current' ? 'В процессе' : 'Ожидает выполнения'}
                </p>
              </div>

              {status === 'current' && (
                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Прогресс выполнения</span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {Math.round((steps.filter((s) => s.isCompleted).length / steps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 dark:bg-blue-400 h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${(steps.filter((s) => s.isCompleted).length / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
