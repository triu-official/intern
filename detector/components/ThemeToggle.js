'use client';

import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="text-gray-200" size={20} />
      ) : (
        <Moon className="text-gray-800" size={20} />
      )}
    </button>
  );
}
