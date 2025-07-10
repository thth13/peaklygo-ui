import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faPlus, faCheck, faCircle } from '@fortawesome/free-solid-svg-icons';
import Link from '@/components/Link';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { Goal } from '@/types';
import { getGoal } from '@/lib/api/goal';
import { formatDate } from '@/lib/utils';
import { IMAGE_URL } from '@/constants';

interface GoalPageProps {
  params: Promise<{ id: string }>;
}

export default async function GoalPage({ params }: GoalPageProps) {
  const { id } = await params;

  const goal = await fetchGoal(id);
  if (!goal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Цель не найдена</h1>
          <p className="text-gray-600 mb-4">Возможно, цель была удалена или вы не имеете к ней доступа</p>
          <Link href="/profile" className="text-blue-600 hover:text-blue-700">
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
        return 'bg-red-100 text-red-700';
      case 'friends':
        return 'bg-yellow-100 text-yellow-700';
      case 'public':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const daysLeft = getDaysLeft();
  const daysPassed = getDaysPassed();
  const completedSteps = getCompletedSteps();
  const currentStepIndex = goal.steps.findIndex((step) => !step.isCompleted);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Левая боковая панель */}
          <LeftSidebar />

          {/* Основная область */}
          <div className="flex-1 px-6">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Заголовок */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Link href="/" className="text-gray-500 hover:text-gray-700 flex items-center space-x-2">
                      <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                      <span className="text-sm">Назад к целям</span>
                    </Link>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                      <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                      <span>Редактировать</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                      <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                      <span>Обновить прогресс</span>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{goal.goalName}</h1>
                  <div className="flex items-center space-x-3">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {goal.category}
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {goal.isCompleted ? 'Завершено' : 'В процессе'}
                    </span>
                    <span className="text-gray-500 text-sm">Создано {formatDate(goal.startDate)}</span>
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
                    {daysLeft && (
                      <div className="text-md mt-1 text-black-200">
                        {daysLeft > 0 ? `${daysLeft} дней до дедлайна` : 'Дедлайн прошел'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Описание цели */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Описание цели</h3>
                <p className="text-gray-700 mb-6">{goal.description || 'Описание не указано'}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Дата начала</h4>
                    <p className="text-gray-900">{formatDate(goal.startDate)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Дедлайн</h4>
                    <p className="text-gray-900">{goal.endDate ? formatDate(goal.endDate) : 'Не указан'}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">Общий прогресс</span>
                    <span className="text-gray-900 font-medium">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded-full">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: `${goal.progress}%` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {goal.reward && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Награда за выполнение</h4>
                      <p className="text-green-700">{goal.reward}</p>
                    </div>
                  )}
                  {goal.consequence && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">Последствие провала</h4>
                      <p className="text-red-700">{goal.consequence}</p>
                    </div>
                  )}
                </div>

                {/* Этапы выполнения */}
                {goal.steps.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Этапы выполнения</h3>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        <FontAwesomeIcon icon={faPlus} className="w-4 mr-1" />
                        Добавить этап
                      </button>
                    </div>

                    <div className="space-y-3">
                      {goal.steps.map((step, index) => (
                        <div
                          key={step.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg ${
                            step.isCompleted
                              ? 'bg-green-50 border border-green-200'
                              : index === currentStepIndex
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              step.isCompleted
                                ? 'bg-green-500 text-white'
                                : index === currentStepIndex
                                ? 'bg-blue-500 text-white'
                                : 'border-2 border-gray-300 bg-white'
                            }`}
                          >
                            {step.isCompleted && <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />}
                            {index === currentStepIndex && !step.isCompleted && (
                              <FontAwesomeIcon icon={faCircle} className="w-3 h-3" />
                            )}
                            {index !== currentStepIndex && !step.isCompleted && (
                              <span className="text-gray-400">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${step.isCompleted ? 'text-green-800' : 'text-gray-900'}`}>
                              {step.text}
                            </h4>
                            <p
                              className={`text-sm ${
                                step.isCompleted
                                  ? 'text-green-600'
                                  : index === currentStepIndex
                                  ? 'text-blue-600'
                                  : 'text-gray-500'
                              }`}
                            >
                              {step.isCompleted ? 'Завершено' : 'В процессе'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Правая боковая панель */}
          <div className="w-1/4 pl-6">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Статистика</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ценность цели</span>
                  <span className="font-medium text-blue-600">{goal.value} баллов</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Дней прошло</span>
                  <span className="font-medium">{daysPassed}</span>
                </div>
                {daysLeft && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Дней осталось</span>
                    <span className="font-medium">{daysLeft}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Этапов завершено</span>
                  <span className="font-medium">
                    {completedSteps} из {goal.steps.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Приватность</span>
                  <span className={`px-2 py-1 rounded text-sm ${getPrivacyColor()}`}>{getPrivacyLabel()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Последняя активность</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Цель создана</p>
                    <p className="text-xs text-gray-500">{formatDate(goal.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Последнее обновление</p>
                    <p className="text-xs text-gray-500">{formatDate(goal.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Действия</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm">
                  Записать в блог
                </button>
                <button className="w-full text-blue-600 hover:text-blue-700 border border-blue-200 py-2 px-4 rounded-lg text-sm">
                  Поделиться целью
                </button>
                <button className="w-full text-gray-600 hover:text-gray-700 border border-gray-200 py-2 px-4 rounded-lg text-sm">
                  Настройки приватности
                </button>
                <button className="w-full text-red-600 hover:text-red-700 border border-red-200 py-2 px-4 rounded-lg text-sm">
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
