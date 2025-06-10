import LinkWithProgress from '@/components/Link';

export default async function Profile() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Профиль</h1>
      <LinkWithProgress href="/goal/create">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg 
          hover:bg-blue-700 transition-colors duration-200 
          flex items-center gap-2 shadow-md
          active:transform active:scale-95"
        >
          <span>Создать цель</span>
        </button>
      </LinkWithProgress>
    </div>
  );
}
