'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  ArrowLeft,
  Loader2,
  HardDrive,
  Search,
  CheckCircle2
} from 'lucide-react';
import { SourceItem, UserQuota, Project } from '@/types';
import { SourceCard } from '@/components/library/SourceCard';
import { SourceUploadModal } from '@/components/library/SourceUploadModal';
import { ChunkViewerSheet } from '@/components/library/ChunkViewerSheet';

export default function ProjectKnowledgeSourcesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [quota, setQuota] = useState<UserQuota | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [inspectSource, setInspectSource] = useState<SourceItem | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchProjectSources();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();
      if (res.ok) {
        setProject(data.project);
      }
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  };

  const fetchProjectSources = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sources?projectId=${projectId}`);
      const data = await res.json();
      if (res.ok) {
        setSources(data.sources || []);
        setQuota(data.quota);
      }
    } catch (err) {
      console.error('Failed to load project sources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (!confirm('Are you sure you want to remove this source from this project?')) return;
    try {
      const res = await fetch(`/api/sources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProjectSources();
      }
    } catch (err) {
      console.error('Failed to delete source:', err);
    }
  };

  const filteredSources = sources.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header */}
      <header className="border-b border-outline/10 bg-surface/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/projects/${projectId}/preview`}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-surface-variant rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              Project Sources & Citations
            </h1>
            <p className="text-xs text-muted-foreground">
              {project ? `Project: ${project.name}` : 'Knowledge sources for AI generation'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/library"
            className="px-4 py-2 bg-surface border border-outline/20 text-foreground font-medium rounded-xl text-sm hover:bg-surface-variant transition"
          >
            Global Library
          </Link>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 bg-primary text-on-primary font-medium rounded-xl text-sm hover:opacity-90 transition flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Source to Project
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto p-6 md:p-8 flex-1 space-y-6">
        {/* Search & Header Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search project sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline/20 rounded-xl text-sm text-foreground focus:outline-none focus:border-primary transition"
            />
          </div>

          <div className="text-xs text-muted-foreground">
            Total Sources for this project: <strong className="text-foreground">{sources.length}</strong>
          </div>
        </div>

        {/* Source Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Loading project sources...</p>
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="bg-surface border border-dashed border-outline/30 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto my-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
            <div>
              <h3 className="font-semibold text-foreground text-base">No Sources Linked to this Project</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Add textbook notes or web research links to generate strictly grounded study material and site sections for this project.
              </p>
            </div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2 bg-primary text-on-primary font-medium text-xs rounded-xl hover:opacity-90 transition inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Upload Source
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
        onSuccess={fetchProjectSources}
        projectId={projectId}
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
