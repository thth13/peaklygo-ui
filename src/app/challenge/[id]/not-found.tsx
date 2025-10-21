import Link from 'next/link';

export default function ChallengeNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-6 text-6xl">🏆</div>
        <h1 className="mb-2 text-3xl font-bold text-gray-800 dark:text-white">Челлендж не найден</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">Такой челлендж не существует или был удален</p>
        <Link
          href="/challenge"
          className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-white hover:bg-primary-700"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>
          Вернуться к челленджам
        </Link>
      </div>
    </div>
  );
}
