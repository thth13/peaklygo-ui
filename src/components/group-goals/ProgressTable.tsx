import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { faCheck, faClock, faXmark } from '@fortawesome/free-solid-svg-icons';
import type { CheckInStatus } from '@/types';

interface ParticipantView {
  id: string;
  name: string;
  avatarUrl: string | null;
  roleLabel: string;
  statusesByDate: (CheckInStatus | null)[];
}

interface ProgressTableProps {
  title: string;
  subtitle: string;
  emptyText: string;
  displayedDates: string[];
  todayKey: string;
  participantViews: ParticipantView[];
  completedText: string;
  missedText: string;
  pendingText: string;
  showAllText: string;
}

export function ProgressTable({
  title,
  subtitle,
  emptyText,
  displayedDates,
  todayKey,
  participantViews,
  completedText,
  missedText,
  pendingText,
  showAllText,
}: ProgressTableProps) {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm transition-colors dark:bg-gray-900">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
              <th className="px-2 py-3 text-left font-medium">Участник</th>
              {displayedDates.map((dateKey) => {
                const date = new Date(dateKey);
                const dayNumber = date.getDate();
                const isToday = dateKey === todayKey;
                return (
                  <th
                    key={dateKey}
                    className={`px-2 py-3 text-center font-medium ${
                      isToday ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200' : ''
                    }`}
                  >
                    {dayNumber}
                  </th>
                );
              })}
              <th className="px-2 py-3 text-center font-medium">Всего</th>
            </tr>
          </thead>
          <tbody>
            {participantViews.length === 0 ? (
              <tr>
                <td
                  colSpan={displayedDates.length + 2}
                  className="px-2 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              participantViews.map((participant) => {
                const totalCompleted = participant.statusesByDate.filter((status) => status === 'completed').length;
                const totalTracked = participant.statusesByDate.filter((status) => Boolean(status)).length;
                return (
                  <tr
                    key={participant.id}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/60"
                  >
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                          {participant.avatarUrl ? (
                            <Image
                              src={participant.avatarUrl}
                              alt={participant.name}
                              width={32}
                              height={32}
                              className="h-8 w-8 object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-600">
                              {participant.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-primary-600 dark:text-primary-400">{participant.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{participant.roleLabel}</div>
                        </div>
                      </div>
                    </td>
                    {participant.statusesByDate.map((status, index) => {
                      const dateKey = displayedDates[index];
                      const isToday = dateKey === todayKey;
                      return (
                        <td
                          key={`${participant.id}-${dateKey}`}
                          className={`px-2 py-3 text-center text-sm ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        >
                          {status === 'completed' ? (
                            <FontAwesomeIcon icon={faCheck} className="text-green-500" />
                          ) : status === 'missed' ? (
                            <FontAwesomeIcon icon={faXmark} className="text-red-500" />
                          ) : status === 'pending' ? (
                            <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-2 py-3 text-center text-sm font-semibold">
                      {totalTracked > 0 ? `${totalCompleted}/${totalTracked}` : '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-2">
            <FontAwesomeIcon icon={faCheck} className="text-green-500" /> {completedText}
          </span>
          <span className="inline-flex items-center gap-2">
            <FontAwesomeIcon icon={faXmark} className="text-red-500" /> {missedText}
          </span>
          <span className="inline-flex items-center gap-2">
            <FontAwesomeIcon icon={faClock} className="text-gray-400" /> {pendingText}
          </span>
        </div>
        <button type="button" className="text-primary-600 transition-colors hover:text-primary-700">
          {showAllText}
        </button>
      </div>
    </article>
  );
}
