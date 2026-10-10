'use client';

import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  HardDrive,
  FileText,
  Globe,
  Layers,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { SourceItem, UserQuota, SourceFileType } from '@/types';
import { SourceCard } from '@/components/library/SourceCard';
import { SourceUploadModal } from '@/components/library/SourceUploadModal';
import { ChunkViewerSheet } from '@/components/library/ChunkViewerSheet';

export default function GlobalKnowledgeLibraryPage() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [quota, setQuota] = useState<UserQuota | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [inspectSource, setInspectSource] = useState<SourceItem | null>(null);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sources');
      const data = await res.json();
      if (res.ok) {
        setSources(data.sources || []);
        setQuota(data.quota);
      }
    } catch (err) {
      console.error('Failed to load sources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (!confirm('Are you sure you want to remove this source from your Knowledge Library?')) return;
    try {
      const res = await fetch(`/api/sources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSources();
      }
    } catch (err) {
      console.error('Failed to delete source:', err);
    }
  };

  const filteredSources = sources.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.tags && s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesType = selectedType === 'all' || s.type === selectedType;

    return matchesSearch && matchesType;
  });

  const bytesToMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-outline/10 bg-surface/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-surface-variant rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              Global Student Knowledge Library
            </h1>
            <p className="text-xs text-muted-foreground">
              Repository of your notes, research papers, textbooks & web sources
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2 bg-primary text-on-primary font-medium rounded-xl text-sm hover:opacity-90 transition flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Knowledge Source
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto p-6 md:p-8 flex-1 space-y-6">
        {/* Storage & Quota Stats Bar */}
        {quota && (
          <div className="bg-surface surface-container-low border border-outline/20 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-sm text-foreground">Knowledge Base Storage Quota</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Free tier allocation for zero-cost RAG grounding
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <div className="text-sm font-semibold text-foreground">
                  {bytesToMB(quota.bytesUsed)} / {bytesToMB(quota.maxBytes)} MB
                </div>
                <div className="w-32 bg-surface-variant h-2 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{ width: `${Math.min(100, (quota.bytesUsed / quota.maxBytes) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="text-right border-l border-outline/10 pl-6">
                <div className="text-sm font-semibold text-foreground">
                  {quota.filesUsed} / {quota.maxFiles} Documents
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Files uploaded</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, tag, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline/20 rounded-xl text-sm text-foreground focus:outline-none focus:border-primary transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {['all', 'pdf', 'docx', 'pptx', 'url', 'text', 'image'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium uppercase tracking-wider transition shrink-0 ${
                  selectedType === type
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface border border-outline/20 text-muted-foreground hover:text-foreground'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Source Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Loading your Knowledge Library...</p>
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="bg-surface border border-dashed border-outline/30 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto my-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
            <div>
              <h3 className="font-semibold text-foreground text-base">No Knowledge Sources Found</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Upload your lecture notes, textbook PDFs, or study URLs to generate grounded study materials and site content with citations.
              </p>
            </div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2 bg-primary text-on-primary font-medium text-xs rounded-xl hover:opacity-90 transition inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Source
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSources.map((source) => (
              <SourceCard
                key={source.id}
                source={source}
                onViewChunks={(s) => setInspectSource(s)}
                onDelete={handleDeleteSource}
              />
            ))}
          </div>
        )}
      </main>

      {/* Upload Modal */}
      <SourceUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={fetchSources}
        quota={quota}
      />

      {/* Chunk Viewer Sheet */}
      <ChunkViewerSheet
        isOpen={!!inspectSource}
        sourceId={inspectSource?.id || null}
        sourceTitle={inspectSource?.title}
        onClose={() => setInspectSource(null)}
      />
    </div>
  );
}
