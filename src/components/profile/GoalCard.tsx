import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendar as faCalendarRegular,
  faEllipsisVertical,
  faCoins,
  faPencil,
  faChartLine,
  faShare,
} from '@fortawesome/free-solid-svg-icons';
import { Goal } from '@/types';
import { formatDate } from '@/lib/utils';

interface GoalCardProps {
  goal: Goal;
}

export const GoalCard = ({ goal }: GoalCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border-l-4 border-primary-500">
      <div className="flex items-start space-x-4 mb-4">
        {goal.image && (
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img className="w-full h-full object-cover" src={goal.image} alt="goal image" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{goal.goalName}</h3>
              <p className="text-gray-500 text-sm">Создано {formatDate(goal.startDate)}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium
                  ${goal.isCompleted ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'}
                `}
              >
                {goal.isCompleted ? 'Достигнуто' : 'В процессе'}
              </span>
              <button className="text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faEllipsisVertical} className="w-1" />
              </button>
            </div>
          </div>

          <p className="text-gray-600 mb-4">{goal.description}</p>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Прогресс</span>
              <span className={`text-sm font-medium ${goal.progress === 100 ? 'text-green-600' : 'text-gray-500'}`}>
                {goal.progress === 100 ? 'Завершено!' : `${goal.progress}%`}
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div
                className={`h-2 rounded-full ${goal.progress === 100 ? 'bg-green-500' : 'bg-primary-500'}`}
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            {goal.endDate && (
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCalendarRegular} className="w-4 mr-2" />
                <span>Дедлайн: {formatDate(goal.endDate)}</span>
              </div>
            )}

            <div className="flex items-center">
              <FontAwesomeIcon icon={faCoins} className="w-4 mr-2" />
              <span>Ценность: {goal.value} баллов</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex space-x-4">
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                <FontAwesomeIcon icon={faPencil} className="w-4 mr-1" />
                Редактировать
              </button>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                <FontAwesomeIcon icon={faChartLine} className="w-4 mr-1" />
                Прогресс
              </button>
            </div>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
              <FontAwesomeIcon icon={faShare} className="w-4 mr-1" />
              Поделиться
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
