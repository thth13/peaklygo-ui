import LinkWithProgress from '@/components/Link';
import { LeftSidebar } from '@/components/layout/LeftSidebar';

export default function ProfileNotFound() {
  return (
    <main className="max-w-7xl mx-auto mt-6 px-4 flex">
      <LeftSidebar />
      <div id="main-content" className="w-3/5 px-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <svg
              className="h-6 w-6 text-gray-600 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Профиль не найден</h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6">Пользователь с таким ID не существует или был удален.</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <LinkWithProgress
              href="/"
              className="px-6 py-3 bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              Вернуться на главную
            </LinkWithProgress>

            <LinkWithProgress
              href="/auth/register"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Зарегистрироваться
            </LinkWithProgress>
          </div>
        </div>
      </div>

      <div className="w-1/5 pl-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Возможные причины</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Неверный ID пользователя</li>
            <li>• Пользователь удалил аккаунт</li>
            <li>• Профиль заблокирован</li>
            <li>• Ошибка в ссылке</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
