'use client';

import React from 'react';
import { Section } from '@/types';
import { 
  Zap, Shield, Cpu, Layers, RefreshCw, Lock, 
  Terminal, Globe, Database, Sparkles, BarChart3, Code2, Activity 
} from 'lucide-react';

interface SectionProps {
  section: Section;
  isEditable?: boolean;
  onUpdateText?: (field: string, value: string, index?: number, subfield?: string) => void;
}

const iconMap: Record<string, React.ElementType> = {
  Zap, Shield, Cpu, Layers, RefreshCw, Lock,
  Terminal, Globe, Database, Sparkles, BarChart3, Code2, Activity
};

export const FeaturesSection: React.FC<SectionProps> = ({
  section,
  isEditable = true,
  onUpdateText,
}) => {
  return (
    <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b-2 border-black bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
              className="text-xs sm:text-sm text-neutral-700 font-mono max-w-2xl mx-auto outline-none focus:ring-1 focus:ring-black px-1"
            >
              {section.subtitle}
            </p>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(section.items || []).map((item, idx) => {
            const IconComponent = (item.icon && iconMap[item.icon]) ? iconMap[item.icon] : Cpu;
            
            return (
              <div
                key={item.id || idx}
                className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 border border-black bg-black text-white flex items-center justify-center">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    {item.badge && (
                      <span
                        contentEditable={isEditable}
                        suppressContentEditableWarning
                        onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'badge')}
                        className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 border border-black bg-white text-black outline-none"
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <h3
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'title')}
                    className="text-base font-bold uppercase tracking-tight text-black mb-2 outline-none focus:ring-1 focus:ring-black"
                  >
                    {item.title}
                  </h3>

                  <p
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'description')}
                    className="text-xs font-mono text-neutral-700 leading-relaxed outline-none focus:ring-1 focus:ring-black"
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
