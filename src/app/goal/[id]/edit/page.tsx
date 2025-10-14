'use client';

import React, { useState, useEffect } from 'react';
import { GoalForm, GoalFormData } from '@/components/goal/GoalForm';
import { HabitForm, HabitFormData } from '@/components/goal/HabitForm';
import { getGoal, updateGoal } from '@/lib/api/goal';
import { useUserProfile } from '@/context/UserProfileContext';
import { useRouter, useParams } from 'next/navigation';
import { IMAGE_URL } from '@/constants';
import { GoalType } from '@/types';

interface Step {
  id: string;
  text: string;
  isCompleted?: boolean;
}

const GoalEditPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const goalId = params.id as string;
  const { profile } = useUserProfile();

  const [isLoading, setIsLoading] = useState(true);
  const [goalType, setGoalType] = useState<GoalType | null>(null);
  const [initialData, setInitialData] = useState<Partial<GoalFormData>>({});
  const [initialHabitData, setInitialHabitData] = useState<Partial<HabitFormData>>({});
  const [initialSteps, setInitialSteps] = useState<Step[]>([]);

  useEffect(() => {
    const loadGoalData = async () => {
      try {
        const goal = await getGoal(goalId);

        // Определяем тип цели
        setGoalType(goal.goalType || GoalType.Regular);

        if (goal.goalType === GoalType.Habit) {
          // Данные для привычки
          setInitialHabitData({
            goalName: goal.goalName,
            description: goal.description || '',
            category: goal.category,
            customCategory: '',
            startDate: new Date(goal.startDate).toISOString().slice(0, 10),
            privacy: goal.privacy,
            reward: goal.reward || '',
            consequence: goal.consequence || '',
            value: goal.value,
            image: null,
            existingImageUrl: goal.image ? `${IMAGE_URL}/${goal.image}` : undefined,
            habitDuration: goal.habitDuration || 30,
            habitDaysOfWeek: goal.habitDaysOfWeek || [],
          });
        } else {
          // Данные для обычной цели
          setInitialData({
            goalName: goal.goalName,
            description: goal.description || '',
            category: goal.category,
            customCategory: '',
            startDate: new Date(goal.startDate).toISOString().slice(0, 10),
            endDate: goal.endDate ? new Date(goal.endDate).toISOString().slice(0, 10) : null,
            noDeadline: goal.noDeadline || false,
            privacy: goal.privacy,
            reward: goal.reward || '',
            consequence: goal.consequence || '',
            value: goal.value,
            image: null,
            existingImageUrl: goal.image ? `${IMAGE_URL}/${goal.image}` : undefined,
          });

          setInitialSteps(
            goal.steps.map((step) => ({
              id: step.id,
              text: step.text,
              isCompleted: step.isCompleted,
            })),
          );
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading goal:', error);
        setIsLoading(false);
      }
    };

    if (goalId) {
      loadGoalData();
    }
  }, [goalId]);

  const handleGoalSubmit = async (formData: GoalFormData, stepsState: Step[]) => {
    if (profile) {
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'image' && key !== 'steps' && key !== 'endDate') {
          formDataToSend.append(key, value);
        }
      });

      if (formData.endDate) {
        formDataToSend.append('endDate', formData.endDate);
      }

      formDataToSend.append('steps', JSON.stringify(stepsState));
      formDataToSend.append('goalType', GoalType.Regular);

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      formDataToSend.append('userId', profile.user._id);
      await updateGoal(goalId, formDataToSend);

      router.push(`/goal/${goalId}`);
    }
  };

  const handleHabitSubmit = async (formData: HabitFormData) => {
    if (profile) {
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'image' && key !== 'habitDaysOfWeek') {
          formDataToSend.append(key, value);
        }
      });

      // Для привычек обязательно добавляем noDeadline=true
      formDataToSend.append('noDeadline', 'true');
      formDataToSend.append('goalType', GoalType.Habit);

      // Добавляем дни недели для привычки
      formDataToSend.append('habitDaysOfWeek', JSON.stringify(formData.habitDaysOfWeek));

      // Для привычек создаем пустой массив шагов
      formDataToSend.append('steps', JSON.stringify([]));

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      formDataToSend.append('userId', profile.user._id);
      await updateGoal(goalId, formDataToSend);

      router.push(`/goal/${goalId}`);
    }
  };
  const handleCancel = () => {
    router.push(`/goal/${goalId}`);
  };

  if (isLoading || goalType === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Загружаем данные...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto mt-6 px-4 flex">
      {goalType === GoalType.Habit ? (
        <HabitForm
          mode="edit"
          initialData={initialHabitData}
          onSubmit={handleHabitSubmit}
          onCancel={handleCancel}
          isLoading={false}
        />
      ) : (
        <GoalForm
          mode="edit"
          initialData={initialData}
          initialSteps={initialSteps}
          onSubmit={handleGoalSubmit}
          onCancel={handleCancel}
          isLoading={false}
        />
      )}
    </main>
  );
};

export default GoalEditPage;
