import Link from 'next/link';

export const dynamic = 'force-static';

interface VersionEntry {
  version: string;
  date: string;
  notes: string[];
}

const history: VersionEntry[] = [
  {
    version: '0.1.0',
    date: '2025-09-18',
    notes: ['Initial public beta', 'Goals, profile, progress blog'],
  },
  {
    version: '0.1.1',
    date: '2025-09-19',
    notes: ['Hindi language', 'Versions page'],
  },
];

export default function VersionsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-300">Versions</h1>
        <Link href="/" className="text-sm text-primary-600 dark:text-primary-300 hover:underline">
          Back
        </Link>
      </div>
      <ul className="space-y-6">
        {history.map((h) => (
          <li
            key={h.version}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 dark:text-primary-200">
                v{h.version}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{h.date}</span>
            </div>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-200 space-y-1">
              {h.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </main>
  );
}
