import React from 'react';

export const ArticleCardSkeleton = () => {
  return (
    <div className="relative flex flex-col bg-white dark:bg-[#1a1a1a] sm:rounded-xl shadow-sm sm:border border-b sm:border-slate-100 border-slate-200 dark:border-[#333] sm:overflow-hidden sm:h-auto h-[calc(100dvh-126px)] min-h-[calc(100dvh-126px)] snap-start snap-always animate-pulse">
      
      {/* Image Skeleton */}
      <div className="relative w-full aspect-[15/11] sm:h-48 shrink-0 bg-slate-200 dark:bg-[#2a2a2a]" />

      {/* Content Area Skeleton */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        
        {/* Action Bar / Meta Header Skeleton */}
        <div className="flex justify-between items-center w-full mb-4 shrink-0">
          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-[#2a2a2a]" />
          <div className="w-16 h-5 rounded-full bg-slate-200 dark:bg-[#2a2a2a]" />
          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-[#2a2a2a]" />
        </div>

        {/* Title Skeletons */}
        <div className="w-3/4 h-6 rounded-md bg-slate-200 dark:bg-[#2a2a2a] mb-2" />
        <div className="w-1/2 h-6 rounded-md bg-slate-200 dark:bg-[#2a2a2a] mb-4" />

        {/* Body Skeletons */}
        <div className="w-full h-4 rounded-md bg-slate-200 dark:bg-[#2a2a2a] mb-2" />
        <div className="w-full h-4 rounded-md bg-slate-200 dark:bg-[#2a2a2a] mb-2" />
        <div className="w-2/3 h-4 rounded-md bg-slate-200 dark:bg-[#2a2a2a] mb-6 grow" />

        {/* Footer Skeleton */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-[#333] shrink-0 flex justify-between items-center">
          <div className="w-24 h-4 rounded-md bg-slate-200 dark:bg-[#2a2a2a]" />
          <div className="w-16 h-4 rounded-md bg-slate-200 dark:bg-[#2a2a2a]" />
        </div>
      </div>
    </div>
  );
};

export default ArticleCardSkeleton;
