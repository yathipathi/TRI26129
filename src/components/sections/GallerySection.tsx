'use client';

import React, { useState } from 'react';
import { Section } from '@/types';
import { ArrowRight } from 'lucide-react';

interface SectionProps {
  section: Section;
  isEditable?: boolean;
  onUpdateText?: (field: string, value: string, index?: number, subfield?: string) => void;
}

export const GallerySection: React.FC<SectionProps> = ({
  section,
  isEditable = true,
  onUpdateText,
}) => {
  const [activeCategory, setActiveCategory] = useState('ALL');

  const items = section.items || [
    { id: '1', title: 'Spatial Compute Interface', category: 'ARCHITECTURAL', description: 'Next-generation mixed reality workspace OS.', badge: 'CASE STUDY' },
    { id: '2', title: 'Autonomous Fleet Telemetry', category: 'HARDWARE', description: 'Sub-second sensor streaming for robotics.', badge: 'SYSTEMS' },
    { id: '3', title: 'Vanguard Brand Identity', category: 'IDENTITY', description: 'Complete design system and typography manual.', badge: 'BRANDING' },
    { id: '4', title: 'Zero-Proof Neural Network', category: 'ALGORITHMS', description: 'Cryptographic proof generation for enterprise ledger.', badge: 'RESEARCH' },
    { id: '5', title: 'Monochrome Design Language', category: 'ARCHITECTURAL', description: 'High-contrast minimalist design framework.', badge: 'UI/UX' },
    { id: '6', title: 'Edge Micro-Kernels', category: 'SYSTEMS', description: 'Bare-metal virtualization runtime engine.', badge: 'INFRA' },
  ];

  const categories = ['ALL', 'ARCHITECTURAL', 'SYSTEMS', 'IDENTITY', 'ALGORITHMS'];

  const filteredItems = activeCategory === 'ALL' 
    ? items 
    : items.filter(i => i.category === activeCategory);

  return (
    <section id="portfolio" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b-2 border-black bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
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
              {section.title || 'Selected Projects & Works'}
            </h2>
            {section.subtitle && (
              <p
                contentEditable={isEditable}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateText?.('subtitle', e.currentTarget.textContent || '')}
                className="text-xs sm:text-sm text-neutral-700 font-mono max-w-xl outline-none focus:ring-1 focus:ring-black"
              >
                {section.subtitle}
              </p>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider border-2 border-black transition-all ${
                  activeCategory === cat 
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id || idx}
              className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between group"
            >
              <div>
                <div className="w-full h-40 border-2 border-black bg-neutral-50 mb-5 flex flex-col items-center justify-center p-4">
                  <span className="font-mono text-xs font-bold uppercase text-black">
                    [PROJ_0{idx + 1}]
                  </span>
                  <div className="w-12 h-0.5 bg-black my-2" />
                  <span className="text-[10px] font-mono font-bold tracking-wide uppercase text-neutral-600">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 border border-black uppercase text-black bg-white">
                    {item.badge || 'PROJECT'}
                  </span>
                </div>

                <h3
                  contentEditable={isEditable}
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'title')}
                  className="text-lg font-bold uppercase tracking-tight text-black mb-2 outline-none focus:ring-1 focus:ring-black"
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

              <div className="border-t border-black pt-4 mt-6 flex items-center justify-between text-xs font-mono font-bold uppercase text-black">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
