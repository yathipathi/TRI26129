'use client';

import React, { useEffect, useState } from 'react';
import { Search, Sparkles, Plus, Eye, Edit3, Layers, HelpCircle, X } from 'lucide-react';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (action: string, payload?: any) => void;
  sections?: { id: string; title: string; type: string }[];
  pages?: { name?: string; title?: string; slug: string }[];
  onSelectSection?: (id: string) => void;
  onSelectPage?: (slug: string) => void;
  onChangeViewport?: (v: 'desktop' | 'tablet' | 'mobile') => void;
  onToggleAIPanel?: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onSelectAction,
  sections = [],
  pages = [],
  onSelectSection,
  onSelectPage,
  onChangeViewport,
  onToggleAIPanel,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onSelectAction?.('open_palette');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onSelectAction]);

  if (!isOpen) return null;

  const actions = [
    { id: 'mode_edit', label: 'Switch to Edit Mode', icon: <Edit3 className="w-4 h-4 text-primary" /> },
    { id: 'mode_interact', label: 'Switch to Interact Mode', icon: <Eye className="w-4 h-4 text-emerald-500" /> },
    { id: 'add_section', label: 'Add New Section from Library', icon: <Plus className="w-4 h-4 text-purple-500" /> },
    { id: 'ai_edit', label: 'Run AI Quick Edit', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
    { id: 'save_version', label: 'Save Version Checkpoint', icon: <Layers className="w-4 h-4 text-blue-500" /> },
    { id: 'shortcuts', label: 'Open Keyboard Shortcuts (?)', icon: <HelpCircle className="w-4 h-4 text-muted-foreground" /> },
  ];

  const filteredActions = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));
  const filteredSections = sections.filter((s) => (s.title || s.id).toLowerCase().includes(query.toLowerCase()));
  const filteredPages = pages.filter((p) => ((p.name || p.title) || '').toLowerCase().includes(query.toLowerCase()));

  const handleActionClick = (id: string) => {
    if (id === 'ai_edit') onToggleAIPanel?.();
    if (onSelectAction) onSelectAction(id);
    onClose();
  };

  const handleSectionClick = (id: string) => {
    if (onSelectSection) onSelectSection(id);
    else if (onSelectAction) onSelectAction('jump_section', id);
    onClose();
  };

  const handlePageClick = (slug: string) => {
    if (onSelectPage) onSelectPage(slug);
    else if (onSelectAction) onSelectAction('jump_page', slug);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-surface surface-container-high border border-outline/20 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-outline/10">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Type a command, section name, or search pages (Ctrl + K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-3.5 bg-transparent text-sm text-foreground focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {/* Quick Actions */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono uppercase text-muted-foreground font-bold">Quick Commands</span>
            {filteredActions.map((act) => (
              <button
                key={act.id}
                onClick={() => handleActionClick(act.id)}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-variant/50 text-xs font-medium text-foreground flex items-center gap-2.5 transition"
              >
                {act.icon}
                <span>{act.label}</span>
              </button>
            ))}
          </div>

          {/* Jump to Section */}
          {filteredSections.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-outline/10">
              <span className="px-3 text-[10px] font-mono uppercase text-muted-foreground font-bold">Jump to Section</span>
              {filteredSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => handleSectionClick(sec.id)}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-primary/10 text-xs font-medium text-foreground flex items-center justify-between transition"
                >
                  <span className="font-semibold">{sec.title || sec.id}</span>
                  <span className="font-mono text-[11px] text-muted-foreground uppercase">{sec.type}</span>
                </button>
              ))}
            </div>
          )}

          {/* Jump to Page */}
          {filteredPages.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-outline/10">
              <span className="px-3 text-[10px] font-mono uppercase text-muted-foreground font-bold">Jump to Page</span>
              {filteredPages.map((pg) => (
                <button
                  key={pg.slug}
                  onClick={() => handlePageClick(pg.slug)}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-primary/10 text-xs font-medium text-foreground flex items-center justify-between transition"
                >
                  <span className="font-semibold">{pg.name || pg.title}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{pg.slug}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
