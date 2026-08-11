import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 bg-white dark:bg-[#151515] border-b border-slate-200 dark:border-slate-800 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/campuz.png" alt="Campuzway Logo" className="w-10 h-10 rounded-xl bg-black object-contain shadow-md transition group-hover:scale-105" />
          <div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Campuzway
            </span>
            <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              Campus News
            </span>
          </div>
        </Link>

        {/* Header Actions */}
        <div className="flex items-center">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
