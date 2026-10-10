import React from 'react';
import Link from 'next/link';
import { getSiteMeta } from '@/lib/storage';
import { ArrowLeft, ExternalLink, Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FullPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meta = getSiteMeta(id);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col h-screen">
      {/* Top Banner */}
      <header className="sticky top-0 z-50 bg-black text-white px-6 py-2.5 flex items-center justify-between text-xs font-mono border-b-2 border-black">
        <div className="flex items-center gap-3">
          <Link
            href="/builder"
            className="p-1 border border-white hover:bg-white hover:text-black transition-colors flex items-center gap-1 font-bold uppercase"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>AI Builder</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>SITE PREVIEW: {meta?.name || id}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/api/download/${id}`}
            className="px-3 py-1 bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ZIP</span>
          </a>
        </div>
      </header>

      {/* Full-bleed Sandboxed Iframe Preview */}
      <main className="flex-1 bg-neutral-200 flex flex-col relative overflow-hidden">
        <iframe
          key={id}
          sandbox="allow-scripts allow-forms allow-same-origin allow-modals allow-popups"
          src={`/api/preview/${id}`}
          title={meta?.name || 'Generated Website'}
          className="w-full h-full flex-1 border-0 bg-white"
        />
      </main>
    </div>
  );
}
