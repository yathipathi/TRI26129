'use client';

import React from 'react';
import { Section } from '@/types';

interface SectionProps {
  section: Section;
  isEditable?: boolean;
  onUpdateText?: (field: string, value: string, index?: number, subfield?: string) => void;
}

export const StatsSection: React.FC<SectionProps> = ({
  section,
  isEditable = true,
  onUpdateText,
}) => {
  return (
    <section className="py-14 sm:py-18 px-4 sm:px-6 lg:px-8 border-b-2 border-black bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(section.items || []).map((item, idx) => (
            <div 
              key={item.id || idx} 
              className="p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left"
            >
              <div
                contentEditable={isEditable}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'stat')}
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-black outline-none focus:ring-1 focus:ring-black"
              >
                {item.stat}
              </div>
              <div
                contentEditable={isEditable}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'label')}
                className="text-xs font-mono font-bold uppercase tracking-wider text-black mt-2 outline-none focus:ring-1 focus:ring-black"
              >
                {item.label}
              </div>
              {item.description && (
                <div
                  contentEditable={isEditable}
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'description')}
                  className="text-xs font-mono text-neutral-600 mt-1 outline-none focus:ring-1 focus:ring-black"
                >
                  {item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
