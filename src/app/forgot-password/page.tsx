'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { Button, TextField, LinearProgress, Badge } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setSubmitted(true);
      setMessage(data.message || 'If an account exists, password reset instructions have been dispatched.');
    } catch {
      setSubmitted(true);
      setMessage('If an account exists, password reset instructions have been dispatched.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-md-surface-low text-md-on-surface flex flex-col justify-center items-center p-6 selection:bg-md-primary-container selection:text-md-on-primary-container">
      <div className="max-w-md w-full bg-md-surface rounded-md-xl border border-md-outline-variant/60 shadow-md-2 p-8 md:p-10 space-y-6 m3-transition">
        {loading && <LinearProgress className="mb-2" />}

        <div className="flex items-center justify-between border-b border-md-outline-variant/40 pb-5">
          <Link
            href="/login"
            className="p-2 rounded-md-full hover:bg-md-surface-container text-md-on-surface-variant m3-transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Badge variant="tonal">Password Reset</Badge>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-md-on-surface">Reset Password</h1>
          <p className="text-xs text-md-on-surface-variant mt-1.5">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-md-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Reset Dispatch Triggered</span>
            </div>
            <p className="leading-relaxed">{message}</p>
            <div className="pt-2">
              <Link href="/login" className="font-semibold text-md-primary hover:underline flex items-center gap-1.5">
                Return to Sign In →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@company.com"
            />

            <Button
              type="submit"
              disabled={loading}
              variant="filled"
              className="w-full py-3 text-sm font-semibold shadow-md-1 hover:shadow-md-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Processing...' : 'Send Reset Link'}</span>
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
