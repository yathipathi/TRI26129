'use client';

import React, { useState } from 'react';
import { Link as LinkIcon, ExternalLink, Phone, Mail, MessageSquare, Anchor, X, Check, AlertCircle } from 'lucide-react';
import { sanitizeLinkUrl } from '@/lib/sanitizer';

interface LinkPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLink: (url: string, label?: string) => void;
  initialUrl?: string;
  pages?: { name: string; slug: string }[];
  sections?: { id: string; title: string }[];
}

export function LinkPickerModal({
  isOpen,
  onClose,
  onSelectLink,
  initialUrl = '',
  pages = [{ name: 'Home', slug: 'index.html' }],
  sections = [],
}: LinkPickerModalProps) {
  const [activeTab, setActiveTab] = useState<'internal' | 'anchor' | 'external' | 'contact'>('internal');
  const [url, setUrl] = useState(initialUrl);
  const [label, setLabel] = useState('');
  const [contactType, setContactType] = useState<'tel' | 'mailto' | 'whatsapp'>('tel');
  const [contactValue, setContactValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyLink = (targetUrl: string, targetLabel?: string) => {
    const { isValid, sanitizedUrl } = sanitizeLinkUrl(targetUrl);
    if (!isValid) {
      setError('Blocked unsafe URL scheme (e.g. javascript: or data:)');
      return;
    }
    onSelectLink(sanitizedUrl, targetLabel || label);
    handleClose();
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = contactValue;
    if (contactType === 'tel') finalUrl = `tel:${contactValue}`;
    else if (contactType === 'mailto') finalUrl = `mailto:${contactValue}`;
    else if (contactType === 'whatsapp') finalUrl = `https://wa.me/${contactValue.replace(/[^\d]/g, '')}`;

    handleApplyLink(finalUrl);
  };

  const handleClose = () => {
    setUrl('');
    setLabel('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-surface surface-container-high border border-outline/20 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline/10">
          <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
            <LinkIcon className="w-5 h-5 text-primary" />
            Structured Link Picker
          </h3>
          <button onClick={handleClose} className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface-variant transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline/10 px-6 pt-3 gap-2 text-xs font-medium">
          <button
            onClick={() => { setActiveTab('internal'); setError(null); }}
            className={`px-3 py-2 border-b-2 transition ${activeTab === 'internal' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground'}`}
          >
            Internal Page
          </button>
          <button
            onClick={() => { setActiveTab('anchor'); setError(null); }}
            className={`px-3 py-2 border-b-2 transition ${activeTab === 'anchor' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground'}`}
          >
            Section Anchor
          </button>
          <button
            onClick={() => { setActiveTab('external'); setError(null); }}
            className={`px-3 py-2 border-b-2 transition ${activeTab === 'external' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground'}`}
          >
            External Web URL
          </button>
          <button
            onClick={() => { setActiveTab('contact'); setError(null); }}
            className={`px-3 py-2 border-b-2 transition ${activeTab === 'contact' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground'}`}
          >
            Tel / Mail / WhatsApp
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'internal' && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Select a page within this site:</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {pages.map((p) => (
                  <button
                    key={p.slug}
                    onClick={() => handleApplyLink(p.slug, p.name)}
                    className="w-full text-left px-4 py-2.5 rounded-xl border border-outline/10 hover:border-primary/40 hover:bg-primary/5 text-xs text-foreground transition flex items-center justify-between"
                  >
                    <span className="font-semibold">{p.name}</span>
                    <span className="font-mono text-muted-foreground">{p.slug}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'anchor' && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Jump to section on page:</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleApplyLink(`#${s.id}`, s.title)}
                    className="w-full text-left px-4 py-2.5 rounded-xl border border-outline/10 hover:border-primary/40 hover:bg-primary/5 text-xs text-foreground transition flex items-center justify-between"
                  >
                    <span className="font-semibold">{s.title || s.id}</span>
                    <span className="font-mono text-muted-foreground">#{s.id}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'external' && (
            <form onSubmit={(e) => { e.preventDefault(); handleApplyLink(url); }} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">External Web URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/target-page"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-variant/30 border border-outline/20 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={handleClose} className="px-4 py-2 text-xs text-muted-foreground rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-xl hover:opacity-90">Apply Link</button>
              </div>
            </form>
          )}

          {activeTab === 'contact' && (
            <form onSubmit={handleContactSubmit} className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setContactType('tel')}
                  className={`flex-1 p-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 ${contactType === 'tel' ? 'bg-primary text-on-primary border-primary' : 'border-outline/20 text-muted-foreground'}`}
                >
                  <Phone className="w-3.5 h-3.5" /> Phone (tel:)
                </button>
                <button
                  type="button"
                  onClick={() => setContactType('mailto')}
                  className={`flex-1 p-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 ${contactType === 'mailto' ? 'bg-primary text-on-primary border-primary' : 'border-outline/20 text-muted-foreground'}`}
                >
                  <Mail className="w-3.5 h-3.5" /> Email (mailto:)
                </button>
                <button
                  type="button"
                  onClick={() => setContactType('whatsapp')}
                  className={`flex-1 p-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 ${contactType === 'whatsapp' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-outline/20 text-muted-foreground'}`}
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  {contactType === 'tel' ? 'Phone Number (e.g. +18005550199)' : contactType === 'mailto' ? 'Email Address' : 'WhatsApp Number (with country code)'}
                </label>
                <input
                  type="text"
                  placeholder={contactType === 'tel' ? '+18005550199' : contactType === 'mailto' ? 'support@siteforge.dev' : '+919876543210'}
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-variant/30 border border-outline/20 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={handleClose} className="px-4 py-2 text-xs text-muted-foreground rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-xl hover:opacity-90">Apply Contact Link</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
