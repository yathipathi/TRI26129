'use client';

import React, { useState } from 'react';
import { Section } from '@/types';
import { Menu, X } from 'lucide-react';

interface SectionProps {
  section: Section;
  isEditable?: boolean;
  onUpdateText?: (field: string, value: string, index?: number, subfield?: string) => void;
  onNavigatePage?: (target: string) => void;
}

export const NavbarSection: React.FC<SectionProps> = ({
  section,
  isEditable = true,
  onUpdateText,
  onNavigatePage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (target: string) => {
    if (!target) return;
    onNavigatePage?.(target);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-black transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => handleLinkClick('/')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-8 h-8 border border-black bg-black text-white flex items-center justify-center font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {section.title?.charAt(0) || 'A'}
          </div>
          <div
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateText?.('title', e.currentTarget.textContent || '')}
            className="text-base sm:text-lg font-black uppercase tracking-tight text-black outline-none focus:ring-1 focus:ring-black px-1"
          >
            {section.title}
          </div>
          {section.badge && (
            <span
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateText?.('badge', e.currentTarget.textContent || '')}
              className="hidden sm:inline-flex text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 border border-black bg-white text-black outline-none"
            >
              {section.badge}
            </span>
          )}
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-bold uppercase tracking-wider text-black">
          {(section.items || []).map((item, idx) => (
            <span
              key={item.id || idx}
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'title')}
              onClick={() => handleLinkClick(item.description || item.title || '')}
              title={`Jump to ${item.title}`}
              className="hover:underline cursor-pointer outline-none focus:ring-1 focus:ring-black px-1 transition-all"
            >
              {item.title}
            </span>
          ))}
        </nav>

        {/* Action CTAs & Mobile Toggle */}
        <div className="flex items-center gap-2.5">
          {section.ctaSecondary && (
            <button
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateText?.('ctaSecondary.text', e.currentTarget.textContent || '')}
              onClick={() => handleLinkClick(section.ctaSecondary?.link || '/contact')}
              className="hidden sm:inline-flex px-4 py-2 text-xs font-mono font-bold uppercase border border-black text-black hover:bg-neutral-100 transition-colors outline-none cursor-pointer"
            >
              {section.ctaSecondary.text}
            </button>
          )}
          {section.ctaPrimary && (
            <button
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateText?.('ctaPrimary.text', e.currentTarget.textContent || '')}
              onClick={() => handleLinkClick(section.ctaPrimary?.link || '/pricing')}
              className="px-4 py-2 text-xs font-mono font-bold uppercase bg-black text-white hover:bg-neutral-800 border border-black transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none cursor-pointer"
            >
              {section.ctaPrimary.text}
            </button>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 border border-black hover:bg-neutral-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-black bg-white px-4 py-4 space-y-2">
          {(section.items || []).map((item, idx) => (
            <div
              key={item.id || idx}
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateText?.('items', e.currentTarget.textContent || '', idx, 'title')}
              onClick={() => {
                setMobileMenuOpen(false);
                handleLinkClick(item.description || item.title || '');
              }}
              className="py-1 text-xs font-mono font-bold uppercase text-black hover:bg-neutral-50 px-2 outline-none cursor-pointer"
            >
              {item.title}
            </div>
          ))}
        </div>
      )}
    </header>
  );
};
