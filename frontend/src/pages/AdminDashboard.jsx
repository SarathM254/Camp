import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Newspaper, Users, ShieldAlert, FileText, CheckCircle, Trash2, Shield, Loader, Eye, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AdminDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    totalArticlesCount: 0,
    pendingArticlesCount: 0,
    approvedArticlesCount: 0,
    totalUsersCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [previewArticle, setPreviewArticle] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (!user.isAdmin && !user.isSuperAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (previewArticle) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [previewArticle]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin?type=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`Admin ${activeTab} data:`, res.data);
      if (activeTab === 'dashboard') setStats(res.data.stats || stats);
      else if (activeTab === 'users') setData(res.data.users || []);
      else if (activeTab === 'admins') setData(res.data.admins || []);
      else if (activeTab === 'articles') setData(res.data.articles || []);
      else if (activeTab === 'polls') setData(res.data.polls || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.isAdmin || user.isSuperAdmin)) {
      fetchData();
    }
  }, [activeTab, user]);

  const handleApproveArticle = async (id) => {
    try {
      await axios.put(`${API_URL}/admin/articles/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Error approving article');
    }
  };

  const handleDeleteArticle = async (id) => {
    try {
      if (confirm('Are you sure you want to delete this article?')) {
        await axios.delete(`${API_URL}/admin/articles/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      }
    } catch (err) {
      alert('Error deleting article');
    }
  };

  const handlePromoteUser = async (id) => {
    try {
      await axios.put(`${API_URL}/admin/promote/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Error promoting user');
    }
  };

  const handleDemoteAdmin = async (id) => {
    try {
      await axios.put(`${API_URL}/admin/demote/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Error demoting admin');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      if (confirm('Are you sure you want to delete this user?')) {
        await axios.delete(`${API_URL}/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      }
    } catch (err) {
      alert('Error deleting user');
    }
  };

  if (!user || (!user.isAdmin && !user.isSuperAdmin)) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col md:flex-row gap-6 min-h-[70vh]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 space-y-2">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Management</h2>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
            activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-white hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-[#1f1f1f]'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg> Dashboard
        </button>
        <button
          onClick={() => setActiveTab('articles')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
            activeTab === 'articles' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-white hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-[#1f1f1f]'
          }`}
        >
          <FileText className="w-5 h-5" /> Articles
        </button>
        {user.isSuperAdmin && (
          <>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-white hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-[#1f1f1f]'
              }`}
            >
              <Users className="w-5 h-5" /> Users
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === 'admins' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-white hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-[#1f1f1f]'
              }`}
            >
              <ShieldAlert className="w-5 h-5" /> Admins
            </button>
          </>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#333] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-[#333] flex justify-between items-center">
          <h1 className="text-xl font-bold capitalize text-slate-800 dark:text-white">
            {activeTab === 'dashboard' ? 'Dashboard Overview' : `${activeTab} Management`}
          </h1>
        </div>
        <div className="p-6 overflow-x-auto">
          {activeTab === 'dashboard' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Articles */}
              <div className="bg-white dark:bg-[#252525] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#333] flex items-center gap-4 transition hover:shadow-md">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-[#667eea] to-[#764ba2]">
                  <Newspaper className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalArticlesCount}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Articles</p>
                </div>
              </div>

              {/* Pending Articles */}
              <div className="bg-white dark:bg-[#252525] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#333] flex items-center gap-4 transition hover:shadow-md">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-[#f093fb] to-[#f5576c]">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.pendingArticlesCount}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Pending Articles</p>
                </div>
              </div>

              {/* Total Users */}
              <div className="bg-white dark:bg-[#252525] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#333] flex items-center gap-4 transition hover:shadow-md">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-[#4facfe] to-[#00f2fe]">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalUsersCount}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Users</p>
                </div>
              </div>

              {/* Approved Articles */}
              <div className="bg-white dark:bg-[#252525] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#333] flex items-center gap-4 transition hover:shadow-md">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-[#43e97b] to-[#38f9d7]">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.approvedArticlesCount}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Approved Articles</p>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="flex justify-center p-12 text-indigo-600">
              <Loader className="w-8 h-8 animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <p className="text-slate-500 text-center py-12">No {activeTab} found.</p>
          ) : (
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-[#252525] text-slate-700 dark:text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Info</th>
                  <th className="px-4 py-3">Status/Role</th>
                  <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#333]">
                {data.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-[#252525]/50 transition">
                    <td className="px-4 py-4">
                      {activeTab === 'articles' ? (
                        <>
                          <div className="font-bold text-slate-800 dark:text-white">{item.title}</div>
                          <div className="text-xs text-slate-500">By {item.author_name}</div>
                        </>
                      ) : (
                        <>
                          <div className="font-bold text-slate-800 dark:text-white">{item.name}</div>
                          <div className="text-xs text-slate-500">{item.email}</div>
                          {item.admissionNumber && <div className="text-xs text-indigo-500 font-medium">{item.admissionNumber}</div>}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {activeTab === 'articles' ? (
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status || 'pending'}
                        </span>
                      ) : (
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          item.isSuperAdmin ? 'bg-purple-100 text-purple-700' : item.isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700 dark:bg-[#333] dark:text-slate-300'
                        }`}>
                          {item.isSuperAdmin ? 'Super Admin' : item.isAdmin ? 'Admin' : 'User'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right space-x-2">
                      {activeTab === 'articles' && (
                        <button onClick={() => setPreviewArticle(item)} className="text-indigo-600 hover:text-indigo-700 p-1 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 rounded transition" title="Preview">
                          <Eye className="w-5 h-5" />
                        </button>
                      )}
                      {activeTab === 'articles' && item.status !== 'approved' && (
                        <button onClick={() => { handleApproveArticle(item._id); setPreviewArticle(null); }} className="text-green-600 hover:text-green-700 p-1 bg-green-50 dark:bg-green-900/30 dark:text-green-400 rounded transition" title="Approve">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      {activeTab === 'articles' && (
                        <button onClick={() => { handleDeleteArticle(item._id); setPreviewArticle(null); }} className="text-red-600 hover:text-red-700 p-1 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded transition" title="Delete">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                      {activeTab === 'users' && !item.isAdmin && (
                        <button onClick={() => handlePromoteUser(item._id)} className="text-indigo-600 hover:text-indigo-700 text-xs font-bold px-2 py-1 bg-indigo-50 rounded border border-indigo-200">
                          Promote
                        </button>
                      )}
                      {activeTab === 'admins' && !item.isSuperAdmin && (
                        <button onClick={() => handleDemoteAdmin(item._id)} className="text-amber-600 hover:text-amber-700 text-xs font-bold px-2 py-1 bg-amber-50 rounded border border-amber-200">
                          Demote
                        </button>
                      )}
                      {(activeTab === 'users' || activeTab === 'admins') && !item.isSuperAdmin && (
                        <button onClick={() => handleDeleteUser(item._id)} className="text-red-600 hover:text-red-700 p-1 bg-red-50 rounded" title="Delete">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Article Preview Modal */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-[#0f0f0f] animate-in fade-in duration-300 overflow-y-auto">
          <div className="sticky top-0 z-10 flex justify-between items-center px-4 sm:px-6 py-4 sm:py-5 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-4">
              <button onClick={() => setPreviewArticle(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition">
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
              <span className="text-sm italic font-medium text-slate-400 dark:text-slate-500">Article Preview</span>
            </div>
            <div className="flex items-center gap-3">
              {previewArticle.status !== 'approved' && (
                <button
                  onClick={() => { handleApproveArticle(previewArticle._id); setPreviewArticle(null); }}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full font-semibold transition shadow-sm text-sm"
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
              )}
              <button
                onClick={() => { handleDeleteArticle(previewArticle._id); setPreviewArticle(null); }}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-semibold transition shadow-sm text-sm"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>

          <div className="max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col lg:flex-row gap-8 pb-20">
            {/* Article Content */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 text-sm font-semibold rounded-full uppercase tracking-wider">
                  {previewArticle.tag}
                </span>
                <span className="text-sm text-slate-500">
                  {new Date(previewArticle.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                {previewArticle.title}
              </h1>
              
              {previewArticle.image_path && (
                <div className="w-full rounded-2xl overflow-hidden mt-6">
                  <img 
                    src={previewArticle.image_path.startsWith('http') ? previewArticle.image_path : `${API_URL.replace('/api', '')}${previewArticle.image_path}`} 
                    alt="Article Cover" 
                    className="w-full h-auto object-cover max-h-[500px]" 
                  />
                </div>
              )}
              
              <div 
                className="prose prose-lg dark:prose-invert max-w-none mt-8 text-slate-700 dark:text-slate-300 leading-relaxed font-sans"
                dangerouslySetInnerHTML={{ __html: previewArticle.body }}
              />
            </div>

            {/* Submitter Details Sidebar */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-slate-50 dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-100 dark:border-[#333] sticky top-24">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Submitter Details</h3>
                
                {previewArticle.user_id ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Name</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{previewArticle.user_id.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Email</p>
                      <p className="text-sm text-slate-800 dark:text-white">{previewArticle.user_id.email}</p>
                    </div>
                    {previewArticle.user_id.admissionNumber && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Admission Number</p>
                        <p className="font-mono text-sm text-indigo-600 dark:text-indigo-400">{previewArticle.user_id.admissionNumber}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Role & Status</p>
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-2 py-1 bg-slate-200 dark:bg-[#333] text-xs rounded-md text-slate-700 dark:text-slate-300">
                          {previewArticle.user_id.role || 'user'}
                        </span>
                        {previewArticle.user_id.isCollegeVerified && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 text-xs rounded-md">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">Legacy submission (No detailed author data)</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
