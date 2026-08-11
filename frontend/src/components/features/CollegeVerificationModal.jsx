import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { University, ShieldAlert, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CollegeVerificationModal = ({ isOpen, onClose, onVerified }) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { verifyCollegeEmail } = useAuth();

  if (!isOpen) return null;

  const handleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await verifyCollegeEmail(credentialResponse.credential);
      if (res.success) {
        onVerified();
      } else {
        setError(res.error || 'Verification failed. Must be @iitism.ac.in');
      }
    } catch (err) {
      setError(err.message || 'Server error during verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setError('Google login popup closed or failed.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-[#333]">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <University className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Verify Institute Email
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 p-4 rounded-xl text-sm leading-relaxed border border-indigo-100 dark:border-indigo-800/50">
            To post articles on Campuzway, you must verify your identity with your institute email ending in <strong>@iitism.ac.in</strong>.
          </div>

          <div className="flex justify-center py-4">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap={false}
              theme="filled_blue"
              shape="pill"
              text="continue_with"
            />
          </div>

          {isLoading && (
            <div className="text-center text-sm text-slate-500 animate-pulse">
              Verifying your credential...
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800/50">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <p className="text-xs text-center text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 mt-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            This is a one-time verification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CollegeVerificationModal;
