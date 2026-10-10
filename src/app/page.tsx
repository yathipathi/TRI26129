'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, LayoutGrid, ArrowRight, ShieldCheck, Zap, Globe, Cpu, Layers, Search } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [promptInput, setPromptInput] = useState('');

  const handleStartGeneration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) {
      router.push('/builder');
      return;
    }
    router.push(`/builder?prompt=${encodeURIComponent(promptInput)}`);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col justify-between">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-mono font-bold text-xs">AI</div>
            <span>Architect Studio</span>
          </Link>

          <nav className="flex items-center gap-6 text-xs font-mono font-bold uppercase tracking-wider">
            <Link href="/templates" className="hover:underline">Browse Templates</Link>
            <Link href="/builder" className="px-4 py-2 bg-black text-white hover:bg-neutral-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              Launch AI Builder →
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-24 sm:py-32 px-6 border-b-2 border-black bg-neutral-50 relative overflow-hidden">
          <div className="max-w-5xl mx-auto text-center relative z-10 font-mono">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-8 border-2 border-black bg-white text-xs font-bold uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>NEXT-GEN AI WEBSITE BUILDER & TEMPLATE ENGINE</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-[1.08] mb-8 font-sans">
              Describe Your Vision. <br />
              <span className="underline decoration-4 underline-offset-8 decoration-orange-500">AI Researches & Compiles</span> Your Site.
            </h1>

            <p className="text-base sm:text-xl text-neutral-700 max-w-3xl mx-auto font-normal leading-relaxed mb-12">
              Autonomous AI builder powered by web research, structured briefs, and hostinger-style multi-page template compilation.
            </p>

            {/* Main Prompt Bar */}
            <form onSubmit={handleStartGeneration} className="max-w-2xl mx-auto mb-10 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g., Italian restaurant in Hyderabad with wine tasting menu..."
                className="flex-1 p-4 border-2 border-black text-sm bg-white text-black outline-none focus:ring-2 focus:ring-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-black text-white hover:bg-neutral-800 font-bold text-xs uppercase tracking-wider transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap"
              >
                Generate Site →
              </button>
            </form>

            <div className="flex items-center justify-center gap-4 text-xs font-mono font-bold">
              <Link href="/templates" className="px-5 py-2.5 border-2 border-black bg-white hover:bg-neutral-100 flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <LayoutGrid className="w-4 h-4" />
                <span>Explore 12 Hostinger Templates</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 3 Pillar Features */}
        <section className="py-20 px-6 border-b-2 border-black bg-white font-mono">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-10 h-10 border-2 border-black bg-black text-white flex items-center justify-center font-bold mb-4">
                <Search className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold uppercase mb-2">1. Web Research Engine</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Tavily & DuckDuckGo APIs search live competitor layouts, pricing benchmarks, and regional details.
              </p>
            </div>

            <div className="p-8 border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-10 h-10 border-2 border-black bg-black text-white flex items-center justify-center font-bold mb-4">
                <Cpu className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold uppercase mb-2">2. Free Card-Free LLMs</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Groq free tier (llama-3.3-70b) primary with OpenRouter fallback for fast, structured generation.
              </p>
            </div>

            <div className="p-8 border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-10 h-10 border-2 border-black bg-black text-white flex items-center justify-center font-bold mb-4">
                <Layers className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold uppercase mb-2">3. Sandboxed Preview & ZIP</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Generated sites served safely from local disk storage with zero-config ZIP export and inline refine chat.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black py-10 px-6 bg-white font-mono text-xs text-center text-neutral-600">
        AI Website Builder & Hostinger-Grade Template Engine — 2026 Edition
      </footer>
    </div>
  );
}
