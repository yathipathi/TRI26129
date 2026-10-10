'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-neutral-100 text-black font-sans selection:bg-black selection:text-white flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full border-2 border-black bg-white p-8 sm:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6 font-mono">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <Link href="/login" className="p-1 border border-black hover:bg-black hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 border border-black bg-neutral-100">
            RESET PASSWORD
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-black uppercase text-black">Reset Password</h1>
          <p className="text-xs text-neutral-600 mt-1">Enter your registered email address to receive password recovery instructions.</p>
        </div>

        {submitted ? (
          <div className="p-4 border-2 border-emerald-600 bg-emerald-50 text-emerald-900 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold uppercase">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Reset Dispatch Triggered</span>
            </div>
            <p className="leading-relaxed">{message}</p>
            <div className="pt-2">
              <Link href="/login" className="font-bold underline uppercase">
                Return to Sign In →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                className="w-full p-3 border-2 border-black bg-white text-black outline-none focus:ring-2 focus:ring-black font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white font-bold uppercase tracking-wider hover:bg-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Processing...' : 'Send Reset Link'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
