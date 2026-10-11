'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button, Input, TextField, Card, LinearProgress, Badge } from '@/components/ui';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next') || '/dashboard';

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
    <div className="min-h-screen bg-md-surface-low text-md-on-surface flex flex-col justify-center items-center p-6 selection:bg-md-primary-container selection:text-md-on-primary-container">
      <div className="max-w-md w-full bg-md-surface rounded-md-xl border border-md-outline-variant/60 shadow-md-2 p-8 md:p-10 space-y-6 m3-transition">
        {loading && <LinearProgress className="mb-2" />}

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-md-outline-variant/40 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center font-bold text-sm shadow-xs">
              <Sparkles className="w-5 h-5 text-md-primary" />
            </div>
            <div>
              <span className="font-bold text-base block text-md-on-surface">SiteForge</span>
              <span className="text-[11px] text-md-on-surface-variant">AI Web Studio Portal</span>
            </div>
          </div>
          <Badge variant="tonal">Sign In</Badge>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-md-on-surface">Sign in to your account</h1>
          <p className="text-xs text-md-on-surface-variant mt-1.5">
            Access your evidence-backed websites, version history, and form inbox.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-md-md border border-md-error/30 bg-md-error-container text-md-on-error-container text-xs flex items-start gap-3 animate-fadeIn" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 text-md-error mt-0.5" />
            <div className="space-y-2 flex-1">
              <div>{errorMessage}</div>
              {showSignupHint && (
                <Link
                  href={`/signup?email=${encodeURIComponent(email)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-md-error text-md-on-error rounded-md-full font-semibold text-xs hover:opacity-90 m3-transition"
                >
                  Create an account <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@company.com"
          />

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-medium text-md-on-surface-variant">Password</label>
              <Link href="/forgot-password" className="text-xs font-medium text-md-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-md-on-surface-variant hover:text-md-on-surface cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-md-on-surface-variant">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-md-outline text-md-primary focus:ring-md-primary/20 w-4 h-4"
              />
              <span>Remember this session</span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            variant="filled"
            className="w-full py-3 text-sm font-semibold shadow-md-1 hover:shadow-md-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In & Proceed</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center text-xs border-t border-md-outline-variant/40 pt-5 text-md-on-surface-variant">
          Don&apos;t have an account?{' '}
          <Link href={`/signup${nextParam !== '/' ? `?next=${encodeURIComponent(nextParam)}` : ''}`} className="text-md-primary font-semibold hover:underline">
            Create account
          </Link>
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-8 text-center text-xs text-md-on-surface-variant/80 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-md-primary" />
        <span>Secured with HttpOnly Cookies & Supabase/Local Session Auth</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-md-on-surface-variant">Loading login gate...</div>}>
      <LoginContent />
    </Suspense>
  );
}
