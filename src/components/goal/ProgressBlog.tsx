'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useProgressBlog } from '@/hooks/useProgressBlog';
import { formatTimeAgo, getDayColor } from '@/lib/utils';

interface ProgressBlogProps {
  goalId: string;
  currentDay?: number;
}

export const ProgressBlog = ({ goalId, currentDay = 67 }: ProgressBlogProps) => {
  const {
    showNewEntryForm,
    setShowNewEntryForm,
    newEntry,
    setNewEntry,
    blogEntries,
    isLoading,
    likeAnimations,
    handleSubmitEntry,
    handleToggleLike,
    isLikedByCurrentUser,
  } = useProgressBlog({ goalId, currentDay });

  if (isLoading) {
    return (
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Блог прогресса</h3>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Загружаем записи...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Блог прогресса</h3>
        <button
          onClick={() => setShowNewEntryForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
          <span>Новая запись</span>
        </button>
      </div>

      {/* Форма новой записи */}
      {showNewEntryForm && (
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Новая запись (день {currentDay})</h4>
            <button
              onClick={() => setShowNewEntryForm(false)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitEntry} className="space-y-4">
            <div>
              <textarea
                placeholder="Расскажите о своем прогрессе..."
                value={newEntry.content}
                onChange={(e) => setNewEntry({ content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
              >
                Опубликовать
              </button>
              <button
                type="button"
                onClick={() => setShowNewEntryForm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg text-sm transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {blogEntries.map((entry) => {
          const isLiked = isLikedByCurrentUser(entry);
          const isAnimating = likeAnimations[entry._id];

          return (
            <div key={entry._id} className="flex space-x-4">
              <div className="flex-shrink-0">
                <div
                  className={`${getDayColor(
                    entry.day,
                  )} rounded-lg w-14 h-14 flex flex-col items-center justify-center text-center`}
                >
                  <div className="text-lg font-bold leading-none">{entry.day}</div>
                  <div className="text-xs font-medium uppercase tracking-wide leading-none">ДЕНЬ</div>
                </div>
              </div>

              {/* Содержимое записи */}
              <div className="flex-1 min-w-0">
                <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{entry.content}</p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleToggleLike(entry._id)}
                      className={`flex items-center space-x-1 transition-all duration-200 transform ${
                        isLiked
                          ? '!text-red-500 dark:!text-red-400 hover:!text-red-600 dark:hover:!text-red-300'
                          : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
                      } ${isAnimating ? 'animate-pulse scale-125' : 'hover:scale-110'}`}
                      style={{
                        animation: isAnimating ? 'heartPulse 0.6s ease-in-out' : undefined,
                        color: isLiked ? '#ef4444' : undefined,
                      }}
                    >
                      <FontAwesomeIcon icon={faHeart} className="w-4 h-4 transition-all duration-200" />
                      <span className="font-medium">{entry.likes.length}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <FontAwesomeIcon icon={faComment} className="w-4 h-4" />
                      <span>{entry.comments} комментариев</span>
                    </button>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">{formatTimeAgo(entry.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {blogEntries.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Пока нет записей в блоге прогресса</p>
          <button
            onClick={() => setShowNewEntryForm(true)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Создать первую запись
          </button>
        </div>
      )}
    </div>
  );
};
