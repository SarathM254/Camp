import React from 'react';
import { Share2, Star, CheckCircle2 } from 'lucide-react';
import useShare from '../../hooks/useShare';

export const ArticleCard = ({ article }) => {
  const { shareContent, isCopied } = useShare();

  if (!article) return null;

  const { title, body, author_name, image_path, tag, created_at } = article;

  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'Recent';

  const handleShare = () => {
    shareContent(
      title,
      body ? body.replace(/<[^>]+>/g, '').slice(0, 100) : '',
      window.location.href
    );
  };

  return (
    <div className="relative flex flex-col bg-white dark:bg-[#1a1a1a] sm:rounded-xl shadow-sm sm:border border-b sm:border-slate-100 border-slate-200 dark:border-[#333] sm:overflow-hidden hover:shadow-md transition-shadow sm:h-auto h-[calc(100dvh-126px)] min-h-[calc(100dvh-126px)] snap-start snap-always">
      {/* Image & Category Tag Header */}
      {image_path && (
        <div className="relative w-full aspect-[15/11] sm:h-48 shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-700">
          <img
            src={image_path}
            alt={title || 'Article image'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow overflow-y-auto">
        
        {/* Action Bar / Meta Header */}
        <div className="flex justify-between items-center w-full mb-4 shrink-0">
          <button className="text-slate-400 hover:text-yellow-400 transition" title="Save Article">
            <Star className="w-5 h-5" />
          </button>
          
          {tag && (
            <span className="bg-indigo-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
              {tag}
            </span>
          )}
          
          <div className="relative">
            <button
              onClick={handleShare}
              className="text-slate-400 hover:text-white transition"
              title="Share Article"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* Tooltip Overlay */}
            {isCopied && (
              <span className="absolute bottom-full right-0 mb-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-lg flex items-center gap-1 whitespace-nowrap animate-fade-in z-10">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Copied!
              </span>
            )}
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
          {title}
        </h3>

        <div className="text-slate-600 dark:text-[#a0a0a0] text-sm sm:text-base line-clamp-3 sm:line-clamp-none leading-relaxed mb-6 break-words grow">
          {body ? body.replace(/<[^>]+>/g, '').trim() || 'No description provided.' : 'No description provided.'}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-[#333] shrink-0 flex justify-between items-center">
          <a href="#" className="text-yellow-500 hover:text-yellow-400 text-sm font-medium hover:underline transition">
            @{author_name || 'Anonymous'}
          </a>
          <span className="text-xs text-slate-400">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
