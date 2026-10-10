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

export const HeroSection: React.FC<SectionProps> = ({
  section,
  isEditable = true,
  onUpdateText,
  onNavigatePage,
}) => {
  return (
    <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 border-b-2 border-black bg-white relative">
      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
        {/* Badge */}
        {section.badge && (
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-black bg-white text-[11px] font-mono font-bold uppercase tracking-wider text-black">
            <span
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateText?.('badge', e.currentTarget.textContent || '')}
              className="outline-none"
            >
              {section.badge}
            </span>
          </div>
        )}

        {/* Title */}
        <h1
          contentEditable={isEditable}
          suppressContentEditableWarning
          onBlur={(e) => onUpdateText?.('title', e.currentTarget.textContent || '')}
          className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-none text-black outline-none focus:ring-1 focus:ring-black px-2"
        >
          {section.title}
        </h1>

        {/* Subtitle */}
        {section.subtitle && (
          <p
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateText?.('subtitle', e.currentTarget.textContent || '')}
            className="text-sm sm:text-base lg:text-lg text-neutral-700 max-w-2xl mx-auto font-mono leading-relaxed outline-none focus:ring-1 focus:ring-black px-2"
          >
            {section.subtitle}
          </p>
        )}

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 max-w-md mx-auto sm:max-w-none">
          {section.ctaPrimary && (
            <button
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateText?.('ctaPrimary.text', e.currentTarget.textContent || '')}
              onClick={() => onNavigatePage?.(section.ctaPrimary?.link || '/pricing')}
              className="w-full sm:w-auto px-6 py-3 bg-black text-white hover:bg-neutral-800 border border-black text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none cursor-pointer"
            >
              <span>{section.ctaPrimary.text}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          {section.ctaSecondary && (
            <button
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateText?.('ctaSecondary.text', e.currentTarget.textContent || '')}
              onClick={() => onNavigatePage?.(section.ctaSecondary?.link || '/features')}
              className="w-full sm:w-auto px-6 py-3 bg-white text-black hover:bg-neutral-100 border border-black text-xs font-mono font-bold uppercase tracking-wider transition-colors outline-none cursor-pointer"
            >
              {section.ctaSecondary.text}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
