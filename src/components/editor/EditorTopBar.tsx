'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Monitor, Tablet, Smartphone, Undo2, Redo2, 
  Sparkles, CheckCircle2, ShieldCheck, Download, Eye, Save, 
  Edit3, CheckSquare
} from 'lucide-react';

interface EditorTopBarProps {
  projectName: string;
  onRenameProject: (newName: string) => void;
  pages: { slug: string; title: string }[];
  activePageSlug: string;
  onSelectPage: (slug: string) => void;
  viewport: 'desktop' | 'tablet' | 'mobile';
  onChangeViewport: (v: 'desktop' | 'tablet' | 'mobile') => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  saveStatus: 'Saved' | 'Saving...' | 'Offline - retrying';
  previewMode: boolean;
  onTogglePreviewMode: () => void;
  onRunVerify: () => void;
  onOpenExportModal: () => void;
  aiPanelOpen: boolean;
  onToggleAIPanel: () => void;
}

export default function EditorTopBar({
  projectName,
  onRenameProject,
  pages,
  activePageSlug,
  onSelectPage,
  viewport,
  onChangeViewport,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  saveStatus,
  previewMode,
  onTogglePreviewMode,
  onRunVerify,
  onOpenExportModal,
  aiPanelOpen,
  onToggleAIPanel,
}: EditorTopBarProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(projectName);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (nameVal.trim() && nameVal.trim() !== projectName) {
      onRenameProject(nameVal.trim());
    }
  };

  return (
    <header className="h-16 border-b-2 border-black bg-white px-6 flex items-center justify-between z-30 shrink-0 font-mono text-xs select-none">
      {/* Left: Back Link & Inline Project Name */}
      <div className="flex items-center gap-4">
        <Link href="/" className="p-1.5 border border-black hover:bg-black hover:text-white transition-colors" title="Return to Dashboard">
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="flex items-center gap-2">
          {isEditingName ? (
            <input
              type="text"
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
              autoFocus
              className="px-2 py-1 border-2 border-black font-bold uppercase text-xs bg-white text-black outline-none"
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="font-black text-sm uppercase tracking-tight text-black hover:bg-neutral-100 px-2 py-1 border border-transparent hover:border-black flex items-center gap-1.5"
              title="Click to rename project"
            >
              <span>{projectName}</span>
              <Edit3 className="w-3 h-3 text-neutral-500" />
            </button>
          )}
        </div>

        {/* Page Switcher Dropdown */}
        <div className="flex items-center gap-1 border border-black px-2 py-1 bg-neutral-50">
          <span className="text-[10px] text-neutral-500 uppercase font-bold">Page:</span>
          <select
            value={activePageSlug}
            onChange={(e) => onSelectPage(e.target.value)}
            className="bg-transparent font-bold uppercase text-xs outline-none cursor-pointer"
          >
            {pages.map((p) => (
              <option key={p.slug} value={p.slug}>{p.title} ({p.slug})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Device Viewport Modes & Undo / Redo */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Device Modes */}
        <div className="flex border-2 border-black p-0.5 bg-neutral-100">
          <button
            onClick={() => onChangeViewport('desktop')}
            className={`px-3 py-1 text-xs font-bold uppercase transition-all ${viewport === 'desktop' ? 'bg-black text-white' : 'text-black'}`}
          >
            <Monitor className="w-3.5 h-3.5 inline mr-1" /> Desktop
          </button>
          <button
            onClick={() => onChangeViewport('tablet')}
            className={`px-3 py-1 text-xs font-bold uppercase transition-all ${viewport === 'tablet' ? 'bg-black text-white' : 'text-black'}`}
          >
            <Tablet className="w-3.5 h-3.5 inline mr-1" /> Tablet
          </button>
          <button
            onClick={() => onChangeViewport('mobile')}
            className={`px-3 py-1 text-xs font-bold uppercase transition-all ${viewport === 'mobile' ? 'bg-black text-white' : 'text-black'}`}
          >
            <Smartphone className="w-3.5 h-3.5 inline mr-1" /> Mobile
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center border border-black bg-white">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 border-r border-black ${canUndo ? 'hover:bg-black hover:text-white text-black' : 'text-neutral-300 cursor-not-allowed'}`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 ${canRedo ? 'hover:bg-black hover:text-white text-black' : 'text-neutral-300 cursor-not-allowed'}`}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Save Status Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-neutral-600">
          <Save className="w-3.5 h-3.5 text-emerald-600" />
          <span>{saveStatus}</span>
        </div>
      </div>

      {/* Right: Actions (Preview Mode, Verify, Export, AI Panel) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePreviewMode}
          className={`px-3 py-1.5 border-2 border-black font-bold uppercase text-xs flex items-center gap-1.5 transition-all ${
            previewMode ? 'bg-orange-500 text-black border-black' : 'bg-white text-black hover:bg-neutral-100'
          }`}
          title="Toggle Preview Mode (hides editor controls)"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{previewMode ? 'Exit Preview' : 'Preview'}</span>
        </button>

        <button
          onClick={onRunVerify}
          className="hidden sm:flex px-3 py-1.5 border border-black bg-white text-black font-bold uppercase text-xs hover:bg-neutral-100 items-center gap-1.5"
          title="Re-run Playwright Verification Crawler"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verify</span>
        </button>

        <button
          onClick={onOpenExportModal}
          className="px-3.5 py-1.5 border-2 border-black bg-black text-white hover:bg-neutral-800 font-bold uppercase text-xs flex items-center gap-1.5 shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        <button
          onClick={onToggleAIPanel}
          className={`px-3.5 py-1.5 border-2 border-black font-bold uppercase text-xs flex items-center gap-1.5 transition-all ${
            aiPanelOpen ? 'bg-orange-500 text-black' : 'bg-neutral-100 text-black hover:bg-black hover:text-white'
          }`}
          title="Toggle AI Editing Desk"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          <span>AI Assistant</span>
        </button>
      </div>
    </header>
  );
}
