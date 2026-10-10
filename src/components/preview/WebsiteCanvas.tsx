'use client';

import React, { useState } from 'react';
import { WebsiteProject, Section, ViewportMode } from '@/types';
import { DynamicSectionRenderer } from '@/components/sections/DynamicSectionRenderer';
import { 
  Monitor, Tablet, Smartphone, Maximize2, Plus, 
  Edit, Check, Eye, EyeOff, Sparkles, Code, Layers, FileText 
} from 'lucide-react';

interface WebsiteCanvasProps {
  project: WebsiteProject | null;
  onUpdateSectionText: (sectionIndex: number, field: string, value: string, itemIndex?: number, subfield?: string) => void;
  onMoveSection: (fromIndex: number, toIndex: number) => void;
  onDeleteSection: (index: number) => void;
  onDuplicateSection: (index: number) => void;
  onOpenEditModal: (section: Section, index: number) => void;
  onOpenRegenModal: (section: Section, index: number) => void;
  onOpenAddModal: (insertIndex: number) => void;
  onOpenExportModal: () => void;
  onOpenSettingsModal: () => void;
  onSelectPage?: (slug: string) => void;
  onAddNewPage?: () => void;
}

export const WebsiteCanvas: React.FC<WebsiteCanvasProps> = ({
  project,
  onUpdateSectionText,
  onMoveSection,
  onDeleteSection,
  onDuplicateSection,
  onOpenEditModal,
  onOpenRegenModal,
  onOpenAddModal,
  onOpenExportModal,
  onOpenSettingsModal,
  onSelectPage,
  onAddNewPage,
}) => {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [isEditable, setIsEditable] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  if (!project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-neutral-50 text-center">
        <div className="w-16 h-16 border-2 border-black bg-black text-white flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 mb-2">
          Canvas Standing By
        </h2>
        <p className="text-sm text-neutral-500 max-w-md">
          Describe the website you want in the left panel to trigger the autonomous AI layout compiler.
        </p>
      </div>
    );
  }

  const getViewportWidthClass = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[390px] shadow-2xl border-x-4 border-y-8 border-neutral-900 rounded-[32px] my-8 overflow-hidden';
      case 'tablet':
        return 'max-w-[768px] shadow-2xl border-x-4 border-y-8 border-neutral-900 rounded-2xl my-8 overflow-hidden';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  return (
    <div className={`flex flex-col h-full bg-neutral-100 ${fullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Canvas Top Bar */}
      <div className="h-14 border-b border-neutral-200 bg-white px-4 flex items-center justify-between z-20 shrink-0">
        {/* Left: Project title & Edit Mode toggle */}
        <div className="flex items-center gap-3">
          <div className="font-bold text-xs text-black truncate max-w-[200px] uppercase">
            {project.title}
          </div>
          <button
            onClick={() => setIsEditable(!isEditable)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              isEditable 
                ? 'bg-black text-white shadow-xs' 
                : 'bg-neutral-100 text-black hover:bg-neutral-200'
            }`}
          >
            {isEditable ? <Edit className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{isEditable ? 'Edit Mode ON' : 'Preview Mode'}</span>
          </button>
        </div>

        {/* Center: Viewport Mode Switcher */}
        <div className="flex items-center border border-black p-0.5 bg-neutral-100 rounded-xl">
          <button
            title="Desktop View"
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewport === 'desktop' ? 'bg-black text-white shadow-2xs font-semibold' : 'text-neutral-700 hover:text-black'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            title="Tablet View (768px)"
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewport === 'tablet' ? 'bg-black text-white shadow-2xs font-semibold' : 'text-neutral-700 hover:text-black'
            }`}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            title="Mobile View (390px)"
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewport === 'mobile' ? 'bg-black text-white shadow-2xs font-semibold' : 'text-neutral-700 hover:text-black'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAddModal(project.sections.length - 1)}
            className="px-3 py-1 text-xs font-semibold rounded-lg border border-black hover:bg-neutral-100 bg-white text-black flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">Hostinger Templates</span>
          </button>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen Canvas'}
            className="p-1.5 text-black hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Multi-Page Navigation Bar (Lovable-Style Interactive Page Switcher) */}
      {project.pages && project.pages.length > 0 && (
        <div className="h-10 border-b-2 border-black bg-white px-3 sm:px-4 flex items-center justify-between z-20 shrink-0 select-none">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none flex-1">
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600 mr-2 shrink-0">
              <Layers className="w-3.5 h-3.5 text-black" />
              <span>PAGES ({project.pages.length}):</span>
            </div>
            {project.pages.map((p) => {
              const isActive = (project.activePageSlug || '/') === p.slug;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPage?.(p.slug)}
                  title={`Switch view to ${p.name} (${p.slug})`}
                  className={`px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider transition-all border shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black border-neutral-300 hover:border-black hover:bg-neutral-50'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>{p.name}</span>
                  <span className={`text-[9px] ${isActive ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {p.slug}
                  </span>
                </button>
              );
            })}
          </div>

          {onAddNewPage && (
            <button
              onClick={onAddNewPage}
              className="px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider border border-black hover:bg-neutral-100 text-black flex items-center gap-1 shrink-0 ml-2 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span className="hidden sm:inline">Add Page</span>
            </button>
          )}
        </div>
      )}

      {/* Canvas Viewport Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex justify-center p-0 md:p-4 transition-all">
        <div className={`bg-white transition-all duration-200 ${getViewportWidthClass()}`}>
          {(project.sections || []).map((section, index) => (
            <div key={section.id || index} className="relative">
              <DynamicSectionRenderer
                section={section}
                index={index}
                totalSections={project.sections.length}
                isEditable={isEditable}
                onUpdateText={(field, val, i, sub) =>
                  onUpdateSectionText(index, field, val, i, sub)
                }
                onMoveUp={() => onMoveSection(index, index - 1)}
                onMoveDown={() => onMoveSection(index, index + 1)}
                onDelete={() => onDeleteSection(index)}
                onDuplicate={() => onDuplicateSection(index)}
                onOpenEditModal={(sec) => onOpenEditModal(sec, index)}
                onOpenRegenModal={(sec) => onOpenRegenModal(sec, index)}
                onOpenAddModal={(insertIdx) => onOpenAddModal(insertIdx)}
                onNavigatePage={(target) => onSelectPage?.(target)}
              />

              {/* In-between Add Section Hover Line */}
              {isEditable && index < project.sections.length - 1 && (
                <div className="relative h-0 group/divider z-20">
                  <div className="absolute inset-x-0 -top-2 h-4 flex items-center justify-center opacity-0 group-hover/divider:opacity-100 transition-opacity">
                    <button
                      onClick={() => onOpenAddModal(index + 1)}
                      className="px-3 py-1 bg-black text-white hover:bg-neutral-800 border border-black text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Insert Section Here</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
