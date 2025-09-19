'use client';

import { useState, useTransition, useEffect } from 'react';

export function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const [currentLocale, setCurrentLocale] = useState('en');

  useEffect(() => {
    const localeFromCookie = document.cookie.replace(/(?:(?:^|.*;\s*)locale\s*=\s*([^;]*).*$)|^.*$/, '$1') || 'en';
    setCurrentLocale(localeFromCookie);
  }, []);

  const changeLanguage = (locale: string) => {
    startTransition(() => {
      document.cookie = `locale=${locale}; path=/; max-age=${365 * 24 * 60 * 60}`;
      setCurrentLocale(locale);
      window.location.reload();
    });
  };

  const languages: Array<{ code: string; label: string }> = [
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
    { code: 'ua', label: 'Українська' },
    { code: 'hi', label: 'हिंदी' },
  ];

  return (
    <details className="relative inline-block text-left group">
      <summary className="inline-flex cursor-pointer select-none items-center gap-2 rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 [&::-webkit-details-marker]:hidden">
        <span className="uppercase">{currentLocale || 'en'}</span>
        <svg
          className="h-4 w-4 transition-transform group-open:rotate-180"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.084l3.71-3.853a.75.75 0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </summary>

      <div
        role="menu"
        aria-orientation="vertical"
        className="pointer-events-none absolute right-0 z-50 mt-2 w-44 origin-top-right rounded-md bg-white py-1 opacity-0 shadow-lg ring-1 ring-black/10 transition-all duration-150 group-open:pointer-events-auto group-open:opacity-100 group-open:translate-y-0 translate-y-1"
      >
        {languages.map((lang) => {
          const active = currentLocale === lang.code;
          return (
            <button
              key={lang.code}
              role="menuitem"
              disabled={isPending}
              onClick={() => !isPending && changeLanguage(lang.code)}
              className={`flex w-full items-center justify-between px-3 py-2 text-sm ${
                active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="truncate">{lang.label}</span>
              {active && (
                <svg className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M16.704 5.29a1 1 0 010 1.414l-7.07 7.071a1 1 0 01-1.415 0L3.296 9.852a1 1 0 111.414-1.414l3.093 3.093 6.364-6.364a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </details>
  );
}
