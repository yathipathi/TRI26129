'use client';

import React, { useState } from 'react';
import { Section } from '@/types';
import { X, Sparkles, RefreshCw } from 'lucide-react';
import { regenerateSectionContent } from '@/lib/ai-generator';

interface RegenerateSectionModalProps {
  section: Section | null;
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: (updatedSection: Section) => void;
}

export const RegenerateSectionModal: React.FC<RegenerateSectionModalProps> = ({
  section,
  isOpen,
  onClose,
  onRegenerate,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !section) return null;

  const handleApply = (instruction: string) => {
    setLoading(true);
    setTimeout(() => {
      const updated = regenerateSectionContent(section, instruction);
      onRegenerate(updated);
      setLoading(false);
      onClose();
    }, 600);
  };

  const quickPresets = [
    { label: 'Make Bolder & Punchy', prompt: 'Make the headlines bolder and more punchy' },
    { label: 'Make More Concise', prompt: 'Make it shorter and more concise' },
    { label: 'Focus on Enterprise Scale', prompt: 'Tailor copy for enterprise engineering leaders' },
    { label: 'Highlight Speed & Latency', prompt: 'Emphasize sub-millisecond edge performance' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-2 border-black max-w-lg w-full flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="p-6 border-b-2 border-black flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border border-black bg-black text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600">
                AI SECTION REWRITER
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-black">
                Regenerate [{section.type}]
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-black hover:bg-black hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-2">
              Custom Prompt / Revision Instructions
            </label>
            <textarea
              rows={3}
              placeholder="e.g. 'Rewrite the copy to sound like Apple + Vercel, emphasize our security guarantees'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-black text-sm bg-white text-black outline-none focus:ring-1 focus:ring-black resize-none"
            />
          </div>

          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600 mb-2">
              Quick Presets
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApply(preset.prompt)}
                  className="px-3 py-2 border border-black text-xs font-semibold text-left hover:bg-black hover:text-white transition-colors truncate"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t-2 border-black flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-black text-black hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading || !prompt.trim()}
              onClick={() => handleApply(prompt)}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-neutral-800 disabled:opacity-40 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Regenerate with AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
