'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button, Input, TextField, LinearProgress, Badge } from '@/components/ui';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get('email') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-md-outline-variant' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score, label: 'Weak', color: 'bg-md-error' };
    if (score === 2 || score === 3) return { score, label: 'Moderate', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

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

    if (!terms) {
      setErrorMessage('You must accept the terms to create an account');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword, terms }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setErrorMessage(data.error || 'Signup failed');
      }
    } catch (err) {
      setErrorMessage('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-md-surface-low text-md-on-surface flex flex-col justify-center items-center p-6 selection:bg-md-primary-container selection:text-md-on-primary-container">
      <div className="max-w-md w-full bg-md-surface rounded-md-xl border border-md-outline-variant/60 shadow-md-2 p-8 md:p-10 space-y-6 m3-transition">
        {loading && <LinearProgress className="mb-2" />}

        {/* Header */}
        <div className="flex items-center justify-between border-b border-md-outline-variant/40 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center font-bold text-sm shadow-xs">
              <Sparkles className="w-5 h-5 text-md-primary" />
            </div>
            <div>
              <span className="font-bold text-base block text-md-on-surface">SiteForge</span>
              <span className="text-[11px] text-md-on-surface-variant">Account Creation</span>
            </div>
          </div>
          <Badge variant="primary">Register</Badge>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-md-on-surface">Create your account</h1>
          <p className="text-xs text-md-on-surface-variant mt-1.5">
            Start building evidence-backed websites with zero vendor lock-in.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-md-md border border-md-error/30 bg-md-error-container text-md-on-error-container text-xs flex items-center gap-3 animate-fadeIn" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 text-md-error" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Lead Architect"
          />

          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@company.com"
          />

          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-1.5">Password</label>
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

            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between items-center text-[11px] text-md-on-surface-variant">
                  <span>Password Strength:</span>
                  <span className="font-semibold">{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-md-surface-container rounded-md-full overflow-hidden flex">
                  <div
                    className={`h-full m3-transition ${strength.color}`}
                    style={{ width: `${(strength.score / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Re-enter password"
          />

          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-md-on-surface-variant">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-0.5 rounded border-md-outline text-md-primary focus:ring-md-primary/20 w-4 h-4"
              />
              <span>
                I accept the SiteForge terms of service, local privacy guidelines, and evidence verification policies.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            variant="filled"
            className="w-full py-3 text-sm font-semibold shadow-md-1 hover:shadow-md-2"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Create Account & Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center text-xs border-t border-md-outline-variant/40 pt-5 text-md-on-surface-variant">
          Already have an account?{' '}
          <Link href="/login" className="text-md-primary font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-md-on-surface-variant/80 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-md-primary" />
        <span>Protected by Automated Hallucination Guard & Playwright Verifier</span>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-md-on-surface-variant">Loading registration...</div>}>
      <SignupContent />
    </Suspense>
  );
}
