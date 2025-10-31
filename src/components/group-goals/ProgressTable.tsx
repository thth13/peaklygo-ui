import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { faCheck, faClock, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import type { CheckInStatus } from '@/types';

interface ParticipantView {
  id: string;
  name: string;
  avatarUrl: string | null;
  roleLabel: string;
  statusesByDate: (CheckInStatus | null)[];
}

interface ProgressTableProps {
  displayedDates: string[];
  todayKey: string;
  participantViews: ParticipantView[];
  challengeStartDate: Date;
}

export function ProgressTable({ displayedDates, todayKey, participantViews, challengeStartDate }: ProgressTableProps) {
  const t = useTranslations('groupGoal.progressTable');
  const tParticipants = useTranslations('groupGoal.participants');
  const emptyText = tParticipants('empty');
  const title = t('title');
  const subtitle = t('lastDays', { count: displayedDates.length });
  const completedText = t('completed');
  const missedText = t('missed');
  const pendingText = t('pending');
  const showAllText = t('showAll');
  const participantLabel = t('participant');
  const totalLabel = t('total');
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
              <th className="px-2 py-3 text-left font-medium">{participantLabel}</th>
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
              <th className="px-2 py-3 text-center font-medium">{totalLabel}</th>
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
                // Подсчет статусов с учетом пропущенных дней
                let totalCompleted = 0;

                // Вычисляем количество дней с момента старта челленджа до сегодня
                const challengeStart = new Date(challengeStartDate);
                const today = new Date(todayKey);
                const totalTracked = Math.max(
                  0,
                  Math.floor((today.getTime() - challengeStart.getTime()) / (1000 * 60 * 60 * 24)) + 1,
                );

                participant.statusesByDate.forEach((status, index) => {
                  const dateKey = displayedDates[index];
                  const isPastDay = new Date(dateKey) < new Date(todayKey);
                  const isBeforeChallenge = new Date(dateKey) < new Date(challengeStartDate);

                  // Не учитываем дни до начала челленджа
                  if (isBeforeChallenge) return;

                  const displayStatus = isPastDay && !status ? 'missed' : status;

                  if (displayStatus === 'completed') totalCompleted++;
                });

                const successRate = totalTracked > 0 ? Math.round((totalCompleted / totalTracked) * 100) : 0;

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
                      const isPastDay = new Date(dateKey) < new Date(todayKey);
                      const isBeforeChallenge = new Date(dateKey) < new Date(challengeStartDate);

                      // Если день до начала челленджа, показываем точку
                      if (isBeforeChallenge) {
                        return (
                          <td
                            key={`${participant.id}-${dateKey}`}
                            className={`px-2 py-3 text-center text-sm ${
                              isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                          </td>
                        );
                      }

                      // Если день прошел и не выполнен, показываем как пропуск
                      const displayStatus = isPastDay && !status ? 'missed' : status;

                      const getTooltip = () => {
                        if (displayStatus === 'completed') return completedText;
                        if (displayStatus === 'missed') return missedText;
                        if (displayStatus === 'pending') return pendingText;
                        return '';
                      };

                      return (
                        <td
                          key={`${participant.id}-${dateKey}`}
                          className={`px-2 py-3 text-center text-sm ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                          title={getTooltip()}
                        >
                          {displayStatus === 'completed' ? (
                            <FontAwesomeIcon icon={faCheck} className="text-green-500" />
                          ) : displayStatus === 'missed' ? (
                            <FontAwesomeIcon icon={faXmark} className="text-red-500" />
                          ) : displayStatus === 'pending' ? (
                            <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-2 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-semibold">
                          {totalCompleted}/{totalTracked}
                        </span>
                        {totalTracked > 0 && (
                          <span
                            className={`text-xs font-medium ${
                              successRate >= 80
                                ? 'text-green-600 dark:text-green-400'
                                : successRate >= 50
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {successRate}%
                          </span>
                        )}
                      </div>
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
