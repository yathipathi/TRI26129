'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button, Input, TextField, LinearProgress, Badge } from '@/components/ui';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
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
    <div className="min-h-screen bg-md-surface-low text-md-on-surface flex flex-col justify-center items-center p-6 selection:bg-md-primary-container selection:text-md-on-primary-container">
      <div className="max-w-md w-full bg-md-surface rounded-md-xl border border-md-outline-variant/60 shadow-md-2 p-8 md:p-10 space-y-6 m3-transition">
        {loading && <LinearProgress className="mb-2" />}

        <div className="flex items-center justify-between border-b border-md-outline-variant/40 pb-5">
          <Link href="/login" className="p-2 rounded-md-full hover:bg-md-surface-container text-md-on-surface-variant m3-transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Badge variant="primary">New Password</Badge>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-md-on-surface">Set New Password</h1>
          <p className="text-xs text-md-on-surface-variant mt-1.5">Enter your new credentials to restore account access.</p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-md-md border border-md-error/30 bg-md-error-container text-md-on-error-container text-xs flex items-center gap-3 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-md-error" />
            <span>{errorMessage}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-md-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Password Updated</span>
            </div>
            <p>Your password has been successfully reset. You may now sign in with your new password.</p>
            <Link
              href="/login"
              className="inline-block w-full text-center py-3 bg-md-primary text-md-on-primary rounded-md-full font-semibold text-sm hover:shadow-md-1 m3-transition"
            >
              Sign In Now →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-md-on-surface-variant mb-1.5">New Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Minimum 8 characters"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-md-on-surface-variant hover:text-md-on-surface cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <TextField
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter password"
            />

            <Button
              type="submit"
              disabled={loading}
              variant="filled"
              className="w-full py-3 text-sm font-semibold shadow-md-1 hover:shadow-md-2"
            >
              <span>{loading ? 'Updating Password...' : 'Update Password & Sign In'}</span>
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-md-on-surface-variant">Loading reset gate...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
