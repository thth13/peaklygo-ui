import Link from 'next/link';
import pkg from '../../package.json';

export default function VersionLink() {
  const version = pkg.version;
  if (!version) return null;
  return (
    <div className="fixed bottom-2 right-2 z-[60] pointer-events-none select-none">
      <Link
        href="/versions"
        className="pointer-events-auto inline-flex items-center gap-1 rounded-md border border-primary-200/60 dark:border-primary-800/60 bg-white/70 dark:bg-gray-900/60 backdrop-blur px-2 py-0.5 text-[10px] font-medium text-primary-700 dark:text-primary-200 shadow-sm hover:bg-white dark:hover:bg-gray-900 transition-colors"
      >
        <span className="tracking-wide">v{version}</span>
      </Link>
    </div>
  );
}
