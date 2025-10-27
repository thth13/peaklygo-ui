import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

interface ParticipantView {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface GroupChatProps {
  participantViews: ParticipantView[];
}

export function GroupChat({ participantViews }: GroupChatProps) {
  const title = 'Чат участников';
  const subtitle = 'Обсуждайте прогресс, делитесь советами и поддерживайте друг друга.';
  const emptyText = 'Добавьте первых участников, чтобы начать общение.';
  const inputPlaceholder = 'Написать сообщение...';
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm transition-colors dark:bg-gray-900">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>

      <div className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
        {participantViews.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
            {emptyText}
          </div>
        ) : (
          participantViews.slice(0, 3).map((participant, index) => (
            <div key={participant.id} className="flex items-start gap-3">
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
                    {participant.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/60">
                <div className="text-sm font-semibold text-gray-800 dark:text-white">{participant.name}</div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {index === 0
                    ? 'Сегодня было непросто, но я справился! Кто со мной?'
                    : index === 1
                    ? 'Совет дня: пейте больше воды до пробежки 🚰'
                    : 'Завтра планирую добавить растяжку после тренировки.'}
                </div>
                <div className="mt-2 text-xs text-gray-400">Несколько минут назад</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder={inputPlaceholder}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-primary-700"
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>
    </article>
  );
}
