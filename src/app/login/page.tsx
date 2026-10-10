'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@siteforge.ai');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-black font-sans selection:bg-black selection:text-white flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full border-2 border-black bg-white p-8 sm:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-8 font-mono">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <Link href="/" className="p-1 border border-black hover:bg-black hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="font-black text-sm uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>SiteForge Portal</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black uppercase text-black">Sign In</h1>
          <p className="text-xs text-neutral-600 mt-1">Access your verified projects and historical versions.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div>
            <label className="block font-bold uppercase mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border-2 border-black bg-white text-black outline-none font-mono"
            />
          </div>

          <div>
            <label className="block font-bold uppercase mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border-2 border-black bg-white text-black outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-black text-white font-bold uppercase tracking-wider hover:bg-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Authenticate & Proceed →
          </button>
        </form>

        <div className="text-center text-xs border-t border-black pt-4">
          <span className="text-neutral-600">Don't have an account? </span>
          <Link href="/signup" className="font-bold underline hover:text-orange-600">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
