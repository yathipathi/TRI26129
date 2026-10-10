'use client';

import React, { useState } from 'react';
import { Upload, Link as LinkIcon, FileText, X, Loader2, CheckCircle2, AlertCircle, HardDrive } from 'lucide-react';
import { UserQuota } from '@/types';

interface SourceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId?: string;
  quota?: UserQuota;
}

export function SourceUploadModal({ isOpen, onClose, onSuccess, projectId, quota }: SourceUploadModalProps) {
  const [activeTab, setActiveTab] = useState<'file' | 'url' | 'paste'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const bytesToMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);
      if (projectId) formData.append('projectId', projectId);

      const res = await fetch('/api/sources', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload source file');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/sources/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          title: title.trim() || undefined,
          projectId: projectId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'URL ingestion failed');

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to fetch article from URL');
    } finally {
      setLoading(false);
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) {
      setError('Please enter some text or notes');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || 'Pasted Research Notes',
          pastedText: pastedText.trim(),
          type: 'text',
          projectId: projectId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Notes submission failed');

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save research notes');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setUrl('');
    setTitle('');
    setPastedText('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface surface-container-high border border-outline/20 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline/10">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Add Knowledge Source
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload notes, papers, PDFs, or web links to train AI grounding
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface-variant transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quota Indicator Banner */}
        {quota && (
          <div className="bg-surface-variant/40 px-6 py-2.5 border-b border-outline/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <HardDrive className="w-4 h-4 text-primary" />
              <span>
                Storage: <strong className="text-foreground">{bytesToMB(quota.bytesUsed)} MB</strong> / {bytesToMB(quota.maxBytes)} MB
              </span>
            </div>
            <div className="text-muted-foreground">
              Files: <strong className="text-foreground">{quota.filesUsed}</strong> / {quota.maxFiles}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-outline/10 px-6 pt-3 gap-2">
          <button
            onClick={() => { setActiveTab('file'); setError(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === 'file'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="w-4 h-4" />
            File Upload
          </button>
          <button
            onClick={() => { setActiveTab('url'); setError(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === 'url'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Web Article / URL
          </button>
          <button
            onClick={() => { setActiveTab('paste'); setError(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === 'paste'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-4 h-4" />
            Paste Notes / Text
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'file' && (
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
                }}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer ${
                  dragOver
                    ? 'border-primary bg-primary/5'
                    : file
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-outline/30 hover:border-outline/60'
                }`}
                onClick={() => {
                  const el = document.getElementById('file-input');
                  el?.click();
                }}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.html,.pptx,image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    <span className="font-medium text-foreground text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-10 h-10 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      Drag & drop your study material or <span className="text-primary underline">browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supported: PDF, DOCX, TXT, MD, HTML, PPTX, Images (OCR)
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Title / Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Chapter 4: Data Structures & Algorithms"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-variant/30 border border-outline/20 rounded-xl text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm rounded-xl text-muted-foreground hover:bg-surface-variant transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="px-5 py-2 text-sm rounded-xl bg-primary text-on-primary font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Ingest & Process
                </button>
              </div>
            </form>
          )}

          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Article or Paper Web URL
                </label>
                <input
                  type="url"
                  placeholder="https://arxiv.org/abs/2301.00000 or https://en.wikipedia.org/wiki/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-variant/30 border border-outline/20 rounded-xl text-sm text-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Custom Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Deep Learning Survey Paper 2024"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-variant/30 border border-outline/20 rounded-xl text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm rounded-xl text-muted-foreground hover:bg-surface-variant transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="px-5 py-2 text-sm rounded-xl bg-primary text-on-primary font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Fetch & Chunk Article
                </button>
              </div>
            </form>
          )}

          {activeTab === 'paste' && (
            <form onSubmit={handlePasteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Lecture Notes: Unit 2 Operating Systems"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-variant/30 border border-outline/20 rounded-xl text-sm text-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Pasted Content (Markdown or Raw Text)
                </label>
                <textarea
                  rows={7}
                  placeholder="Paste lecture transcripts, study notes, or textbook extracts here..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-variant/30 border border-outline/20 rounded-xl text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm rounded-xl text-muted-foreground hover:bg-surface-variant transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !pastedText.trim()}
                  className="px-5 py-2 text-sm rounded-xl bg-primary text-on-primary font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save to Knowledge Base
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
