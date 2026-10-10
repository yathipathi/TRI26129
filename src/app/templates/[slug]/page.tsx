import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTemplateBySlug, getAllTemplates } from '@/lib/templates';
import { ArrowLeft, ExternalLink, Sparkles, Layout } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const templates = getAllTemplates();
  return templates.map((t) => ({ slug: t.slug }));
}

export default async function TemplateDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);

  if (!template) {
    notFound();
  }

  const iframeSrc = `/templates/${template.slug}/index.html`;

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col">
      {/* Top Action Header Bar */}
      <header className="sticky top-0 z-50 bg-black text-white px-6 py-3 flex items-center justify-between text-xs font-mono border-b-2 border-black">
        <div className="flex items-center gap-3">
          <Link
            href="/templates"
            className="p-1.5 border border-white hover:bg-white hover:text-black transition-colors flex items-center gap-1.5 font-bold uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Gallery</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-neutral-300">
            <span>TEMPLATE:</span>
            <span className="font-bold text-white uppercase">{template.name}</span>
            <span className="px-2 py-0.5 border border-neutral-600 bg-neutral-900 text-neutral-200 text-[10px] uppercase">
              {template.category}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={iframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 border border-white hover:bg-white hover:text-black font-bold uppercase transition-colors"
          >
            <span>Open Raw</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            href={`/builder?template=${template.slug}`}
            className="px-4 py-1.5 bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Use This Template →</span>
          </Link>
        </div>
      </header>

      {/* Main Fullscreen Iframe Preview Area */}
      <div className="flex-1 bg-neutral-200 flex flex-col relative overflow-hidden">
        <iframe
          key={template.slug}
          src={iframeSrc}
          title={template.name}
          className="w-full h-full flex-1 border-0 shadow-lg bg-white"
        />
      </div>
    </div>
  );
}
