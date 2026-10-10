'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setErrorMessage(data.error || 'Password reset failed');
      }
    } catch {
      setErrorMessage('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-black font-sans selection:bg-black selection:text-white flex flex-col justify-center items-center p-6 font-mono">
      <div className="max-w-md w-full border-2 border-black bg-white p-8 sm:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <Link href="/login" className="p-1 border border-black hover:bg-black hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 border border-black bg-neutral-100">
            NEW PASSWORD
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-black uppercase text-black">Set New Password</h1>
          <p className="text-xs text-neutral-600 mt-1">Enter your new credentials to restore account access.</p>
        </div>

        {errorMessage && (
          <div className="p-3.5 border-2 border-red-600 bg-red-50 text-red-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 border-2 border-emerald-600 bg-emerald-50 text-emerald-900 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold uppercase">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Password Updated</span>
            </div>
            <p>Your password has been successfully reset. You may now sign in with your new password.</p>
            <Link
              href="/login"
              className="block w-full py-3 bg-black text-white text-center font-bold uppercase hover:bg-neutral-800 transition-colors"
            >
              Sign In Now →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Minimum 8 characters"
                  className="w-full p-3 pr-10 border-2 border-black bg-white text-black outline-none focus:ring-2 focus:ring-black font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-500 hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter password"
                className="w-full p-3 border-2 border-black bg-white text-black outline-none focus:ring-2 focus:ring-black font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-4 bg-black text-white font-bold uppercase tracking-wider hover:bg-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 font-mono text-xs">Loading Auth Gate...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
