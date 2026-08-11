import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export const Login = () => {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setSubmitting(true);
    try {
      if (credentialResponse.credential) {
        await googleLogin(credentialResponse.credential);
        navigate('/');
      } else {
        setError('No credential received from Google.');
        setSubmitting(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Google Authentication failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white dark:bg-[#252525] rounded-2xl border border-slate-200 dark:border-[#333] shadow-md p-8">
      <div className="text-center mb-8 flex flex-col items-center gap-2">
        <img src="/campuz.png" alt="Campuzway Logo" className="h-16 w-16 rounded-xl bg-black p-1 object-contain shadow-md" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Campuzway
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your Campus News Source
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
            Sign in with Google
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Quick and secure sign-in with your Google account
          </p>
        </div>

        <div className="flex justify-center w-full min-h-[44px]">
          {submitting ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">Connecting...</div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError('Google Authentication failed. Please try again.');
                setSubmitting(false);
              }}
              useOneTap
              theme="outline"
              size="large"
              width="100%"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

