import LinkWithProgress from '@/components/Link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
      <main className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">PeaklyGo</h1>

        <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
          Добро пожаловать в PeaklyGo - платформу, которая поможет вам достигать ваших целей. Ставьте цели, отслеживайте
          прогресс и превращайте мечты в реальность.
        </p>

        <div className="flex gap-4 justify-center">
          <LinkWithProgress
            href="/auth/login"
            className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Вход
          </LinkWithProgress>
          <LinkWithProgress
            href="/auth/register"
            className="px-6 py-3 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
          >
            Регистрация
          </LinkWithProgress>
        </div>
      </main>
    </div>
  );
}
