'use client';

import React, { useEffect, useState } from 'react';
import { X, Layers, Copy, Check, Hash, Loader2, BookOpen } from 'lucide-react';
import { SourceChunk } from '@/types';

interface ChunkViewerSheetProps {
  sourceId: string | null;
  sourceTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChunkViewerSheet({ sourceId, sourceTitle, isOpen, onClose }: ChunkViewerSheetProps) {
  const [chunks, setChunks] = useState<SourceChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && sourceId) {
      fetchChunks();
    }
  }, [isOpen, sourceId]);

  const fetchChunks = async () => {
    if (!sourceId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/sources/${sourceId}/chunks`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load chunks');
      setChunks(data.chunks || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load document chunks');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface surface-container-high border-l border-outline/20 w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline/10">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
              <Layers className="w-4 h-4 text-primary" />
              Source Chunks Inspector
            </h3>
            <p className="text-xs text-muted-foreground truncate max-w-md mt-0.5">
              {sourceTitle || 'Inspecting document chunk segmentation'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface-variant transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs">Parsing semantic chunks & page anchors...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs">
              {error}
            </div>
          ) : chunks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No chunks found for this source.
            </div>
          ) : (
            chunks.map((chunk, idx) => (
              <div
                key={chunk.id}
                className="bg-surface-variant/30 border border-outline/15 rounded-xl p-4 space-y-2 hover:border-outline/40 transition"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-mono text-muted-foreground">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">
                      Chunk #{idx + 1}
                    </span>
                    {chunk.pageAnchor && (
                      <span className="bg-surface-variant px-2 py-0.5 rounded border border-outline/10">
                        {chunk.pageAnchor}
                      </span>
                    )}
                    <span className="text-[11px]">~{chunk.tokenCount} tokens</span>
                  </div>

                  <button
                    onClick={() => copyToClipboard(chunk.content || chunk.text, chunk.id)}
                    className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-surface-variant transition flex items-center gap-1 text-[11px]"
                    title="Copy chunk text"
                  >
                    {copiedId === chunk.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-foreground/90 leading-relaxed font-sans whitespace-pre-wrap bg-background/50 p-3 rounded-lg border border-outline/5">
                  {chunk.content || chunk.text}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
