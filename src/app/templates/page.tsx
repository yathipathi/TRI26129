'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Sparkles, LayoutGrid, ArrowRight, CheckCircle2, Layers } from 'lucide-react';

interface TemplateItem {
  slug: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  features: string[];
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Fetch template data
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => setTemplates(data))
      .catch(() => {});
  }, []);

  const categories = [
    'all',
    'portfolio',
    'restaurant',
    'law firm',
    'clinic',
    'ecommerce',
    'startup/SaaS',
    'education',
    'real estate',
    'photography',
    'ngo',
    'agency',
    'blog',
  ];

  const filteredTemplates = templates.filter((t) => {
    const matchesCat = selectedCategory === 'all' || t.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery.trim() === '' ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-mono font-bold text-xs">AI</div>
            <span>Architect Studio</span>
          </Link>

          <nav className="flex items-center gap-6 text-xs font-mono font-bold uppercase tracking-wider">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/templates" className="underline underline-offset-4 decoration-2">Templates</Link>
            <Link href="/builder" className="px-4 py-2 bg-black text-white hover:bg-neutral-800">AI Builder →</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 space-y-10">
        {/* Title Section */}
        <div className="border-b-2 border-black pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-black bg-neutral-100 text-xs font-mono font-bold uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>HOSTINGER-STYLE TEMPLATE GALLERY</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-3">
            Website Template Gallery
          </h1>
          <p className="text-sm font-mono text-neutral-600 max-w-2xl">
            Browse 12 visually distinct, category-specific website templates. Inspect live previews or use them as a base for AI generation.
          </p>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-2 border-black bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none text-xs font-mono">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 border border-black text-[11px] font-bold uppercase whitespace-nowrap transition-all ${
                  selectedCategory === cat ? 'bg-black text-white shadow-xs' : 'bg-white text-black hover:bg-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter templates..."
              className="pl-9 pr-3 py-2 border-2 border-black bg-white text-xs font-mono text-black outline-none focus:ring-1 focus:ring-black w-full md:w-64"
            />
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((t) => (
            <div
              key={t.slug}
              className="border-2 border-black bg-white rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Thumbnail Header */}
                <div className="h-48 border-b-2 border-black bg-neutral-100 relative overflow-hidden">
                  <img
                    src={t.thumbnail}
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-black text-white text-[10px] font-mono font-bold uppercase border border-white">
                    {t.category}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold uppercase tracking-tight text-black mb-2 group-hover:underline decoration-2">
                    {t.name}
                  </h3>
                  <p className="text-xs text-neutral-600 font-mono leading-relaxed mb-4 line-clamp-2">
                    {t.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4 font-mono text-[10px]">
                    {t.features.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 border border-black bg-neutral-100 text-black">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between gap-3 font-mono text-xs">
                <Link
                  href={`/templates/${t.slug}`}
                  className="flex-1 py-3 border-2 border-black bg-white hover:bg-neutral-100 font-bold uppercase tracking-wider text-center transition-colors"
                >
                  Live Preview
                </Link>
                <Link
                  href={`/builder?template=${t.slug}`}
                  className="flex-1 py-3 border-2 border-black bg-black text-white hover:bg-neutral-800 font-bold uppercase tracking-wider text-center transition-colors shadow-xs"
                >
                  Use Template
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black py-10 px-6 bg-white font-mono text-xs text-center text-neutral-600">
        Hostinger-Style Template Engine & AI Website Compiler — 2026 Edition
      </footer>
    </div>
  );
}
