'use client';

import React, { useState } from 'react';
import { WebsiteProject } from '@/types';
import { generateStandaloneHTML } from '@/lib/code-generator';
import { generateFullStackTree } from '@/lib/fullstack-generator';
import { 
  X, Download, Copy, Check, ExternalLink, Rocket, 
  Sparkles, RefreshCw, CheckCircle2, Shield
} from 'lucide-react';
import JSZip from 'jszip';
import { generateFullProjectDocumentation } from '@/lib/project-doc-generator';

interface ExportModalProps {
  project: WebsiteProject;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [autoDownloaded, setAutoDownloaded] = useState(false);
  const [deployProvider, setDeployProvider] = useState<'netlify' | 'vercel'>('netlify');
  const [customSubdomain, setCustomSubdomain] = useState('');
  const [deployResult, setDeployResult] = useState<{
    url: string;
    subdomain: string;
    provider: string;
    timestamp: string;
    dbMigrated?: boolean;
  } | null>(null);

  if (!isOpen || !project) return null;

  const fullStackData = generateFullStackTree(project);
  const htmlCode = generateStandaloneHTML(project);

  const handleCopy = (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      }
    } catch {
      // Ignore if clipboard policy is restricted
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Automated background package download
  const triggerAutoDownloadZip = async () => {
    try {
      const zip = new JSZip();
      const folderName = project.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const folder = zip.folder(folderName) || zip;

      Object.entries(fullStackData.fileTree).forEach(([filepath, content]) => {
        folder.file(filepath, content);
      });
      folder.file('index.html', htmlCode);

      // Dynamically attach full project documentation, ER diagrams & UML
      const docFiles = generateFullProjectDocumentation({
        title: project.title,
        id: project.id,
        category: project.industry || 'Web Application',
        prompt: project.prompt || '',
        sections: project.sections,
        createdAt: project.createdAt || Date.now(),
      });
      Object.entries(docFiles).forEach(([docPath, docContent]) => {
        folder.file(docPath, docContent);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${folderName}-production-bundle.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setAutoDownloaded(true);
    } catch (e) {
      console.error('ZIP auto-download error:', e);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      // 1. Trigger automated background package download simultaneously
      triggerAutoDownloadZip();

      const supabaseUrl = typeof window !== 'undefined' ? localStorage.getItem('supabase_url') || '' : '';
      const supabaseServiceKey = typeof window !== 'undefined' ? localStorage.getItem('supabase_anon_key') || '' : '';

      // 2. Call backend deployment API
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          provider: deployProvider,
          customSubdomain: customSubdomain.trim() || undefined,
          supabaseUrl: supabaseUrl || undefined,
          supabaseServiceKey: supabaseServiceKey || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDeployResult({
          url: data.url,
          subdomain: data.subdomain,
          provider: data.provider,
          timestamp: data.timestamp,
          dbMigrated: data.dbMigrated,
        });
      }
    } catch (e) {
      console.error('Deployment error:', e);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-2 border-black max-w-2xl w-full flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="p-6 border-b-2 border-black flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-black bg-black text-white">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600">
                AUTOMATED PRODUCTION PIPELINE
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-black">
                1-Click Deployment
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-black hover:bg-black hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean Single Deployment Interface */}
        <div className="p-6 space-y-6">
          <div className="p-4 border border-black bg-neutral-50 text-black space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-black" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                Direct Cloud Edge Pipeline
              </span>
            </div>
            <p className="text-xs text-neutral-800 leading-relaxed font-sans">
              Deploying provisions a live edge URL with SSL on <strong>{deployProvider === 'netlify' ? 'Netlify Global Edge' : 'Vercel Edge Network'}</strong>, runs PostgreSQL Supabase migrations, and automatically downloads your complete backend package to your machine.
            </p>
          </div>

          {/* Provider Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDeployProvider('netlify')}
              className={`p-3.5 border-2 border-black text-left transition-all ${
                deployProvider === 'netlify'
                  ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white text-black hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs uppercase">
                <span>Netlify Edge</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 border ${deployProvider === 'netlify' ? 'border-white text-white' : 'border-black text-black'}`}>
                  DEFAULT
                </span>
              </div>
              <div className={`text-[10px] font-mono mt-1 ${deployProvider === 'netlify' ? 'text-neutral-300' : 'text-neutral-600'}`}>
                Instant *.netlify.app edge deployment
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDeployProvider('vercel')}
              className={`p-3.5 border-2 border-black text-left transition-all ${
                deployProvider === 'vercel'
                  ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white text-black hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs uppercase">
                <span>Vercel Edge</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 border ${deployProvider === 'vercel' ? 'border-white text-white' : 'border-black text-black'}`}>
                  NEXT.JS 15
                </span>
              </div>
              <div className={`text-[10px] font-mono mt-1 ${deployProvider === 'vercel' ? 'text-neutral-300' : 'text-neutral-600'}`}>
                Deploy to *.vercel.app edge serverless
              </div>
            </button>
          </div>

          {/* Target Subdomain Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black">
              Target Subdomain Slug (Optional)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center flex-1 px-3 py-2 border border-black bg-white text-xs font-mono">
                <input
                  type="text"
                  placeholder={project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}
                  value={customSubdomain}
                  onChange={(e) => setCustomSubdomain(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-black placeholder:text-neutral-400"
                />
                <span className="text-neutral-500 font-mono">
                  .{deployProvider === 'vercel' ? 'vercel.app' : 'netlify.app'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleDeploy}
                disabled={isDeploying}
                className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border border-black disabled:opacity-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                {isDeploying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deploying...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Deploy Now</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Deployment Success Result Card */}
          {deployResult && (
            <div className="p-4 border-2 border-black bg-neutral-50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-black">
                  <Shield className="w-4 h-4 text-black" />
                  <span>SUCCESSFULLY DEPLOYED TO {deployResult.provider.toUpperCase()}</span>
                </div>
                <span className="text-[10px] font-mono border border-black px-2 py-0.5 text-black">
                  SSL ACTIVE
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={deployResult.url}
                  className="flex-1 px-3 py-2 border border-black bg-white text-xs font-mono text-black select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(deployResult.url)}
                  className="px-3 py-2 border border-black bg-white hover:bg-neutral-100 text-black text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={deployResult.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 border border-black bg-black text-white hover:bg-neutral-800 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors"
                >
                  <span>Visit Live</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="space-y-1 text-[11px] font-mono text-neutral-700 pt-1 border-t border-neutral-300">
                {autoDownloaded && (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />
                    <span>Production backend bundle (ZIP) downloaded automatically.</span>
                  </div>
                )}
                {deployResult.dbMigrated && (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />
                    <span>PostgreSQL DDL schema automatically applied to Supabase database.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-black bg-white flex items-center justify-between">
          <div className="text-xs font-mono text-neutral-600">
            {project.sections.length} UI Modules • Serverless Architecture
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border border-black hover:bg-neutral-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
