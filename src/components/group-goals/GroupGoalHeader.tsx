import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { faArrowLeft, faGear, faLayerGroup, faUsers, faUserPlus } from '@fortawesome/free-solid-svg-icons';

interface GroupGoalHeaderProps {
  goalName: string;
  statusLabel: string;
  privacyLabel: string;
  createdLabel: string;
  backHref?: string;
  goalId: string;
}

export function GroupGoalHeader({
  goalName,
  statusLabel,
  privacyLabel,
  createdLabel,
  backHref = '/group-goals',
  goalId,
}: GroupGoalHeaderProps) {
  return (
    <header className="rounded-2xl bg-white px-4 py-5 shadow-sm transition-colors dark:bg-gray-900 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href={backHref}
            className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
            Назад
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{goalName}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            {statusLabel && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                <FontAwesomeIcon icon={faUsers} className="mr-2 text-xs" />
                {statusLabel}
              </span>
            )}
            <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              <FontAwesomeIcon icon={faLayerGroup} className="mr-2 text-xs" />
              {privacyLabel}
            </span>
            {createdLabel && <span className="text-gray-500 dark:text-gray-400">{createdLabel}</span>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-600"
          >
            <FontAwesomeIcon icon={faUserPlus} className="mr-2 text-xs" />
            Пригласить
          </button>
          <Link
            href={`/group-goals/${goalId}/edit`}
            className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <FontAwesomeIcon icon={faGear} className="mr-2 text-xs" />
            Настройки
          </Link>
        </div>
      </div>
    </header>
  );
}
