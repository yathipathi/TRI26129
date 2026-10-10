'use client';

import React from 'react';
import { Section } from '@/types';

interface SectionProps {
  section: Section;
  isEditable?: boolean;
  onUpdateText?: (field: string, value: string, index?: number, subfield?: string) => void;
  onNavigatePage?: (target: string) => void;
}

export const FooterSection: React.FC<SectionProps> = ({
  section,
  isEditable = true,
  onUpdateText,
  onNavigatePage,
}) => {
  return (
    <footer className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-black text-white border-t-2 border-black">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 border border-white bg-white text-black flex items-center justify-center font-bold text-xs uppercase">
              {section.title?.charAt(0) || 'A'}
            </div>
            <div
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateText?.('title', e.currentTarget.textContent || '')}
              className="text-base font-black uppercase tracking-tight text-white outline-none focus:ring-1 focus:ring-white px-1"
            >
              {section.title}
            </div>
          </div>
          {section.subtitle && (
            <p
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateText?.('subtitle', e.currentTarget.textContent || '')}
              className="text-xs font-mono text-neutral-400 max-w-sm leading-relaxed outline-none focus:ring-1 focus:ring-white px-1"
            >
              {section.subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs font-mono">
          {(section.items || []).map((col, idx) => (
            <div key={col.id || idx}>
              <div
                contentEditable={isEditable}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'title')}
                className="font-bold uppercase tracking-wider text-white mb-2 outline-none focus:ring-1 focus:ring-white"
              >
                {col.title}
              </div>
              <div className="text-neutral-400 space-y-1.5 text-[11px]">
                {(col.description || 'Features, Pricing, Dashboard, Contact')
                  .split(',')
                  .map((link, lIdx) => {
                    const clean = link.trim().toLowerCase();
                    const target = clean.includes('pricing') ? '/pricing'
                      : clean.includes('feature') ? '/features'
                      : (clean.includes('dash') || clean.includes('console')) ? '/dashboard'
                      : clean.includes('contact') ? '/contact'
                      : '/';
                    return (
                      <div 
                        key={lIdx} 
                        onClick={() => onNavigatePage?.(target)}
                        className="hover:text-white cursor-pointer transition-colors"
                      >
                        {link.trim()}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};
