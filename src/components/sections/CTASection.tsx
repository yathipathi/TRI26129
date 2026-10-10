'use client';

import React from 'react';
import { Section } from '@/types';
import { ArrowRight } from 'lucide-react';

interface SectionProps {
  section: Section;
  isEditable?: boolean;
  onUpdateText?: (field: string, value: string, index?: number, subfield?: string) => void;
  onNavigatePage?: (target: string) => void;
}

export const CTASection: React.FC<SectionProps> = ({
  section,
  isEditable = true,
  onUpdateText,
  onNavigatePage,
}) => {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b-2 border-black bg-black text-white relative">
      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
        {section.badge && (
          <div
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateText?.('badge', e.currentTarget.textContent || '')}
            className="inline-flex items-center px-3 py-1 border border-white bg-black text-[11px] font-mono font-bold tracking-wider uppercase text-white outline-none"
          >
            <span>{section.badge}</span>
          </div>
        )}

        <h2
          contentEditable={isEditable}
          suppressContentEditableWarning
          onBlur={(e) => onUpdateText?.('title', e.currentTarget.textContent || '')}
          className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none outline-none focus:ring-1 focus:ring-white px-1"
        >
          {section.title}
        </h2>

        {section.subtitle && (
          <p
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateText?.('subtitle', e.currentTarget.textContent || '')}
            className="text-xs sm:text-sm text-neutral-300 max-w-2xl mx-auto font-mono leading-relaxed outline-none focus:ring-1 focus:ring-white px-1"
          >
            {section.subtitle}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 max-w-md mx-auto sm:max-w-none">
          {section.ctaPrimary && (
            <button
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateText?.('ctaPrimary.text', e.currentTarget.textContent || '')}
              onClick={() => onNavigatePage?.(section.ctaPrimary?.link || '/pricing')}
              className="w-full sm:w-auto px-6 py-3 bg-white text-black hover:bg-neutral-200 font-mono font-bold uppercase text-xs border border-white transition-colors flex items-center justify-center gap-2 outline-none shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] cursor-pointer"
            >
              <span>{section.ctaPrimary.text}</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>
          )}
          {section.ctaSecondary && (
            <button
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateText?.('ctaSecondary.text', e.currentTarget.textContent || '')}
              onClick={() => onNavigatePage?.(section.ctaSecondary?.link || '/contact')}
              className="w-full sm:w-auto px-6 py-3 bg-black hover:bg-neutral-900 text-white border border-white font-mono font-bold uppercase text-xs transition-colors text-center outline-none cursor-pointer"
            >
              {section.ctaSecondary.text}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
