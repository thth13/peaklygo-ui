'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Проверяем сохранённую тему или системные настройки
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    setIsDark(shouldBeDark);
    updateTheme(shouldBeDark);
  }, []);

  const updateTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    updateTheme(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <button onClick={toggleTheme} className="p-2 rounded-lg flex items-center justify-center" aria-label="Toggle theme">
      {isDark ? (
        <FontAwesomeIcon icon={faSun} className="text-yellow-500 text-xl" />
      ) : (
        <FontAwesomeIcon icon={faMoon} className="text-gray-600 dark:text-gray-300 text-xl" />
      )}
    </button>
  );
}
