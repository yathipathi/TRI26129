'use client';

import React from 'react';
import { HelpCircle, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + K / Cmd + K', action: 'Open Command Palette' },
    { key: 'Ctrl + Z / Cmd + Z', action: 'Undo last edit' },
    { key: 'Ctrl + Y / Cmd + Y', action: 'Redo reverted edit' },
    { key: 'Escape', action: 'Deselect section / Close inspector modal' },
    { key: '?', action: 'Toggle Keyboard Shortcuts sheet' },
    { key: 'Up / Down Arrow', action: 'Reorder selected section up/down' },
    { key: 'Double Click Text', action: 'Edit text inline directly on canvas' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-surface surface-container-high border border-outline/20 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline/10">
          <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
            <HelpCircle className="w-5 h-5 text-primary" />
            Keyboard Shortcuts Cheat Sheet
          </h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface-variant">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {shortcuts.map((sc, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-outline/5 last:border-none">
              <span className="text-muted-foreground">{sc.action}</span>
              <kbd className="px-2.5 py-1 bg-surface-variant font-mono text-[11px] font-bold text-primary rounded border border-outline/20">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
