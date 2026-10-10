'use client';

import React, { useState } from 'react';
import { Section } from '@/types';
import { Plus, Minus } from 'lucide-react';

interface SectionProps {
  section: Section;
  isEditable?: boolean;
  onUpdateText?: (field: string, value: string, index?: number, subfield?: string) => void;
}

export const FAQSection: React.FC<SectionProps> = ({
  section,
  isEditable = true,
  onUpdateText,
}) => {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({ 0: true, 1: true });

  const toggleItem = (index: number) => {
    setOpenItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b-2 border-black bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 space-y-3">
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

        <div className="space-y-3">
          {(section.items || []).map((item, idx) => {
            const isOpen = !!openItems[idx];

            return (
              <div 
                key={item.id || idx} 
                className="border-2 border-black bg-white p-4 sm:p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <div 
                  className="flex items-center justify-between cursor-pointer select-none gap-4"
                  onClick={() => toggleItem(idx)}
                >
                  <h3
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onClick={(e) => isEditable && e.stopPropagation()}
                    onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'question')}
                    className="text-sm sm:text-base font-bold uppercase tracking-tight text-black outline-none focus:ring-1 focus:ring-black"
                  >
                    {item.question || item.title}
                  </h3>
                  <div className="w-6 h-6 border border-black bg-white flex items-center justify-center shrink-0 text-black">
                    {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </div>

                {isOpen && (
                  <p
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'answer')}
                    className="mt-3 pt-3 border-t border-black text-xs sm:text-sm text-neutral-700 font-mono leading-relaxed outline-none focus:ring-1 focus:ring-black"
                  >
                    {item.answer || item.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
