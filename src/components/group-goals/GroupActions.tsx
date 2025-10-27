interface GroupActionsProps {}

export function GroupActions({}: GroupActionsProps) {
  const title = 'Действия';
  const createPostText = 'Создать пост';
  const shareText = 'Поделиться группой';
  const exportText = 'Экспорт статистики';
  const leaveText = 'Покинуть группу';
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm transition-colors dark:bg-gray-900">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      <div className="mt-4 space-y-2">
        <button
          type="button"
          className="w-full rounded-xl bg-primary-600 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
        >
          {createPostText}
        </button>
        <button
          type="button"
          className="w-full rounded-xl bg-gray-100 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          {shareText}
        </button>
        <button
          type="button"
          className="w-full rounded-xl bg-gray-100 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          {exportText}
        </button>
        <button
          type="button"
          className="w-full rounded-xl bg-red-50 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40"
        >
          {leaveText}
        </button>
      </div>
    </section>
  );
}
