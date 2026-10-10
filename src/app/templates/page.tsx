'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Sparkles, LayoutGrid, ArrowRight, CheckCircle2, Layers, ArrowLeft } from 'lucide-react';
import { Button, Card, CardHeader, CardContent, CardFooter, Badge, Chip, Input } from '@/components/ui';

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
    <div className="min-h-screen bg-md-surface-low text-md-on-surface font-sans selection:bg-md-primary-container selection:text-md-on-primary-container flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-md-surface/90 backdrop-blur-md border-b border-md-outline-variant/50 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-md-full hover:bg-md-surface-container text-md-on-surface-variant m3-transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center font-bold text-xs">
              <Sparkles className="w-4 h-4 text-md-primary" />
            </div>
            <span className="font-bold text-base text-md-on-surface">Template Library</span>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm">Workspace</Button>
          </Link>
          <Link href="/builder">
            <Button variant="filled" size="sm">AI Builder →</Button>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        {/* Title Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="primary">Hostinger-Style Gallery</Badge>
            <Badge variant="tonal">12 Production Layouts</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-md-on-surface">
            Curated Website Templates
          </h1>
          <p className="text-xs sm:text-sm text-md-on-surface-variant max-w-2xl">
            Browse visually distinct, category-specific website templates with verified component structures. Use them as a starting blueprint for AI customization.
          </p>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-md-surface rounded-md-xl border border-md-outline-variant shadow-md-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none w-full md:w-auto">
            {categories.map((cat) => (
              <Chip
                key={cat}
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.toUpperCase()}
              </Chip>
            ))}
          </div>

          <div className="relative shrink-0 w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-md-on-surface-variant" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="pl-9 pr-3 py-2 text-xs"
            />
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((t) => (
            <Card key={t.slug} className="hover:shadow-md-2 m3-transition group flex flex-col justify-between overflow-hidden">
              <div>
                <div className="h-48 bg-md-surface-container relative overflow-hidden">
                  <img
                    src={t.thumbnail}
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="primary">{t.category}</Badge>
                  </div>
                </div>

                <CardContent className="p-5 space-y-3">
                  <h3 className="text-lg font-bold text-md-on-surface group-hover:text-md-primary m3-transition">
                    {t.name}
                  </h3>
                  <p className="text-xs text-md-on-surface-variant leading-relaxed line-clamp-2">
                    {t.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {t.features.map((f, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-3 border-t border-md-outline-variant/40 flex items-center justify-between">
                <Link href={`/builder?template=${t.slug}`} className="w-full">
                  <Button variant="filled" size="sm" className="w-full font-semibold">
                    <span>Use Template with AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
