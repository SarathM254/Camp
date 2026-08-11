import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ArticleCard from '../components/features/ArticleCard';

const CATEGORIES = ['All', 'Campus', 'Sports', 'Events', 'Opinion'];
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const Home = () => {
  const { user, loading: authLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/articles`);
        if (res.data && res.data.articles) {
          setArticles(res.data.articles);
        } else if (Array.isArray(res.data)) {
          setArticles(res.data);
        }
      } catch (err) {
        console.error('Error loading articles:', err);
        setError('Unable to load articles right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center dark:bg-[#0f0f0f]"></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const filteredArticles = selectedCategory === 'All'
    ? articles
    : articles.filter((item) => item.tag?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="flex flex-col sm:space-y-8 w-full">
      {/* Category Navigation Bar - Full Width Background */}
      <div className="sticky top-16 z-40 w-full bg-slate-50 dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-[#222] shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none pt-4 pb-3 px-4 sm:px-6 lg:px-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#4f56c7] text-white shadow-sm'
                  : 'bg-white dark:bg-[#1a1a1a] text-slate-600 dark:text-[#a0a0a0] hover:bg-slate-100 dark:hover:bg-[#252525] border border-slate-200 dark:border-[#333]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Feed - Constrained Width */}
      <div className="max-w-7xl mx-auto w-full px-0 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 sm:gap-6 p-0 sm:p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 sm:rounded-xl bg-slate-200 dark:bg-[#252525] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white dark:bg-[#252525] sm:rounded-2xl border-y sm:border border-slate-200 dark:border-[#333]">
            <p className="text-slate-600 dark:text-slate-400">{error}</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#252525] sm:rounded-2xl border-y sm:border border-slate-200 dark:border-[#333] space-y-2">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">No articles found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Be the first to post an article in the {selectedCategory} category!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 sm:gap-6 pb-20 sm:pb-0">
            {filteredArticles.map((article) => (
              <ArticleCard key={article._id || article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
