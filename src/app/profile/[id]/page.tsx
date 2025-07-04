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
              <h2 className="text-2xl font-bold text-gray-800">Мои цели</h2>
              <p className="text-gray-500">Управляйте своими целями и отслеживайте прогресс</p>
            </div>
            <LinkWithProgress
              href="/goal/create"
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 mr-2 text-base" />
              Новая цель
            </LinkWithProgress>
          </div>
          <div className="flex space-x-3">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>Все статусы</option>
              <option>В процессе</option>
              <option>Достигнуто</option>
              <option>Провалено</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>По дате</option>
              <option>По приоритету</option>
              <option>По прогрессу</option>
            </select>
          </div>
        </div>
        {goals.map((goal) => (
          <GoalCard key={goal.goalName} goal={goal} />
        ))}

        {/* <div id="goal-card-2" className="bg-white rounded-lg shadow-sm p-6 mb-4 border-l-4 border-green-500">
          <div className="flex items-start space-x-4 mb-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                className="w-full h-full object-cover"
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/18b617180c-c7615ee064a54ed850a9.png"
                alt="stack of books reading literature library learning education"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Прочитать 12 книг</h3>
                  <p className="text-gray-500 text-sm">Создано 1 января 2023</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    Достигнуто
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                  </button>
                </div>
              </div>

              <p className="text-gray-600 mb-4">
                Читать по одной книге в месяц для расширения кругозора и саморазвития.
              </p>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Прогресс</span>
                  <span className="text-sm text-green-600 font-medium">Завершено!</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <i className="fa-solid fa-check-circle mr-2 text-green-500"></i>
                  <span>Завершено 28 октября 2023</span>
                </div>
                <div className="flex items-center">
                  <i className="fa-solid fa-coins mr-2"></i>
                  <span>Получено: 120 баллов</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex space-x-4">
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    <i className="fa-solid fa-eye mr-1"></i>
                    Детали
                  </button>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    <i className="fa-solid fa-copy mr-1"></i>
                    Повторить
                  </button>
                </div>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  <i className="fa-solid fa-share mr-1"></i>
                  Поделиться
                </button>
              </div>
            </div>
          </div>
        </div>

        <div id="goal-card-3" className="bg-white rounded-lg shadow-sm p-6 mb-4 border-l-4 border-primary-500">
          <div className="flex items-start space-x-4 mb-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                className="w-full h-full object-cover"
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/e6c68bd5c2-03fe7ec6322fca69cf79.png"
                alt="spanish language learning books dictionary flag spain education"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Выучить испанский язык</h3>
                  <p className="text-gray-500 text-sm">Создано 5 сентября 2023</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                    В процессе
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                  </button>
                </div>
              </div>

              <p className="text-gray-600 mb-4">
                Достичь уровня B1 в испанском языке за 6 месяцев. Занятия с преподавателем 2 раза в неделю.
              </p>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Прогресс</span>
                  <span className="text-sm text-gray-500">40%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <i className="fa-regular fa-calendar mr-2"></i>
                  <span>Дедлайн: 5 марта 2024</span>
                </div>
                <div className="flex items-center">
                  <i className="fa-solid fa-coins mr-2"></i>
                  <span>Ценность: 200 баллов</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex space-x-4">
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    <i className="fa-solid fa-pencil mr-1"></i>
                    Редактировать
                  </button>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    <i className="fa-solid fa-chart-line mr-1"></i>
                    Прогресс
                  </button>
                </div>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  <i className="fa-solid fa-share mr-1"></i>
                  Поделиться
                </button>
              </div>
            </div>
          </div>
        </div> */}
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
