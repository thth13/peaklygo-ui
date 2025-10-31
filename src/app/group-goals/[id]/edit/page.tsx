import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { LeftSidebar } from '@/components/layout/sidebar';
import type { DayOfWeek, GroupGoal } from '@/types';
import { getGroupGoal } from '@/lib/api/goal';
import { GroupGoalUpdateForm, type GroupGoalUpdateFormValues } from '@/components/group-goals';
import { IMAGE_URL } from '@/constants';

interface EditGroupGoalPageProps {
  params: Promise<{ id: string }>;
}

const convertGoalToFormState = (goal: GroupGoal): GroupGoalUpdateFormValues => {
  const startDate = goal.startDate ? new Date(goal.startDate) : undefined;
  const endDate = goal.endDate ? new Date(goal.endDate) : undefined;

  const formatDateForInput = (date: Date) => date.toISOString().slice(0, 10);

  return {
    goalName: goal.goalName ?? '',
    description: goal.description ?? '',
    category: goal.category ?? 'lifestyle',
    startDate: startDate ? formatDateForInput(startDate) : '',
    endDate: endDate ? formatDateForInput(endDate) : '',
    habitDuration: goal.habitDuration ?? 30,
    habitDaysOfWeek: (goal.habitDaysOfWeek ?? []) as DayOfWeek[],
    reward: goal.reward ?? '',
    consequence: goal.consequence ?? '',
    imageUrl: goal.image ? (goal.image.startsWith('http') ? goal.image : `${IMAGE_URL}/${goal.image}`) : '',
    allowMembersToInvite: goal.groupSettings?.allowMembersToInvite ?? false,
    requireApproval: goal.groupSettings?.requireApproval ?? true,
    maxParticipants: goal.groupSettings?.maxParticipants ?? undefined,
  };
};

export async function generateMetadata({ params }: EditGroupGoalPageProps): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations('groupGoalEdit');

  try {
    const goal = await getGroupGoal(id);
    const title = t('meta.title', { name: goal.goalName });
    const description = goal.description?.trim()?.slice(0, 200) || t('meta.defaultDescription');

    return {
      title,
      description,
      alternates: { canonical: `/group-goals/${id}/edit` },
    };
  } catch {
    return {
      title: t('meta.notFoundTitle'),
      description: t('meta.notFoundDescription'),
    };
  }
}

export default async function EditGroupGoalPage({ params }: EditGroupGoalPageProps) {
  const { id } = await params;
  const t = await getTranslations('groupGoalEdit');
  const cookieStore = await cookies();
  const currentUserId = cookieStore.get('userId')?.value;

  if (!currentUserId) {
    redirect('/auth/login');
  }

  let goal: GroupGoal | null = null;
  try {
    goal = await getGroupGoal(id);
  } catch (error) {
    console.error('[GroupGoalEdit] Failed to fetch goal', error);
  }

  if (!goal) {
    notFound();
  }

  // Проверяем, является ли пользователь владельцем
  const isOwner = goal.participants?.some((p) => {
    const userId = typeof p.userId === 'string' ? p.userId : p.userId?._id;
    return userId === currentUserId && (p.role === 'owner' || p.role === 'admin');
  });

  if (!isOwner) {
    redirect(`/group-goals/${id}`);
  }

  const initialValues = convertGoalToFormState(goal);

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 px-2 py-6 md:flex-row md:px-4">
      <LeftSidebar userId={currentUserId} />

      <section className="flex-1 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
        </div>

        <GroupGoalUpdateForm goalId={id} initialValues={initialValues} />
      </section>
    </main>
  );
}
