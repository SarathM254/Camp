import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-[#111111] border-t border-slate-200 dark:border-[#222] mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Campuzway</h4>
            <p className="text-sm text-slate-600 dark:text-[#a0a0a0]">
              Your trusted source for campus news, events, sports updates, and student opinions. Stay connected with what's happening on campus.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Categories</h4>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-[#a0a0a0]">
              <li><span className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">Campus</span></li>
              <li><span className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">Sports</span></li>
              <li><span className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">Events</span></li>
              <li><span className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">Opinion</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Contact</h4>
            <p className="text-sm text-slate-600 dark:text-[#a0a0a0]">Email: news@campuzway.in</p>
            <p className="text-sm text-slate-600 dark:text-[#a0a0a0]">Campus News Team</p>
          </div>
        </div>
        <div className="border-t border-slate-100 dark:border-[#222] pt-4 text-center text-xs text-slate-500 dark:text-slate-500">
          &copy; {new Date().getFullYear()} Campuzway. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
