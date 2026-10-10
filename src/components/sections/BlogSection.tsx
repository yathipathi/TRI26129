'use client';

import React from 'react';
import { Section } from '@/types';
import { ArrowRight } from 'lucide-react';

interface SectionProps {
  section: Section;
  isEditable?: boolean;
  onUpdateText?: (field: string, value: string, index?: number, subfield?: string) => void;
}

export const BlogSection: React.FC<SectionProps> = ({
  section,
  isEditable = true,
  onUpdateText,
}) => {
  const articles = section.items || [
    { id: '1', title: 'Deterministic Compilers in Modern AI Architecture', description: 'How strictly typed prompts eliminate hallucinations in generative UI pipelines.', author: 'Staff Systems Architect', date: 'October 10, 2026', badge: 'RESEARCH' },
    { id: '2', title: 'Why Minimalist Ergonomics Convert 40% Better', description: 'Cognitive ergonomics and visual hierarchy in modern enterprise developer tooling.', author: 'Design Lead', date: 'October 08, 2026', badge: 'DESIGN' },
    { id: '3', title: 'Scaling Sub-Millisecond State Replication Globally', description: 'Distributing state across 42 edge regions with zero data loss or merge conflicts.', author: 'Principal Infra Engineer', date: 'September 29, 2026', badge: 'ENGINEERING' },
  ];

  return (
    <section id="blog" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b-2 border-black bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 sm:mb-16 space-y-3">
          {section.badge && (
            <div
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateText?.('badge', e.currentTarget.textContent || '')}
              className="inline-flex items-center px-3 py-1 border border-black bg-white text-[11px] font-mono font-bold tracking-wide uppercase text-black outline-none"
            >
              {section.badge}
            </div>
          )}
          <h2
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateText?.('title', e.currentTarget.textContent || '')}
            className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black outline-none focus:ring-1 focus:ring-black"
          >
            {section.title || 'Engineering Logs & Insights'}
          </h2>
          {section.subtitle && (
            <p
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateText?.('subtitle', e.currentTarget.textContent || '')}
              className="text-xs sm:text-sm text-neutral-700 font-mono max-w-2xl outline-none focus:ring-1 focus:ring-black"
            >
              {section.subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((art, idx) => (
            <article
              key={art.id || idx}
              className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 border border-black uppercase text-black">
                    {art.badge || 'ARTICLE'}
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">{art.date}</span>
                </div>

                <h3
                  contentEditable={isEditable}
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'title')}
                  className="text-lg font-bold uppercase tracking-tight text-black mb-3 outline-none focus:ring-1 focus:ring-black"
                >
                  {art.title}
                </h3>

                <p
                  contentEditable={isEditable}
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'description')}
                  className="text-xs font-mono text-neutral-700 leading-relaxed outline-none focus:ring-1 focus:ring-black"
                >
                  {art.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-black flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-500 font-bold">{art.author}</span>
                <span className="flex items-center gap-1 font-bold uppercase text-black hover:underline cursor-pointer">
                  <span>Read Log</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
