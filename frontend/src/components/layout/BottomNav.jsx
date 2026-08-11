import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Plus, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BottomNav = ({ onAddClick }) => {
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#0f0f0f] border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="flex justify-around items-center h-16">
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full space-y-1 transition ${
              isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`
          }
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>

        {/* Add Article */}
        <button
          onClick={onAddClick}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 hover:text-indigo-600 dark:text-slate-400 transition group"
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md group-hover:bg-indigo-700 transition-colors">
            <Plus className="w-6 h-6" />
          </div>
        </button>

        {/* Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full space-y-1 transition ${
              isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {user?.isSuperAdmin ? (
                <div className="relative">
                  <img src="/campuz.png" alt="Super Admin" className="w-6 h-6 rounded-md bg-black p-0.5 object-contain shadow-sm" />
                </div>
              ) : user?.avatarSeed ? (
                <img 
                  src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.avatarSeed}`} 
                  alt="Avatar" 
                  className={`w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border ${isActive ? 'border-indigo-600 dark:border-indigo-400' : 'border-transparent'}`} 
                />
              ) : (
                <User className="w-6 h-6" />
              )}
              <span className="text-[10px] font-medium">Profile</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
