import { cookies } from 'next/headers';

import LinkWithProgress from '@/components/Link';
import { getProfile } from '@/lib/api';
import { getGoals } from '@/lib/api/goal';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { GoalCard } from '@/components/profile/GoalCard';
import { UserProfile } from '@/types';
import { Goal } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function Profile({ params }: ProfilePageProps) {
  const { id } = await params;

  // Get userId from cookies on the server
  const cookieStore = await cookies();
  const myUserId = cookieStore.get('userId')?.value;

  const isMyProfile = myUserId === id;

  const data = await fetchUserProfile(id);
  if (!data) return null;

  const { profile, goals }: { profile: UserProfile; goals: Goal[] } = data;

  return (
    <main className="max-w-7xl mx-auto mt-6 px-4 flex">
      <LeftSidebar />
      <div id="main-content" className="w-3/5 px-6">
        <div id="goals-header" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Мои цели</h2>
              <p className="text-gray-500 dark:text-gray-400">Управляйте своими целями и отслеживайте прогресс</p>
            </div>
            <LinkWithProgress
              href="/goal/create"
              className="bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 mr-2 text-base" />
              Новая цель
            </LinkWithProgress>
          </div>
          {/* <div className="flex space-x-3">
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm transition-colors">
              <option>Все статусы</option>
              <option>В процессе</option>
              <option>Достигнуто</option>
              <option>Провалено</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm transition-colors">
              <option>По дате</option>
              <option>По приоритету</option>
              <option>По прогрессу</option>
            </select>
          </div> */}
        </div>
        {goals.map((goal) => (
          <GoalCard key={goal._id} goal={goal} />
        ))}
      </div>
      <RightSidebar />
    </main>
  );
}

async function fetchUserProfile(id: string): Promise<{ profile: UserProfile; goals: Goal[] } | null> {
  try {
    const profile = await getProfile(id);
    const goals = await getGoals(id);

    return { profile, goals };
  } catch (err) {
    console.error('Failed to fetch user profile:', err);
    return null;
  }
}
