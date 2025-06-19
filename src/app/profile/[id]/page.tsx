import { cookies } from 'next/headers';

import LinkWithProgress from '@/components/Link';
import { getProfile } from '@/lib/api';
import { getGoals } from '@/lib/api/goal';

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
  console.log(data);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Профиль</h1>
      <LinkWithProgress href="/goal/create">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg 
          hover:bg-blue-700 transition-colors duration-200 
          flex items-center gap-2 shadow-md
          active:transform active:scale-95"
        >
          <span>Создать цель</span>
        </button>
      </LinkWithProgress>
    </div>
  );
}

async function fetchUserProfile(id: string): Promise<any> {
  try {
    const profile = await getProfile(id);
    const goals = await getGoals(id);

    return { profile, goals };
  } catch (err) {
    console.error('Failed to fetch user profile:', err);
    return null;
  }
}
