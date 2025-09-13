'use client';

import { usePathname } from 'next/navigation';
import LinkWithProgress from '../Link';
import ThemeToggle from '../ThemeToggle';
import Image from 'next/image';

export const Header = () => {
  const pathname = usePathname();
  if (pathname === '/') return null;
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm py-4 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <LinkWithProgress href="/">
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 cursor-pointer">PeaklyGo</h1>
          </LinkWithProgress>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <i className="fa-solid fa-bell"></i>
          </button>
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <i className="fa-solid fa-envelope"></i>
          </button>
          <div className="h-8 w-8 rounded-full overflow-hidden">
            <Image
              src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
              alt="Profile"
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
