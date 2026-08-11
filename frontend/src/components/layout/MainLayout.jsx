import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';
import { CreateArticle } from '../features/CreateArticle';

export const MainLayout = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0f0f0f] text-slate-800 dark:text-white pb-16">
      <Header onAddClick={() => setIsEditorOpen(true)} />
      <main className="flex-grow w-full">
        <Outlet />
      </main>
      <BottomNav onAddClick={() => setIsEditorOpen(true)} />
      <CreateArticle isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} />
    </div>
  );
};

export default MainLayout;
