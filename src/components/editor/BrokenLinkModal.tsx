'use client';

import React from 'react';
import { AlertTriangle, Check, RefreshCw, Trash2, X } from 'lucide-react';

export interface AffectedLink {
  location: string;
  label: string;
  targetHref: string;
}

interface BrokenLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletedPageSlug: string;
  affectedLinks: AffectedLink[];
  onFixLinks: (action: 'update' | 'remove', newSlug?: string) => void;
}

export function BrokenLinkModal({
  isOpen,
  onClose,
  deletedPageSlug,
  affectedLinks,
  onFixLinks,
}: BrokenLinkModalProps) {
  if (!isOpen || affectedLinks.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-surface surface-container-high border border-outline/20 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline/10 bg-amber-500/10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-foreground text-base">Broken Link Finder Warning</h3>
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface-variant">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Renaming or deleting <strong className="text-foreground font-mono">{deletedPageSlug}</strong> creates <strong className="text-amber-500 font-bold">{affectedLinks.length} broken link(s)</strong> across your site navigation and call-to-action buttons:
          </p>

          <div className="space-y-2 max-h-48 overflow-y-auto border border-outline/10 rounded-xl p-3 bg-background/50">
            {affectedLinks.map((link, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-outline/5 last:border-none">
                <span className="font-semibold text-foreground">{link.label || 'Button / Link'}</span>
                <span className="font-mono text-muted-foreground">{link.location} → {link.targetHref}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => { onFixLinks('remove'); onClose(); }}
              className="px-4 py-2 bg-surface border border-outline/20 text-error font-medium rounded-xl text-xs hover:bg-error/10 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove Broken Links
            </button>
            <button
              onClick={() => { onFixLinks('update', 'index.html'); onClose(); }}
              className="px-4 py-2 bg-primary text-on-primary font-semibold rounded-xl text-xs hover:opacity-90 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Update Links to Home (index.html)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
