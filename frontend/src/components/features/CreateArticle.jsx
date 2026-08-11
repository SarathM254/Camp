import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CollegeVerificationModal } from './CollegeVerificationModal';
import { ImageEditor } from './ImageEditor';
import Quill from 'quill';
import 'quill/dist/quill.bubble.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const CreateArticle = ({ isOpen, onClose }) => {
  const { user, token } = useAuth();
  const [showVerification, setShowVerification] = useState(false);
  const [isVerified, setIsVerified] = useState(() => 
    user?.isCollegeVerified || user?.isSuperAdmin || user?.isAdmin || false
  );
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Campus');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  const quillRef = useRef(null);
  const quillInstance = useRef(null);

  useEffect(() => {
    if (user?.isCollegeVerified || user?.isSuperAdmin || user?.isAdmin) {
      setIsVerified(true);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && !isVerified && !showVerification) {
      setShowVerification(true);
    }
  }, [isOpen, isVerified, showVerification]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isVerified && quillRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(quillRef.current, {
        theme: 'bubble',
        placeholder: 'Tell your story...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ header: 2 }],
            ['link', 'blockquote'],
          ],
        },
      });
      quillInstance.current.on('text-change', () => {
        setError('');
      });
    }
  }, [isOpen, isVerified]);

  const handleImageAdjusted = (result) => {
    setImageFile(result.file);
    setImagePreviewUrl(result.dataUrl);
  };

  const handlePreviewClick = () => {
    if (!title.trim() || !quillInstance.current) {
      setError('Title and body are required.');
      return;
    }
    const body = quillInstance.current.root.innerHTML;
    if (body === '<p><br></p>') {
      setError('Body cannot be empty.');
      return;
    }
    setError('');
    setIsPreviewMode(true);
  };

  const handlePublish = async () => {
    if (!title.trim() || !quillInstance.current) {
      setError('Title and body are required.');
      return;
    }
    const body = quillInstance.current.root.innerHTML;

    setIsSubmitting(true);
    setError('');

    try {
      let image_path = '';
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const uploadRes = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          image_path = uploadData.url;
        } else {
          throw new Error('Image upload failed');
        }
      }

      const res = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          body,
          tag: category,
          image_path
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setTitle('');
          setImageFile(null);
          setImagePreviewUrl(null);
          setIsPreviewMode(false);
          if (quillInstance.current) {
            quillInstance.current.root.innerHTML = '';
          }
        }, 2000);
      } else {
        setError(data.error || 'Failed to submit article');
      }
    } catch (err) {
      setError(err.message || 'Server error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {showVerification && !isVerified ? (
        <CollegeVerificationModal
          isOpen={true}
          onClose={() => {
            setShowVerification(false);
            onClose();
          }}
          onVerified={() => {
            setIsVerified(true);
            setShowVerification(false);
          }}
        />
      ) : (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-[#0f0f0f] animate-in fade-in duration-300 overflow-y-auto">
          {/* Topbar */}
          <div className="sticky top-0 z-10 flex justify-between items-center px-4 sm:px-6 py-4 sm:py-5 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-4">
              {isPreviewMode ? (
                <button onClick={() => { setIsPreviewMode(false); setError(''); }} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-[#252525] dark:hover:bg-[#333] rounded-full transition">
                  Back to Edit
                </button>
              ) : (
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition">
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}
              <span className="text-sm italic font-medium text-slate-400 dark:text-slate-500">
                {isPreviewMode ? 'Preview Mode' : 'Draft loaded'}
              </span>
            </div>
            {isPreviewMode ? (
              <button
                onClick={handlePublish}
                disabled={isSubmitting}
                className="bg-[#6366f1] hover:bg-indigo-600 disabled:opacity-50 text-white px-6 py-2 rounded-full font-semibold transition shadow-sm"
              >
                {isSubmitting ? 'Publishing...' : 'Submit for Review'}
              </button>
            ) : (
              <button
                onClick={handlePreviewClick}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white px-6 py-2 rounded-full font-semibold transition shadow-sm"
              >
                Preview
              </button>
            )}
          </div>

          {/* Content Wrapper */}
          <div className="max-w-3xl w-full mx-auto p-4 sm:p-8 space-y-8 pb-20">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 text-green-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Submission Received!</h3>
                  <p className="text-green-600/80">Your article is being processed and is pending admin approval.</p>
                </div>
              </div>
            )}

            {!success && isPreviewMode && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 text-sm font-semibold rounded-full uppercase tracking-wider">
                    {category}
                  </span>
                  <span className="text-sm text-slate-500">Just now</span>
                </div>
                
                <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                  {title}
                </h1>
                
                {imagePreviewUrl && (
                  <div className="w-full rounded-2xl overflow-hidden mt-6">
                    <img src={imagePreviewUrl} alt="Article Cover" className="w-full h-auto object-cover max-h-[500px]" />
                  </div>
                )}
                
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none mt-8 text-slate-700 dark:text-slate-300 leading-relaxed font-sans"
                  dangerouslySetInnerHTML={{ __html: quillInstance.current?.root.innerHTML }}
                />
              </div>
            )}

            {!success && !isPreviewMode && (
              <>
                {/* Image Editor */}
                <div>
                  <ImageEditor onImageAdjusted={handleImageAdjusted} />
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2">
                  {['Campus', 'Sports', 'Events', 'Opinion'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-5 py-1.5 rounded-full text-sm font-medium transition ${
                        category === cat
                          ? 'bg-[#6366f1] text-white border-transparent'
                          : 'bg-white dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#444] hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Title */}
                <textarea
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setError('');
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  placeholder="Title"
                  rows={1}
                  className="w-full text-4xl sm:text-5xl font-bold bg-transparent border-none outline-none resize-none text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-[#444] overflow-hidden leading-tight"
                />

                {/* Quill Editor */}
                <div className="prose prose-lg dark:prose-invert max-w-none group">
                  <div 
                    ref={quillRef} 
                    className="min-h-[400px] text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-sans border-2 border-dashed border-slate-200 dark:border-[#333] hover:border-indigo-400 focus-within:border-indigo-500 focus-within:border-solid rounded-2xl bg-slate-50/50 dark:bg-[#1a1a1a]/50 focus-within:bg-white dark:focus-within:bg-[#252525] transition-all cursor-text" 
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CreateArticle;
