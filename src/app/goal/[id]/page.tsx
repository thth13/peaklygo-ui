import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faPlus, faCheck, faCircle } from '@fortawesome/free-solid-svg-icons';
import Link from '@/components/Link';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { Goal } from '@/types';
import { getGoal } from '@/lib/api/goal';
import { formatDate } from '@/lib/utils';
import { IMAGE_URL } from '@/constants';
import { GoalSteps } from '@/components/goal/GoalSteps';

interface GoalPageProps {
  params: Promise<{ id: string }>;
}

export default async function GoalPage({ params }: GoalPageProps) {
  const { id } = await params;

  const goal = await fetchGoal(id);
  if (!goal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Цель не найдена</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Возможно, цель была удалена или вы не имеете к ней доступа
          </p>
          <Link
            href="/profile"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Вернуться к целям
          </Link>
        </div>
      </div>
    );
  }

  const getDaysLeft = () => {
    if (!goal.endDate) return null;
    const today = new Date();
    const endDate = new Date(goal.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysPassed = () => {
    const today = new Date();
    const startDate = new Date(goal.startDate);
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getCompletedSteps = () => {
    return goal.steps.filter((step) => step.isCompleted).length;
  };

  const getPrivacyLabel = () => {
    switch (goal.privacy) {
      case 'private':
        return 'Приватная';
      case 'friends':
        return 'Для друзей';
      case 'public':
        return 'Публичная';
      default:
        return 'Публичная';
    }
  };

  const getPrivacyColor = () => {
    switch (goal.privacy) {
      case 'private':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      case 'friends':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
      case 'public':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      default:
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
    }
  };

  const daysLeft = getDaysLeft();
  const daysPassed = getDaysPassed();
  const completedSteps = getCompletedSteps();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Левая боковая панель */}
          <LeftSidebar />

          {/* Основная область */}
          <div className="flex-1 px-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors">
              {/* Заголовок */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/"
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center space-x-2 transition-colors"
                    >
                      <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                      <span className="text-sm">Назад к целям</span>
                    </Link>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                      <span>Редактировать</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg text-sm transition-colors">
                      <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                      <span>Обновить прогресс</span>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">{goal.goalName}</h1>
                  <div className="flex items-center space-x-3">
                    <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                      {goal.category}
                    </span>
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                      {goal.isCompleted ? 'Завершено' : 'В процессе'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Создано {formatDate(goal.startDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Изображение с прогрессом */}
              <div className="relative">
                <div
                  className="h-64 bg-cover bg-center relative rounded-lg"
                  style={{
                    backgroundImage: goal.image
                      ? `url(${IMAGE_URL}/${goal.image})`
                      : 'linear-gradient(to right, #020303, #111827)',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  {/* Полупрозрачный overlay для читаемости текста */}
                  <div className="absolute inset-0  bg-black/20"></div>

                  {/* Текст в левом нижнем углу */}
                  <div className="absolute left-0 bottom-0 z-10 text-white p-6">
                    <div className="text-3xl font-bold mb-1">{goal.progress}% завершено</div>
                    {goal.endDate && (
                      <div className="text-md mt-1 text-black-200">
                        {daysLeft && daysLeft > 0
                          ? `${daysLeft} дней до дедлайна`
                          : `Дедлайн прошел ${daysLeft} дней назад`}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Описание цели */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Описание цели</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">{goal.description || 'Описание не указано'}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Дата начала</h4>
                    <p className="text-gray-900 dark:text-gray-100">{formatDate(goal.startDate)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Дедлайн</h4>
                    <p className="text-gray-900 dark:text-gray-100">
                      {goal.endDate ? formatDate(goal.endDate) : 'Не указан'}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Общий прогресс</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full">
                    <div
                      className="bg-green-500 dark:bg-green-400 h-3 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {goal.reward && (
                    <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Награда за выполнение</h4>
                      <p className="text-green-700 dark:text-green-300">{goal.reward}</p>
                    </div>
                  )}
                  {goal.consequence && (
                    <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                      <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Последствие провала</h4>
                      <p className="text-red-700 dark:text-red-300">{goal.consequence}</p>
                    </div>
                  )}
                </div>

                {/* Этапы выполнения */}
                {goal.steps.length > 0 && <GoalSteps steps={goal.steps} goalId={id} />}
              </div>
            </div>
          </div>

          {/* Правая боковая панель */}
          <div className="w-1/4 pl-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 transition-colors">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Статистика</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Ценность цели</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">{goal.value} баллов</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Дней прошло</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{daysPassed}</span>
                </div>
                {goal.endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Дней осталось</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{daysLeft}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Этапов завершено</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {completedSteps} из {goal.steps.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Приватность</span>
                  <span className={`px-2 py-1 rounded text-sm ${getPrivacyColor()}`}>{getPrivacyLabel()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 transition-colors">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Последняя активность</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">Цель создана</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(goal.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">Последнее обновление</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(goal.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Действия</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                  Записать в блог
                </button>
                <button className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-500 py-2 px-4 rounded-lg text-sm transition-colors">
                  Поделиться целью
                </button>
                <button className="w-full text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-600 py-2 px-4 rounded-lg text-sm transition-colors">
                  Настройки приватности
                </button>
                <button className="w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-500 py-2 px-4 rounded-lg text-sm transition-colors">
                  Архивировать цель
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function fetchGoal(id: string): Promise<Goal | null> {
  try {
    const goal = await getGoal(id);
    return goal;
  } catch (err) {
    console.error('Failed to fetch goal:', err);
    return null;
  }
}
