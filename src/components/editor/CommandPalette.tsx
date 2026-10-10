'use client';

import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Layers, FileText, Monitor, Tablet, Smartphone, Command } from 'lucide-react';
import { SectionSpec } from '@/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  sections: SectionSpec[];
  onSelectSection: (id: string) => void;
  pages: { slug: string; title: string }[];
  onSelectPage: (slug: string) => void;
  onChangeViewport: (v: 'desktop' | 'tablet' | 'mobile') => void;
  onToggleAIPanel: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  sections,
  onSelectSection,
  pages,
  onSelectPage,
  onChangeViewport,
  onToggleAIPanel,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs font-mono text-xs">
      <div className="bg-white border-2 border-black max-w-xl w-full p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
        {/* Search Bar */}
        <div className="flex items-center border-b-2 border-black pb-3 px-2">
          <Search className="w-4 h-4 text-neutral-500 mr-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search sections/pages... (Esc to exit)"
            autoFocus
            className="w-full text-xs font-mono outline-none bg-transparent"
          />
          <kbd className="px-2 py-0.5 border border-black bg-neutral-100 text-[10px] font-bold">ESC</kbd>
        </div>

        {/* Action Commands List */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {/* Quick Actions */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase text-neutral-400">QUICK ACTIONS</div>
            <button
              onClick={() => {
                onToggleAIPanel();
                onClose();
              }}
              className="w-full p-2 border border-black hover:bg-black hover:text-white flex items-center justify-between text-left"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Open AI Editing Desk</span>
              </span>
              <span className="text-[10px] uppercase font-bold">Command</span>
            </button>
          </div>

          {/* Jump to Sections */}
          <div className="space-y-1 pt-2 border-t border-neutral-200">
            <div className="text-[10px] font-bold uppercase text-neutral-400">SECTIONS ON PAGE</div>
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => {
                  onSelectSection(sec.id);
                  onClose();
                }}
                className="w-full p-2 border border-black hover:bg-neutral-100 flex items-center justify-between text-left"
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-black" />
                  <span>{sec.title || sec.type} [{sec.id}]</span>
                </span>
                <span className="text-[10px] uppercase text-neutral-500">{sec.type}</span>
              </button>
            ))}
          </div>

          {/* Switch Pages */}
          <div className="space-y-1 pt-2 border-t border-neutral-200">
            <div className="text-[10px] font-bold uppercase text-neutral-400">PAGES</div>
            {pages.map((p) => (
              <button
                key={p.slug}
                onClick={() => {
                  onSelectPage(p.slug);
                  onClose();
                }}
                className="w-full p-2 border border-black hover:bg-neutral-100 flex items-center justify-between text-left"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>{p.title} ({p.slug})</span>
                </span>
                <span className="text-[10px] uppercase text-neutral-500">Switch Page</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
