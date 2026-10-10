'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Monitor, Tablet, Smartphone, Undo2, Redo2, 
  Sparkles, CheckCircle2, ShieldCheck, Download, Eye, Save, 
  Edit3, CheckSquare
} from 'lucide-react';
import { Button, Badge, Chip, Input } from '@/components/ui';

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
    <header className="h-16 border-b border-md-outline-variant/50 bg-md-surface/95 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0 select-none m3-transition">
      {/* Left: Back Link & Inline Project Name */}
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 rounded-md-full hover:bg-md-surface-container text-md-on-surface-variant m3-transition" title="Return to Dashboard">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex items-center gap-2">
          {isEditingName ? (
            <Input
              type="text"
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
              autoFocus
              className="py-1 px-3 text-sm font-semibold"
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="font-bold text-sm text-md-on-surface hover:bg-md-surface-container px-3 py-1.5 rounded-md-sm flex items-center gap-1.5 m3-transition"
              title="Click to rename project"
            >
              <span>{projectName}</span>
              <Edit3 className="w-3.5 h-3.5 text-md-on-surface-variant" />
            </button>
          )}
        </div>

        {/* Page Switcher */}
        <div className="flex items-center gap-1.5 bg-md-surface-container px-3 py-1.5 rounded-md-sm border border-md-outline-variant/40">
          <span className="text-xs text-md-on-surface-variant font-medium">Page:</span>
          <select
            value={activePageSlug}
            onChange={(e) => onSelectPage(e.target.value)}
            className="bg-transparent font-semibold text-xs text-md-on-surface outline-none cursor-pointer"
          >
            {pages.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title} ({p.slug})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Middle: Viewport Switcher & Undo/Redo */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center bg-md-surface-container p-1 rounded-md-sm border border-md-outline-variant/40">
          <button
            onClick={() => onChangeViewport('desktop')}
            className={`p-1.5 rounded-md-xs text-xs ${viewport === 'desktop' ? 'bg-md-surface text-md-primary shadow-xs font-semibold' : 'text-md-on-surface-variant'}`}
            title="Desktop View"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => onChangeViewport('tablet')}
            className={`p-1.5 rounded-md-xs text-xs ${viewport === 'tablet' ? 'bg-md-surface text-md-primary shadow-xs font-semibold' : 'text-md-on-surface-variant'}`}
            title="Tablet View"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => onChangeViewport('mobile')}
            className={`p-1.5 rounded-md-xs text-xs ${viewport === 'mobile' ? 'bg-md-surface text-md-primary shadow-xs font-semibold' : 'text-md-on-surface-variant'}`}
            title="Mobile View"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 border-l border-md-outline-variant/40 pl-4">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-md-xs hover:bg-md-surface-container text-md-on-surface-variant disabled:opacity-30 disabled:cursor-not-allowed m3-transition"
            title="Undo Change (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-md-xs hover:bg-md-surface-container text-md-on-surface-variant disabled:opacity-30 disabled:cursor-not-allowed m3-transition"
            title="Redo Change (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Save Status Indicator */}
        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${saveStatus === 'Saved' ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
          <span className="text-md-on-surface-variant font-medium">{saveStatus}</span>
        </div>
      </div>

      {/* Right: Actions (AI Toggle, Verify, Export, Preview) */}
      <div className="flex items-center gap-2">
        <Button
          variant={aiPanelOpen ? 'filled' : 'tonal'}
          size="sm"
          onClick={onToggleAIPanel}
          title="Toggle AI Section Assistant"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Copilot</span>
        </Button>

        <Button variant="ghost" size="sm" onClick={onRunVerify} title="Run Playwright Verification Audit">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verify</span>
        </Button>

        <Button variant="outlined" size="sm" onClick={onTogglePreviewMode}>
          <Eye className="w-3.5 h-3.5" />
          <span>{previewMode ? 'Exit Preview' : 'Preview'}</span>
        </Button>

        <Button variant="filled" size="sm" onClick={onOpenExportModal} className="font-semibold shadow-md-1">
          <Download className="w-3.5 h-3.5" />
          <span>Export ZIP</span>
        </Button>
      </div>
    </header>
  );
}
