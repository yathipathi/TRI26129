'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Eye, EyeOff, AlertCircle, ArrowRight, Shield } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSignupHint, setShowSignupHint] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setShowSignupHint(false);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, next: nextParam }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push(data.redirectUrl || '/');
        router.refresh();
      } else {
        setErrorMessage(data.error || 'Invalid email or password');
        if (data.showSignupHint) {
          setShowSignupHint(true);
        }
      }
    } catch (err: any) {
      setErrorMessage('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-black font-sans selection:bg-black selection:text-white flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full border-2 border-black bg-white p-8 sm:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6 font-mono">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <div className="font-black text-base uppercase flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-orange-500 rounded-full border border-black inline-block"></span>
            <span>SiteForge Portal</span>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 border border-black bg-neutral-100">
            SIGN IN
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-black uppercase text-black">Sign In</h1>
          <p className="text-xs text-neutral-600 mt-1">Access your verified websites, version history, and inbox.</p>
        </div>

        {errorMessage && (
          <div className="p-4 border-2 border-red-600 bg-red-50 text-red-900 text-xs flex items-start gap-2" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div className="space-y-2">
              <div>{errorMessage}</div>
              {showSignupHint && (
                <Link
                  href={`/signup?email=${encodeURIComponent(email)}`}
                  className="inline-block px-3 py-1 bg-red-600 text-white font-bold text-[11px] uppercase hover:bg-red-700 transition-colors"
                >
                  Create an account →
                </Link>
              )}
            </div>
          </div>
        )}

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

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-bold uppercase">Password</label>
              <Link href="/forgot-password" className="text-neutral-600 hover:text-black hover:underline text-[11px]">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full p-3 pr-10 border-2 border-black bg-white text-black outline-none focus:ring-2 focus:ring-black font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-neutral-500 hover:text-black"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 border-2 border-black accent-black"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white font-bold uppercase tracking-wider hover:bg-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-spin">●</span> : <ArrowRight className="w-4 h-4" />}
            <span>{loading ? 'Authenticating...' : 'Sign In & Proceed'}</span>
          </button>
        </form>

        <div className="text-center text-xs border-t-2 border-black pt-4">
          <span className="text-neutral-600">New here? </span>
          <Link href="/signup" className="font-bold underline text-black hover:text-orange-600">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 font-mono text-xs">Loading Auth Gate...</div>}>
      <LoginContent />
    </Suspense>
  );
}
