'use client';

import React from 'react';
import { Section } from '@/types';
import { Star } from 'lucide-react';

interface SectionProps {
  section: Section;
  isEditable?: boolean;
  onUpdateText?: (field: string, value: string, index?: number, subfield?: string) => void;
}

export const TestimonialsSection: React.FC<SectionProps> = ({
  section,
  isEditable = true,
  onUpdateText,
}) => {
  return (
    <section id="testimonials" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b-2 border-black bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          {section.badge && (
            <div
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateText?.('badge', e.currentTarget.textContent || '')}
              className="inline-flex items-center px-3 py-1 border border-black bg-white text-[11px] font-mono font-bold uppercase tracking-wider text-black outline-none"
            >
              {section.badge}
            </div>
          )}
          <h2
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateText?.('title', e.currentTarget.textContent || '')}
            className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black outline-none focus:ring-1 focus:ring-black px-1"
          >
            {section.title}
          </h2>
          {section.subtitle && (
            <p
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateText?.('subtitle', e.currentTarget.textContent || '')}
              className="text-xs sm:text-sm text-neutral-700 font-mono outline-none focus:ring-1 focus:ring-black px-1"
            >
              {section.subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(section.items || []).map((item, idx) => (
            <div
              key={item.id || idx}
              className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-black fill-black" />
                  ))}
                </div>
                <p
                  contentEditable={isEditable}
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'description')}
                  className="text-xs font-mono leading-relaxed text-black mb-6 outline-none focus:ring-1 focus:ring-black"
                >
                  {item.description}
                </p>
              </div>

              <div className="border-t border-black pt-4 flex items-center gap-3">
                <div className="w-9 h-9 border border-black bg-black text-white flex items-center justify-center font-bold text-xs uppercase font-mono">
                  {item.avatar || (item.author ? item.author.substring(0, 2) : 'US')}
                </div>
                <div>
                  <div
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'author')}
                    className="font-bold text-xs uppercase tracking-wider text-black outline-none focus:ring-1 focus:ring-black"
                  >
                    {item.author}
                  </div>
                  <div
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'role')}
                    className="text-[10px] font-mono text-neutral-600 outline-none"
                  >
                    {item.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
