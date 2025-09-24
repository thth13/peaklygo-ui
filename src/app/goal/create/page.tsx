'use client';

import React from 'react';
import dynamic from 'next/dynamic';
const PageEvent = dynamic(() => import('@/components/analytics/PageEvent'), { ssr: false });
import GoalCreateWizard from '@/components/goal/GoalCreateWizard';

const GoalCreationPage: React.FC = () => {
  return (
    <>
      <PageEvent name="goal_create_page_open" params={{ location: 'goal/create' }} />
      <GoalCreateWizard />
    </>
  );
};

export default GoalCreationPage;
