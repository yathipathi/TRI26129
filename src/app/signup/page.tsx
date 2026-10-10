'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, Shield } from 'lucide-react';

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
    if (!pwd) return { score: 0, label: '', color: 'bg-neutral-200' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
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
        router.push('/');
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
    <div className="min-h-screen bg-neutral-100 text-black font-sans selection:bg-black selection:text-white flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full border-2 border-black bg-white p-8 sm:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6 font-mono">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <div className="font-black text-base uppercase flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-orange-500 rounded-full border border-black inline-block"></span>
            <span>SiteForge Portal</span>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 border border-black bg-neutral-100">
            REGISTER
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-black uppercase text-black">Create Account</h1>
          <p className="text-xs text-neutral-600 mt-1">Start building verified websites with zero vendor lock-in.</p>
        </div>

        {errorMessage && (
          <div className="p-3.5 border-2 border-red-600 bg-red-50 text-red-900 text-xs flex items-center gap-2" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Lead Architect"
              className="w-full p-3 border-2 border-black bg-white text-black outline-none focus:ring-2 focus:ring-black font-mono"
            />
          </div>

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
            <label className="block font-bold uppercase mb-1">Password</label>
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

            {/* Password Strength Meter */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span>Strength: {strength.label}</span>
                  <span>{password.length}/8 chars</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-200 border border-black">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${(strength.score / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold uppercase mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter password"
              className="w-full p-3 border-2 border-black bg-white text-black outline-none focus:ring-2 focus:ring-black font-mono"
            />
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="w-4 h-4 border-2 border-black accent-black mt-0.5"
              />
              <span className="text-[11px] leading-tight">
                I accept the terms of service and acknowledge that all generated sites undergo Playwright verification crawling.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white font-bold uppercase tracking-wider hover:bg-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-spin">●</span> : <ArrowRight className="w-4 h-4" />}
            <span>{loading ? 'Creating Account...' : 'Register & Enter Dashboard'}</span>
          </button>
        </form>

        <div className="text-center text-xs border-t-2 border-black pt-4">
          <span className="text-neutral-600">Already have an account? </span>
          <Link href="/login" className="font-bold underline text-black hover:text-orange-600">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-8 font-mono text-xs">Loading Auth Gate...</div>}>
      <SignupContent />
    </Suspense>
  );
}
