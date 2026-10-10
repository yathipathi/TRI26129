'use client';

import React, { useState } from 'react';
import { 
  Layers, Plus, Lock, Unlock, Eye, EyeOff, Copy, Trash2, 
  GripVertical, Search, Sparkles, FileText, ArrowUp, ArrowDown, 
  ChevronRight, Settings
} from 'lucide-react';
import { SectionSpec, PageSpec, SectionType } from '@/types';
import { SECTION_REGISTRY, SectionTemplateRegistryItem } from '@/lib/section-registry';

interface EditorLeftPaneProps {
  sections: SectionSpec[];
  selectedSectionId?: string;
  onSelectSection: (id: string) => void;
  onReorderSections: (newSections: SectionSpec[]) => void;
  onToggleLock: (id: string) => void;
  onToggleHide: (id: string) => void;
  onDuplicateSection: (id: string) => void;
  onDeleteSection: (id: string) => void;
  onAddSectionFromRegistry: (type: SectionType, variantId?: string) => void;
  onAddSectionWithAI: (description: string) => void;
  pages: PageSpec[];
  activePageSlug: string;
  onSelectPage: (slug: string) => void;
  onAddPage: (title: string, slug: string) => void;
  onDeletePage: (slug: string) => void;
}

export default function EditorLeftPane({
  sections,
  selectedSectionId,
  onSelectSection,
  onReorderSections,
  onToggleLock,
  onToggleHide,
  onDuplicateSection,
  onDeleteSection,
  onAddSectionFromRegistry,
  onAddSectionWithAI,
  pages,
  activePageSlug,
  onSelectPage,
  onAddPage,
  onDeletePage,
}: EditorLeftPaneProps) {
  const [activeTab, setActiveTab] = useState<'outline' | 'add' | 'pages'>('outline');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSectionPrompt, setAiSectionPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // New Page State
  const [newPageTitle, setNewPageTitle] = useState('');

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sections.length) return;

    const updated = [...sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);
    onReorderSections(updated);
  };

  const filteredRegistry = SECTION_REGISTRY.filter(
    (r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAiSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiSectionPrompt.trim() || isAiGenerating) return;

    setIsAiGenerating(true);
    try {
      await onAddSectionWithAI(aiSectionPrompt.trim());
      setAiSectionPrompt('');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleAddPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;
    const slug = `${newPageTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
    onAddPage(newPageTitle.trim(), slug);
    setNewPageTitle('');
  };

  return (
    <div className="w-full md:w-80 bg-white border-r-2 border-black flex flex-col h-full overflow-hidden shrink-0 font-mono text-xs select-none">
      {/* Tab Switcher Bar */}
      <div className="flex border-b-2 border-black bg-neutral-100 font-bold uppercase">
        <button
          onClick={() => setActiveTab('outline')}
          className={`flex-1 py-3 border-r-2 border-black text-center transition-all ${
            activeTab === 'outline' ? 'bg-white text-black' : 'text-neutral-600 hover:text-black'
          }`}
        >
          <Layers className="w-3.5 h-3.5 inline mr-1 text-orange-500" />
          <span>Outline</span>
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`flex-1 py-3 border-r-2 border-black text-center transition-all ${
            activeTab === 'add' ? 'bg-white text-black' : 'text-neutral-600 hover:text-black'
          }`}
        >
          <Plus className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
          <span>Add</span>
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={`flex-1 py-3 text-center transition-all ${
            activeTab === 'pages' ? 'bg-white text-black' : 'text-neutral-600 hover:text-black'
          }`}
        >
          <FileText className="w-3.5 h-3.5 inline mr-1 text-blue-600" />
          <span>Pages</span>
        </button>
      </div>

      {/* TAB 1: OUTLINE */}
      {activeTab === 'outline' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-[10px] font-bold uppercase text-neutral-500 flex justify-between items-center">
            <span>SECTIONS ON PAGE ({sections.length})</span>
            <span>REORDER & LOCK</span>
          </div>

          <div className="space-y-2">
            {sections.map((sec, idx) => {
              const isSelected = sec.id === selectedSectionId;

              return (
                <div
                  key={sec.id}
                  onClick={() => onSelectSection(sec.id)}
                  className={`p-3 border-2 border-black flex items-center justify-between gap-2 cursor-pointer transition-all ${
                    isSelected ? 'bg-orange-50 border-orange-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-neutral-50'
                  } ${sec.isHidden ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="font-bold text-neutral-400 text-[10px]">0{idx + 1}</span>
                    <div className="truncate font-bold text-black uppercase">
                      {sec.title || sec.type}
                    </div>
                  </div>

                  {/* Quick Controls */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => moveSection(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 hover:bg-neutral-200 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveSection(idx, 'down')}
                      disabled={idx === sections.length - 1}
                      className="p-1 hover:bg-neutral-200 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => onToggleLock(sec.id)}
                      className="p-1 hover:bg-neutral-200 text-neutral-700"
                      title={sec.isLocked ? 'Unlock section' : 'Lock section'}
                    >
                      {sec.isLocked ? <Lock className="w-3 h-3 text-red-600" /> : <Unlock className="w-3 h-3 text-neutral-400" />}
                    </button>

                    <button
                      onClick={() => onToggleHide(sec.id)}
                      className="p-1 hover:bg-neutral-200 text-neutral-700"
                      title={sec.isHidden ? 'Unhide section' : 'Hide section'}
                    >
                      {sec.isHidden ? <EyeOff className="w-3 h-3 text-amber-600" /> : <Eye className="w-3 h-3 text-neutral-400" />}
                    </button>

                    <button
                      onClick={() => onDuplicateSection(sec.id)}
                      className="p-1 hover:bg-neutral-200 text-neutral-700"
                      title="Duplicate section"
                    >
                      <Copy className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => onDeleteSection(sec.id)}
                      className="p-1 hover:bg-red-600 hover:text-white text-red-600"
                      title="Delete section"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {sections.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-black bg-neutral-50 space-y-2">
                <p className="text-xs text-neutral-500">No sections on this page.</p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="px-3 py-1.5 bg-black text-white font-bold text-xs uppercase"
                >
                  Add Your First Section
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ADD SECTION LIBRARY */}
      {activeTab === 'add' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Describe Section with AI */}
          <form onSubmit={handleAiSectionSubmit} className="p-3 border-2 border-black bg-orange-50 space-y-2">
            <div className="font-bold uppercase text-xs flex items-center gap-1.5 text-orange-900">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Describe a Section with AI</span>
            </div>
            <textarea
              rows={2}
              value={aiSectionPrompt}
              onChange={(e) => setAiSectionPrompt(e.target.value)}
              placeholder='e.g. "a 3-tier pricing plan with annual discounts for a yoga clinic"'
              className="w-full p-2 border border-black text-xs font-mono outline-none bg-white"
            />
            <button
              type="submit"
              disabled={isAiGenerating || !aiSectionPrompt.trim()}
              className="w-full py-2 bg-black text-white font-bold text-xs uppercase hover:bg-neutral-800 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-orange-500" />
              <span>{isAiGenerating ? 'Generating Section...' : 'Generate & Insert'}</span>
            </button>
          </form>

          {/* Search Library */}
          <div className="flex items-center border border-black bg-white px-2.5 py-1.5">
            <Search className="w-3.5 h-3.5 text-neutral-500 mr-1.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components by category..."
              className="w-full text-xs font-mono outline-none bg-transparent"
            />
          </div>

          {/* Categorized Library Grid */}
          <div className="space-y-4">
            {filteredRegistry.map((item) => (
              <div key={item.type} className="border-2 border-black p-3 bg-white space-y-2">
                <div className="flex justify-between items-center border-b border-black pb-1.5">
                  <div className="font-bold uppercase text-black">{item.name}</div>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-neutral-100 border border-black">
                    {item.category.split('&')[0]}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 leading-tight">{item.description}</p>

                {/* Style Variants Selection */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => onAddSectionFromRegistry(item.type)}
                    className="w-full py-2 bg-black text-white font-bold text-xs uppercase hover:bg-neutral-800 flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Insert {item.name}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PAGES MANAGER */}
      {activeTab === 'pages' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-[10px] font-bold uppercase text-neutral-500">PROJECT PAGES</div>

          <div className="space-y-2">
            {pages.map((p) => (
              <div
                key={p.slug}
                onClick={() => onSelectPage(p.slug)}
                className={`p-3 border-2 border-black flex items-center justify-between cursor-pointer ${
                  p.slug === activePageSlug ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                <div>
                  <div className="font-bold uppercase text-xs">{p.title}</div>
                  <div className="text-[10px] opacity-70 font-mono">{p.slug}</div>
                </div>

                {pages.length > 1 && p.slug !== 'index.html' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePage(p.slug);
                    }}
                    className="p-1 hover:bg-red-600 hover:text-white transition-colors text-red-500"
                    title="Delete page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Page Form */}
          <form onSubmit={handleAddPageSubmit} className="pt-4 border-t-2 border-black space-y-2">
            <div className="font-bold uppercase text-xs">Add New Page</div>
            <input
              type="text"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              placeholder="Page Name (e.g. Portfolio)"
              className="w-full p-2 border-2 border-black text-xs font-mono outline-none bg-white"
            />
            <button
              type="submit"
              disabled={!newPageTitle.trim()}
              className="w-full py-2 bg-black text-white font-bold text-xs uppercase hover:bg-neutral-800"
            >
              + Create Page
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
