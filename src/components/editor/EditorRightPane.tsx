'use client';

import React, { useState } from 'react';
import { 
  Sliders, Palette, Sparkles, Pin, PinOff, Plus, Trash2, 
  Upload, ExternalLink, AlertTriangle, CheckCircle2, Copy, 
  Info, Layout as LayoutIcon, Type, Link as LinkIcon, Image as ImageIcon
} from 'lucide-react';
import { SectionSpec, SiteSpec } from '@/types';
import { getRegistryItem } from '@/lib/section-registry';

interface EditorRightPaneProps {
  section?: SectionSpec;
  siteSpec: SiteSpec;
  onUpdateSectionProps: (sectionId: string, updatedProps: Record<string, any>) => void;
  onTogglePinField: (sectionId: string, fieldKey: string) => void;
  onUpdateTheme: (theme: any) => void;
  onRunQuickAction: (action: string, section: SectionSpec) => void;
  onUploadAsset: (file: File) => Promise<string | null>;
}

export default function EditorRightPane({
  section,
  siteSpec,
  onUpdateSectionProps,
  onTogglePinField,
  onUpdateTheme,
  onRunQuickAction,
  onUploadAsset,
}: EditorRightPaneProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'ai' | 'global'>('content');
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  if (!section) {
    // Global Theme & Site Settings Inspector when no section selected
    return (
      <div className="w-full md:w-80 bg-white border-l-2 border-black flex flex-col h-full overflow-y-auto p-4 space-y-6 font-mono text-xs select-none shrink-0">
        <div className="border-b-2 border-black pb-3">
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 border border-black bg-neutral-100 mb-1 inline-block">
            GLOBAL SETTINGS
          </span>
          <h3 className="text-lg font-black uppercase text-black">Site Theme & Palette</h3>
        </div>

        {/* Global Color Palette */}
        <div className="space-y-3">
          <div className="font-bold uppercase text-xs">Color Palette Tokens</div>
          <div>
            <label className="block text-[11px] font-bold uppercase mb-1">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={siteSpec.theme?.palette?.primary || '#09090b'}
                onChange={(e) =>
                  onUpdateTheme({
                    ...siteSpec.theme,
                    palette: { ...siteSpec.theme.palette, primary: e.target.value },
                  })
                }
                className="w-10 h-8 border-2 border-black cursor-pointer bg-white"
              />
              <input
                type="text"
                value={siteSpec.theme?.palette?.primary || '#09090b'}
                onChange={(e) =>
                  onUpdateTheme({
                    ...siteSpec.theme,
                    palette: { ...siteSpec.theme.palette, primary: e.target.value },
                  })
                }
                className="flex-1 p-2 border-2 border-black uppercase text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase mb-1">Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={siteSpec.theme?.palette?.accent || '#f97316'}
                onChange={(e) =>
                  onUpdateTheme({
                    ...siteSpec.theme,
                    palette: { ...siteSpec.theme.palette, accent: e.target.value },
                  })
                }
                className="w-10 h-8 border-2 border-black cursor-pointer bg-white"
              />
              <input
                type="text"
                value={siteSpec.theme?.palette?.accent || '#f97316'}
                onChange={(e) =>
                  onUpdateTheme({
                    ...siteSpec.theme,
                    palette: { ...siteSpec.theme.palette, accent: e.target.value },
                  })
                }
                className="flex-1 p-2 border-2 border-black uppercase text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Global Typography */}
        <div className="space-y-3 border-t-2 border-black pt-4">
          <div className="font-bold uppercase text-xs">Typography Scale</div>
          <div>
            <label className="block text-[11px] font-bold uppercase mb-1">Sans-Serif Font</label>
            <select
              value={siteSpec.theme?.fonts?.sans || 'Inter'}
              onChange={(e) =>
                onUpdateTheme({
                  ...siteSpec.theme,
                  fonts: { ...siteSpec.theme.fonts, sans: e.target.value },
                })
              }
              className="w-full p-2 border-2 border-black font-mono text-xs outline-none bg-white"
            >
              <option value="Inter">Inter (System UI)</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
              <option value="JetBrains Mono">JetBrains Mono</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  const registryItem = getRegistryItem(section.type);
  const pinnedKeys = section.pinnedFields || [];

  const handleFieldChange = (key: string, value: any) => {
    onUpdateSectionProps(section.id, {
      ...section.props,
      [key]: value,
    });
  };

  const handleFileUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingField(key);
      const url = await onUploadAsset(file);
      if (url) {
        handleFieldChange(key, url);
      }
      setUploadingField(null);
    }
  };

  return (
    <div className="w-full md:w-80 bg-white border-l-2 border-black flex flex-col h-full overflow-hidden shrink-0 font-mono text-xs select-none">
      {/* Header Info */}
      <div className="p-4 border-b-2 border-black bg-neutral-50 flex items-center justify-between">
        <div>
          <span className="text-[9px] font-bold uppercase px-2 py-0.5 border border-black bg-white inline-block">
            INSPECTOR
          </span>
          <h3 className="text-sm font-black uppercase text-black truncate mt-0.5">{section.title || section.type}</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-black bg-white font-bold uppercase text-[11px]">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-2.5 text-center border-r border-black ${activeTab === 'content' ? 'bg-black text-white' : 'text-black hover:bg-neutral-100'}`}
        >
          Content
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-2.5 text-center ${activeTab === 'ai' ? 'bg-black text-white' : 'text-black hover:bg-neutral-100'}`}
        >
          <Sparkles className="w-3 h-3 inline mr-1 text-orange-500" />
          AI
        </button>
      </div>

      {/* TAB: CONTENT */}
      {activeTab === 'content' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Main Title & Subtitle */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-bold uppercase text-[11px]">Headline Title</label>
              <button
                onClick={() => onTogglePinField(section.id, 'title')}
                className="p-1 hover:bg-neutral-200"
                title={pinnedKeys.includes('title') ? 'Unpin field' : 'Pin field against AI overwrite'}
              >
                {pinnedKeys.includes('title') ? <Pin className="w-3.5 h-3.5 text-orange-600 fill-orange-600" /> : <PinOff className="w-3.5 h-3.5 text-neutral-400" />}
              </button>
            </div>
            <input
              type="text"
              value={section.props?.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="w-full p-2.5 border-2 border-black bg-white text-black outline-none font-mono"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-bold uppercase text-[11px]">Subtitle</label>
              <button
                onClick={() => onTogglePinField(section.id, 'subtitle')}
                className="p-1 hover:bg-neutral-200"
              >
                {pinnedKeys.includes('subtitle') ? <Pin className="w-3.5 h-3.5 text-orange-600 fill-orange-600" /> : <PinOff className="w-3.5 h-3.5 text-neutral-400" />}
              </button>
            </div>
            <textarea
              rows={3}
              value={section.props?.subtitle || ''}
              onChange={(e) => handleFieldChange('subtitle', e.target.value)}
              className="w-full p-2.5 border-2 border-black bg-white text-black outline-none font-mono"
            />
          </div>

          {/* Dynamically Generated Registry Fields */}
          {(registryItem?.schemaFields || []).map((field) => {
            if (field.key === 'title' || field.key === 'subtitle') return null;

            if (field.type === 'text') {
              return (
                <div key={field.key}>
                  <label className="block font-bold uppercase text-[11px] mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={section.props?.[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="w-full p-2 border-2 border-black bg-white text-black outline-none"
                  />
                </div>
              );
            }

            if (field.type === 'link') {
              return (
                <div key={field.key}>
                  <label className="block font-bold uppercase text-[11px] mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={section.props?.[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    placeholder="e.g. contact.html or #pricing"
                    className="w-full p-2 border-2 border-black bg-white text-black outline-none"
                  />
                </div>
              );
            }

            if (field.type === 'repeatable') {
              const list: any[] = section.props?.[field.key] || [];
              return (
                <div key={field.key} className="pt-2 border-t-2 border-black space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="font-bold uppercase text-[11px] text-black">{field.label} ({list.length})</label>
                    <button
                      onClick={() => {
                        const newList = [...list, { title: 'New Item', description: 'Description details...' }];
                        handleFieldChange(field.key, newList);
                      }}
                      className="px-2 py-1 bg-black text-white font-bold text-[10px] uppercase flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {list.map((item, idx) => (
                      <div key={idx} className="p-3 border-2 border-black bg-neutral-50 space-y-2">
                        <div className="flex justify-between items-center font-bold text-[10px] uppercase text-neutral-600">
                          <span>Item 0{idx + 1}</span>
                          <button
                            onClick={() => {
                              const newList = list.filter((_, i) => i !== idx);
                              handleFieldChange(field.key, newList);
                            }}
                            className="text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>

                        {(field.repeatableFields || []).map((rf) => (
                          <div key={rf.key}>
                            <label className="block text-[10px] font-bold uppercase">{rf.label}</label>
                            {rf.type === 'textarea' ? (
                              <textarea
                                rows={2}
                                value={item[rf.key] || ''}
                                onChange={(e) => {
                                  const newList = [...list];
                                  newList[idx] = { ...newList[idx], [rf.key]: e.target.value };
                                  handleFieldChange(field.key, newList);
                                }}
                                className="w-full p-1.5 border border-black bg-white text-xs"
                              />
                            ) : (
                              <input
                                type="text"
                                value={item[rf.key] || ''}
                                onChange={(e) => {
                                  const newList = [...list];
                                  newList[idx] = { ...newList[idx], [rf.key]: e.target.value };
                                  handleFieldChange(field.key, newList);
                                }}
                                className="w-full p-1.5 border border-black bg-white text-xs"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}

      {/* TAB: AI QUICK ACTIONS */}
      {activeTab === 'ai' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="font-bold uppercase text-xs text-orange-900 border-b border-black pb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>AI Quick Refinement Desk</span>
          </div>

          <button
            onClick={() => onRunQuickAction('rewrite', section)}
            className="w-full py-2.5 border-2 border-black bg-white hover:bg-neutral-100 font-bold text-xs uppercase text-left px-3 flex justify-between items-center"
          >
            <span>Rewrite Copy</span>
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          </button>

          <button
            onClick={() => onRunQuickAction('shorter', section)}
            className="w-full py-2.5 border-2 border-black bg-white hover:bg-neutral-100 font-bold text-xs uppercase text-left px-3 flex justify-between items-center"
          >
            <span>Make Shorter</span>
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          </button>

          <button
            onClick={() => onRunQuickAction('longer', section)}
            className="w-full py-2.5 border-2 border-black bg-white hover:bg-neutral-100 font-bold text-xs uppercase text-left px-3 flex justify-between items-center"
          >
            <span>Make Longer</span>
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          </button>

          <button
            onClick={() => onRunQuickAction('seo', section)}
            className="w-full py-2.5 border-2 border-black bg-white hover:bg-neutral-100 font-bold text-xs uppercase text-left px-3 flex justify-between items-center"
          >
            <span>Optimize for SEO</span>
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          </button>
        </div>
      )}
    </div>
  );
}
