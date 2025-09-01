interface LeftSidebarErrorProps {
  error: string;
}

export function LeftSidebarError({ error }: LeftSidebarErrorProps) {
  return (
    <div className="text-center py-4">
      <div className="text-red-500 dark:text-red-400 mb-2">
        <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Ошибка загрузки профиля</p>
      <p className="text-red-500 dark:text-red-400 text-xs mb-4">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="text-xs bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white px-3 py-1 rounded transition-colors"
      >
        Попробовать снова
      </button>
    </div>
  );
}
