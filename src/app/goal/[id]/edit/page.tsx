'use client';

import React, { useState, useEffect } from 'react';
import { GoalForm, GoalFormData } from '@/components/goal/GoalForm';
import { getGoal, updateGoal } from '@/lib/api/goal';
import { useUserProfile } from '@/context/UserProfileContext';
import { useRouter, useParams } from 'next/navigation';

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
  const [initialData, setInitialData] = useState<Partial<GoalFormData>>({});
  const [initialSteps, setInitialSteps] = useState<Step[]>([]);

  useEffect(() => {
    const loadGoalData = async () => {
      try {
        const goal = await getGoal(goalId);

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
        });

        setInitialSteps(
          goal.steps.map((step) => ({
            id: step.id,
            text: step.text,
            isCompleted: step.isCompleted,
          })),
        );

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

  const handleSubmit = async (formData: GoalFormData, stepsState: Step[]) => {
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

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      formDataToSend.append('userId', profile.user);
      await updateGoal(goalId, formDataToSend);

      router.push(`/goal/${goalId}`);
    }
  };

  const handleCancel = () => {
    router.push(`/goal/${goalId}`);
  };

  return (
    <main className="max-w-7xl mx-auto mt-6 px-4 flex">
      <GoalForm
        mode="edit"
        initialData={initialData}
        initialSteps={initialSteps}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </main>
  );
};

export default GoalEditPage;
