'use client';

import React from 'react';
import dynamic from 'next/dynamic';
const PageEvent = dynamic(() => import('@/components/analytics/PageEvent'), { ssr: false });
import { GoalForm, GoalFormData } from '@/components/goal/GoalForm';
import { createGoal } from '@/lib/api/goal';
import { useUserProfile } from '@/context/UserProfileContext';
import { useRouter } from 'next/navigation';

interface Step {
  id: string;
  text: string;
}

const GoalCreationPage: React.FC = () => {
  const router = useRouter();
  const { profile } = useUserProfile();

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

      formDataToSend.append('userId', profile.user._id);

      await createGoal(formDataToSend);

      router.push('/');
    }
  };

  return (
    <main className="max-w-7xl mx-auto mt-6 px-4 flex">
      <PageEvent name="goal_create_page_open" params={{ location: 'goal/create' }} />
      <GoalForm mode="create" onSubmit={handleSubmit} />
    </main>
  );
};

export default GoalCreationPage;
