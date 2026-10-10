'use client';

import React, { useState } from 'react';
import { Section } from '@/types';
import { 
  Sliders, Palette, Type, Layers, Check, 
  Sparkles, Code, Split, Box, RefreshCw, X 
} from 'lucide-react';

interface VisualPropertyInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: Section | null;
  sectionIndex: number;
  onUpdateSection: (updated: Section) => void;
}

export const VisualPropertyInspectorModal: React.FC<VisualPropertyInspectorModalProps> = ({
  isOpen,
  onClose,
  section,
  sectionIndex,
  onUpdateSection,
}) => {
  const [activeTab, setActiveTab] = useState<'spacing' | 'typography' | 'compound' | 'hooks'>('spacing');
  const [extractedCompound, setExtractedCompound] = useState<string | null>(null);
  const [generatedHook, setGeneratedHook] = useState<string | null>(null);

  if (!isOpen || !section) return null;

  const handleSpacingChange = (paddingY: string) => {
    const updated = { ...section, extraDetails: { ...section.extraDetails, paddingY } };
    onUpdateSection(updated);
  };

  const handleExtractCompoundComponent = () => {
    const componentName = `${section.type.charAt(0).toUpperCase() + section.type.slice(1)}Compound`;
    const compoundCode = `
import React, { createContext, useContext } from 'react';

// React Context for Compound Component State Sync
const ${componentName}Context = createContext<any>(null);

export const ${componentName} = ({ children, ...props }: any) => {
  return (
    <${componentName}Context.Provider value={props}>
      <section className="relative py-20 px-6 max-w-7xl mx-auto">
        {children}
      </section>
    </${componentName}Context.Provider>
  );
};

${componentName}.Header = function Header({ title, subtitle }: any) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-16">
      <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">{title}</h2>
      {subtitle && <p className="mt-4 text-base text-neutral-600">{subtitle}</p>}
    </div>
  );
};

${componentName}.ItemGrid = function ItemGrid({ items }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items?.map((item: any) => (
        <div key={item.id} className="p-6 rounded-2xl border border-neutral-200 bg-white">
          <h4 className="font-bold text-neutral-900">{item.title}</h4>
          <p className="mt-2 text-sm text-neutral-600">{item.description}</p>
        </div>
      ))}
    </div>
  );
};
`;
    setExtractedCompound(compoundCode.trim());
  };

  const handleGenerateCustomHook = () => {
    const hookName = `use${section.type.charAt(0).toUpperCase() + section.type.slice(1)}Controller`;
    const hookCode = `
import { useState, useEffect, useCallback } from 'react';

export function ${hookName}(initialData: any) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      // Synchronized DOM/CSS data binding
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    refreshData,
  };
}
`;
    setGeneratedHook(hookCode.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b-2 border-black flex items-center justify-between bg-white text-black">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border border-black bg-black text-white flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2">
                <span>Canvas Inspector: {section.title}</span>
                <span className="text-[10px] px-2 py-0.5 border border-black bg-white uppercase">
                  {section.type}
                </span>
              </div>
              <div className="text-[11px] font-mono text-neutral-600">
                WYSIWYG layout parameter tuning & compound component extraction
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-black hover:bg-black hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('spacing')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'spacing'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Spacing & Layout
          </button>
          <button
            onClick={() => setActiveTab('typography')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'typography'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Typography & Style
          </button>
          <button
            onClick={() => setActiveTab('compound')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'compound'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Compound Component Extractor
          </button>
          <button
            onClick={() => setActiveTab('hooks')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'hooks'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Custom Hook Optimizer
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'spacing' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1.5">
                  Section Vertical Padding (py)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['py-12', 'py-16', 'py-20', 'py-28'].map((py) => (
                    <button
                      key={py}
                      onClick={() => handleSpacingChange(py)}
                      className={`p-2.5 rounded-lg border font-mono text-center transition-all ${
                        section.extraDetails?.paddingY === py
                          ? 'border-neutral-900 bg-neutral-900 text-white font-bold'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      {py}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1.5">
                  Container Layout Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['centered', 'split-left', 'bento'].map((layout) => (
                    <button
                      key={layout}
                      onClick={() => onUpdateSection({ ...section, layout })}
                      className={`p-2.5 rounded-lg border font-mono text-center transition-all capitalize ${
                        section.layout === layout
                          ? 'border-neutral-900 bg-neutral-900 text-white font-bold'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      {layout}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => onUpdateSection({ ...section, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-1 focus:ring-neutral-900 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Section Subtitle / Description
                </label>
                <textarea
                  rows={3}
                  value={section.subtitle || ''}
                  onChange={(e) => onUpdateSection({ ...section, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-1 focus:ring-neutral-900 outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'compound' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-600">
                  Automatically extracts this section into clean compound components sharing state via React Context:
                </p>
                <button
                  onClick={handleExtractCompoundComponent}
                  className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
                >
                  Generate Compound AST
                </button>
              </div>

              {extractedCompound ? (
                <div className="p-3 bg-black text-neutral-100 rounded-xl font-mono text-xs overflow-x-auto max-h-56 leading-relaxed border border-black">
                  <pre>{extractedCompound}</pre>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-neutral-400 border-2 border-dashed border-neutral-200 rounded-xl">
                  Click "Generate Compound AST" to compile &lt;Card&gt;, &lt;Card.Header&gt;, &lt;Card.Body&gt;
                </div>
              )}
            </div>
          )}

          {activeTab === 'hooks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-600">
                  Refactors section state management and asynchronous data fetching into a reusable React Hook:
                </p>
                <button
                  onClick={handleGenerateCustomHook}
                  className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
                >
                  Optimize Hook
                </button>
              </div>

              {generatedHook ? (
                <div className="p-3 bg-neutral-950 text-cyan-400 rounded-xl font-mono text-xs overflow-x-auto max-h-56 leading-relaxed border border-neutral-800">
                  <pre>{generatedHook}</pre>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-neutral-400 border-2 border-dashed border-neutral-200 rounded-xl">
                  Click "Optimize Hook" to extract dedicated React lifecycle controller
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-[11px] font-mono text-neutral-500">
            Section #{sectionIndex + 1}: {section.title}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
