import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import type { CheckInStatus } from '@/types';
import { IMAGE_URL } from '@/constants';

interface ParticipantView {
  id: string;
  name: string;
  avatarUrl: string | null;
  roleLabel: string;
  joinedLabel: string;
  completionRate: number | null;
  todaysStatus: CheckInStatus | null;
}

interface ParticipantsListProps {
  participantViews: ParticipantView[];
  totalParticipants: number;
  acceptedCount: number;
}

export function ParticipantsList({ participantViews, totalParticipants, acceptedCount }: ParticipantsListProps) {
  const t = useTranslations('groupGoal.participants');
  const subtitle = t('count', { accepted: acceptedCount, total: totalParticipants });
  const emptyText = t('empty');
  const title = `${t('title')} (${totalParticipants})`;
  const inviteText = 'Пригласить еще';
  const showAllText = 'Показать всех участников';
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm transition-colors dark:bg-gray-900">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <button type="button" className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700">
          <FontAwesomeIcon icon={faUserPlus} className="mr-2 text-xs" />
          {inviteText}
        </button>
      </div>

      <div className="space-y-4">
        {participantViews.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
            {emptyText}
          </div>
        ) : (
          participantViews.map((participant) => {
            const presenceClass =
              participant.todaysStatus === 'completed'
                ? 'bg-green-500'
                : participant.todaysStatus === 'missed'
                ? 'bg-red-500'
                : participant.todaysStatus === 'pending'
                ? 'bg-yellow-500'
                : 'bg-gray-300';

            return (
              <div
                key={participant.id}
                className="flex items-center justify-between rounded-xl border border-transparent p-4 transition-colors hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-700 dark:hover:bg-gray-800/60"
              >
                <div className="flex flex-1 items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-xl bg-gray-200">
                    {participant.avatarUrl ? (
                      <Image
                        src={`${IMAGE_URL}/${participant.avatarUrl}`}
                        alt={participant.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-600">
                        {participant.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{participant.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{participant.joinedLabel}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
                    {participant.roleLabel}
                  </span>
                  <span className={`h-3 w-3 rounded-full ${presenceClass}`}></span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-300">
                    {participant.completionRate !== null ? `${participant.completionRate}%` : '—'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-xl border border-primary-200 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
      >
        {showAllText}
      </button>
    </article>
  );
}
