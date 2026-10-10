'use client';

import React, { useState } from 'react';
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Code, Check } from 'lucide-react';
import { sanitizeLinkUrl } from '@/lib/sanitizer';

interface RichTextEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value = '', onChange, placeholder }: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedText, setSelectedText] = useState('');

  const applyFormat = (tag: 'b' | 'i' | 'ul' | 'ol') => {
    let formatted = value;
    if (tag === 'b') formatted = `${value} <b>bold text</b>`;
    else if (tag === 'i') formatted = `${value} <i>italic text</i>`;
    else if (tag === 'ul') formatted = `${value}\n<ul>\n  <li>List item 1</li>\n  <li>List item 2</li>\n</ul>`;
    else if (tag === 'ol') formatted = `${value}\n<ol>\n  <li>First step</li>\n  <li>Second step</li>\n</ol>`;

    onChange(formatted);
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;
    const { isValid, sanitizedUrl } = sanitizeLinkUrl(linkUrl);
    if (!isValid) return;

    const linkText = selectedText || 'link text';
    const htmlLink = `<a href="${sanitizedUrl}">${linkText}</a>`;
    onChange(`${value} ${htmlLink}`);

    setLinkUrl('');
    setSelectedText('');
    setShowLinkDialog(false);
  };

  return (
    <div className="border border-outline/20 rounded-xl overflow-hidden bg-surface flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-surface-variant/40 border-b border-outline/10 text-muted-foreground text-xs">
        <button
          type="button"
          onClick={() => applyFormat('b')}
          className="p-1 rounded hover:bg-surface-variant hover:text-foreground transition"
          title="Bold (<b>)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('i')}
          className="p-1 rounded hover:bg-surface-variant hover:text-foreground transition"
          title="Italic (<i>)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('ul')}
          className="p-1 rounded hover:bg-surface-variant hover:text-foreground transition"
          title="Unordered List (<ul>)"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('ol')}
          className="p-1 rounded hover:bg-surface-variant hover:text-foreground transition"
          title="Ordered List (<ol>)"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-outline/20 mx-1" />
        <button
          type="button"
          onClick={() => setShowLinkDialog(!showLinkDialog)}
          className="p-1 rounded hover:bg-surface-variant hover:text-foreground transition flex items-center gap-1 text-[11px]"
          title="Add Safe Hyperlink"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Link</span>
        </button>
      </div>

      {/* Link Inserter Bar */}
      {showLinkDialog && (
        <div className="p-2 bg-surface-variant/20 border-b border-outline/10 flex items-center gap-2 text-xs">
          <input
            type="text"
            placeholder="Link text..."
            value={selectedText}
            onChange={(e) => setSelectedText(e.target.value)}
            className="px-2 py-1 bg-surface border border-outline/20 rounded text-xs text-foreground w-28"
          />
          <input
            type="url"
            placeholder="https://example.com or mailto:info@..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 px-2 py-1 bg-surface border border-outline/20 rounded text-xs text-foreground"
          />
          <button
            type="button"
            onClick={handleAddLink}
            className="px-2.5 py-1 bg-primary text-on-primary font-medium rounded text-xs hover:opacity-90"
          >
            Insert
          </button>
        </div>
      )}

      {/* Text Area */}
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Enter formatted rich text...'}
        className="w-full p-3 bg-transparent text-xs text-foreground focus:outline-none font-sans leading-relaxed"
      />
    </div>
  );
}
