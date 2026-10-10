'use client';

import React from 'react';
import { Section } from '@/types';
import { Check } from 'lucide-react';

interface SectionProps {
  section: Section;
  isEditable?: boolean;
  onUpdateText?: (field: string, value: string, index?: number, subfield?: string) => void;
  onNavigatePage?: (target: string) => void;
}

export const PricingSection: React.FC<SectionProps> = ({
  section,
  isEditable = true,
  onUpdateText,
  onNavigatePage,
}) => {
  return (
    <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b-2 border-black bg-white relative">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-6xl mx-auto">
          {(section.items || []).map((item, idx) => {
            const isFeatured = item.badge?.toLowerCase().includes('popular') || item.badge?.toLowerCase().includes('value') || idx === 1;
            
            return (
              <div
                key={item.id || idx}
                className={`border-2 border-black p-6 sm:p-8 flex flex-col justify-between transition-all relative ${
                  isFeatured 
                    ? 'bg-black text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' 
                    : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white text-black border-2 border-black text-[10px] font-mono font-bold px-3 py-0.5 uppercase tracking-wider">
                    Recommended
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      contentEditable={isEditable}
                      suppressContentEditableWarning
                      onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'title')}
                      className="text-lg font-bold uppercase tracking-tight outline-none"
                    >
                      {item.title}
                    </span>
                    {item.badge && (
                      <span
                        contentEditable={isEditable}
                        suppressContentEditableWarning
                        onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'badge')}
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 border uppercase outline-none ${
                          isFeatured ? 'border-white text-white' : 'border-black text-black'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div className="mb-4 flex items-baseline gap-1">
                    <span
                      contentEditable={isEditable}
                      suppressContentEditableWarning
                      onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'price')}
                      className="text-4xl sm:text-5xl font-black tracking-tight outline-none"
                    >
                      {item.price}
                    </span>
                    <span
                      contentEditable={isEditable}
                      suppressContentEditableWarning
                      onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'period')}
                      className={`text-xs font-mono outline-none ${isFeatured ? 'text-neutral-300' : 'text-neutral-600'}`}
                    >
                      {item.period}
                    </span>
                  </div>

                  {item.description && (
                    <p
                      contentEditable={isEditable}
                      suppressContentEditableWarning
                      onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'description')}
                      className={`text-xs font-mono mb-6 leading-relaxed outline-none ${isFeatured ? 'text-neutral-300' : 'text-neutral-700'}`}
                    >
                      {item.description}
                    </p>
                  )}

                  <div className={`border-t pt-4 space-y-2 mb-6 ${isFeatured ? 'border-neutral-700' : 'border-neutral-200'}`}>
                    {(item.features || ['Core system capabilities', 'Full team access', 'Priority support']).map((f, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs font-mono">
                        <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onNavigatePage?.(idx === 2 ? '/contact' : '/dashboard')}
                  className={`w-full py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-wider transition-colors border border-black cursor-pointer ${
                    isFeatured
                      ? 'bg-white text-black hover:bg-neutral-100'
                      : 'bg-black text-white hover:bg-neutral-800'
                  }`}
                >
                  Choose {item.title || 'Plan'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
