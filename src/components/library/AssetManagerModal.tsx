'use client';

import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, Sparkles, X, Loader2, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

interface AssetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (assetUrl: string, altText: string, isDecorative: boolean) => void;
  currentSrc?: string;
  currentAlt?: string;
}

export function AssetManagerModal({ isOpen, onClose, onSelectImage, currentSrc = '', currentAlt = '' }: AssetManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'stock'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [altText, setAltText] = useState(currentAlt);
  const [isDecorative, setIsDecorative] = useState(false);

  const [loading, setLoading] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image file');
      return;
    }

    if (!isDecorative && (!altText || !altText.trim())) {
      setError('Alt text is REQUIRED for non-decorative images to satisfy WCAG AA accessibility rules.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', altText);
      formData.append('isDecorative', String(isDecorative));

      const res = await fetch('/api/assets/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      onSelectImage(data.assetUrl, data.altText, data.isDecorative);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlRehost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalUrl.trim()) {
      setError('Please enter a valid image URL');
      return;
    }

    if (!isDecorative && (!altText || !altText.trim())) {
      setError('Alt text is REQUIRED for non-decorative images to satisfy WCAG AA accessibility rules.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/assets/rehost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          externalUrl: externalUrl.trim(),
          altText: altText.trim(),
          isDecorative,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Re-hosting failed');

      onSelectImage(data.assetUrl, data.altText, data.isDecorative);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'External URL verification / re-hosting failed');
    } finally {
      setLoading(false);
    }
  };

  const suggestAltTextWithAI = async () => {
    setAiSuggesting(true);
    try {
      const promptName = file ? file.name : externalUrl || 'Image';
      const res = await fetch('/api/ai/quick-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest_alt',
          text: promptName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.result) {
        setAltText(data.result);
      } else {
        setAltText(`Accessible visual illustration of ${promptName.split('.')[0].replace(/[-_]/g, ' ')}`);
      }
    } catch {
      setAltText('Accessible visual illustration for section content');
    } finally {
      setAiSuggesting(false);
    }
  };

  const stockImages = [
    { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80', alt: 'Modern collaborative team working in office' },
    { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80', alt: 'Data analytics charts and business metrics dashboard' },
    { url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80', alt: 'Professional woman presenting software application' },
    { url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80', alt: 'Team of developers reviewing code on laptop screens' },
  ];

  const handleClose = () => {
    setFile(null);
    setExternalUrl('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-surface surface-container-high border border-outline/20 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline/10">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Asset Manager & Image Picker
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload, re-host external URLs safely (SSRF protected), or pick stock placeholders
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface-variant transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline/10 px-6 pt-3 gap-2">
          <button
            onClick={() => { setActiveTab('upload'); setError(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === 'upload'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload File
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
            Re-host External URL
          </button>
          <button
            onClick={() => { setActiveTab('stock'); setError(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === 'stock'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Free Placeholders
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'upload' && (
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div
                className="border-2 border-dashed border-outline/30 rounded-xl p-6 text-center hover:border-primary/50 transition cursor-pointer"
                onClick={() => document.getElementById('asset-file-input')?.click()}
              >
                <input
                  id="asset-file-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                />
                {file ? (
                  <div className="flex flex-col items-center gap-1 text-emerald-500">
                    <CheckCircle className="w-8 h-8" />
                    <span className="font-medium text-sm text-foreground">{file.name}</span>
                    <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-xs font-medium text-foreground">Click to browse or drag image file</p>
                    <p className="text-[11px] text-muted-foreground">PNG, JPG, WEBP, GIF, SVG (Max 10 MB)</p>
                  </div>
                )}
              </div>

              {/* Alt Text & Decorative Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Required Accessible Alt Text <span className="text-error">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={suggestAltTextWithAI}
                    disabled={aiSuggesting}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    {aiSuggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    AI Suggest Alt Text
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Describe the image content for screen readers..."
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  disabled={isDecorative}
                  className="w-full px-3 py-2 bg-surface-variant/30 border border-outline/20 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary disabled:opacity-50"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="decorative-chk"
                  checked={isDecorative}
                  onChange={(e) => setIsDecorative(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <label htmlFor="decorative-chk" className="text-xs text-muted-foreground">
                  Mark as Decorative Image (hides from screen readers per WCAG rules)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs rounded-xl text-muted-foreground hover:bg-surface-variant transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 transition flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Upload & Use Image
                </button>
              </div>
            </form>
          )}

          {activeTab === 'url' && (
            <form onSubmit={handleUrlRehost} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  External Image URL (SSRF Protected)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-variant/30 border border-outline/20 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
                  required
                />
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Image is validated server-side and re-hosted locally to prevent SSRF vulnerabilities.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Required Accessible Alt Text <span className="text-error">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={suggestAltTextWithAI}
                    disabled={aiSuggesting}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    {aiSuggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    AI Suggest Alt Text
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Describe image content..."
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  disabled={isDecorative}
                  className="w-full px-3 py-2 bg-surface-variant/30 border border-outline/20 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary disabled:opacity-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs rounded-xl text-muted-foreground hover:bg-surface-variant transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !externalUrl.trim()}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 transition flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Re-host & Apply
                </button>
              </div>
            </form>
          )}

          {activeTab === 'stock' && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">Select a high-quality free stock placeholder image:</p>
              <div className="grid grid-cols-2 gap-3">
                {stockImages.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      onSelectImage(img.url, img.alt, false);
                      handleClose();
                    }}
                    className="group border border-outline/20 rounded-xl overflow-hidden cursor-pointer hover:border-primary transition bg-surface-variant/20"
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-24 object-cover group-hover:scale-105 transition duration-300" />
                    <p className="p-2 text-[11px] text-foreground font-medium truncate">{img.alt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
