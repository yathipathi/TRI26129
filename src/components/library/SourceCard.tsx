'use client';

import React from 'react';
import {
  FileText,
  FileCode,
  Globe,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Layers,
  Trash2,
  ExternalLink,
  Tag,
  Clock
} from 'lucide-react';
import { SourceItem, SourceFileType } from '@/types';

interface SourceCardProps {
  source: SourceItem;
  onViewChunks: (source: SourceItem) => void;
  onDelete: (id: string) => void;
}

export function SourceCard({ source, onViewChunks, onDelete }: SourceCardProps) {
  const getIcon = (type: SourceFileType) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'pptx':
        return <FileSpreadsheet className="w-5 h-5 text-orange-500" />;
      case 'url':
        return <Globe className="w-5 h-5 text-emerald-500" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-purple-500" />;
      case 'md':
      case 'html':
        return <FileCode className="w-5 h-5 text-amber-500" />;
      default:
        return <FileText className="w-5 h-5 text-primary" />;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-surface surface-container-low border border-outline/20 hover:border-outline/50 rounded-2xl p-5 shadow-xs transition group flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-surface-variant/40 rounded-xl border border-outline/10 shrink-0">
              {getIcon(source.type)}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition">
                {source.title}
              </h4>
              <p className="text-xs text-muted-foreground uppercase font-mono mt-0.5">
                {source.type} • {source.chunkCount || 0} chunks
              </p>
            </div>
          </div>

          <button
            onClick={() => onDelete(source.id)}
            className="p-1.5 text-muted-foreground/60 hover:text-error rounded-lg hover:bg-error/10 transition shrink-0 opacity-0 group-hover:opacity-100"
            title="Delete Source"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Content Snippet / Description */}
        {source.description && (
          <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
            {source.description}
          </p>
        )}

        {/* Tags */}
        {source.tags && source.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {source.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-variant/50 text-muted-foreground border border-outline/10 rounded-md text-[11px]"
              >
                <Tag className="w-2.5 h-2.5 opacity-60" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-5 pt-3 border-t border-outline/10 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1 text-[11px]">
          <Clock className="w-3 h-3" />
          <span>{formatDate(source.createdAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          {source.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-surface-variant transition"
              title="Open External URL"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={() => onViewChunks(source)}
            className="px-3 py-1.5 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary/20 transition flex items-center gap-1 text-xs"
          >
            <Layers className="w-3.5 h-3.5" />
            View Chunks
          </button>
        </div>
      </div>
    </div>
  );
}
