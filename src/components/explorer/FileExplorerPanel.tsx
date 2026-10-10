'use client';

import React, { useState } from 'react';
import { WebsiteProject } from '@/types';
import { 
  Folder, FolderOpen, FileCode, FileText, ChevronRight, ChevronDown, 
  Terminal, Database, Code2, Copy, Check, Eye
} from 'lucide-react';
import { generateFullStackTree } from '@/lib/fullstack-generator';

interface FileExplorerPanelProps {
  project: WebsiteProject | null;
  onClose?: () => void;
}

export const FileExplorerPanel: React.FC<FileExplorerPanelProps> = ({ project }) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'tree' | 'tech'>('tree');

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center text-xs font-mono text-neutral-500">
        Waiting for project compilation...
      </div>
    );
  }

  const fullStack = generateFullStackTree(project);
  const allFiles: Record<string, string> = {
    ...fullStack.fileTree,
    ...(project.fileTree || {}),
  };

  const fileKeys = Object.keys(allFiles);

  const handleCopyCode = (code: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(code);
      }
    } catch {
      // Ignore if clipboard policy is restricted in sandboxed iframe
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white border-l-2 border-black">
      {/* Top Header */}
      <div className="p-3 border-b-2 border-black bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-black" />
          <span className="font-mono font-bold text-xs uppercase tracking-tight text-black">
            File Architecture
          </span>
        </div>
        <div className="text-[10px] font-mono font-bold px-2 py-0.5 border border-black bg-white text-black">
          {fileKeys.length} FILES
        </div>
      </div>

      {/* Architecture KPI Bar */}
      <div className="grid grid-cols-3 border-b-2 border-black bg-neutral-50 divide-x-2 divide-black text-center py-2 px-1 text-[11px] font-mono">
        <div>
          <div className="text-neutral-500 uppercase text-[9px] font-bold">Runtime</div>
          <div className="font-bold text-black">Vite + React 19</div>
        </div>
        <div>
          <div className="text-neutral-500 uppercase text-[9px] font-bold">Database</div>
          <div className="font-bold text-black">PostgreSQL</div>
        </div>
        <div>
          <div className="text-neutral-500 uppercase text-[9px] font-bold">Deploy</div>
          <div className="font-bold text-black">1-Click Edge</div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex border-b-2 border-black bg-white shrink-0">
        <button
          onClick={() => setActiveTab('tree')}
          className={`flex-1 py-2 text-center text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'tree' ? 'bg-black text-white' : 'hover:bg-neutral-100 text-black'
          }`}
        >
          Project File Tree
        </button>
        <button
          onClick={() => setActiveTab('tech')}
          className={`flex-1 py-2 text-center text-xs font-mono font-bold uppercase tracking-wider border-l-2 border-black transition-colors ${
            activeTab === 'tech' ? 'bg-black text-white' : 'hover:bg-neutral-100 text-black'
          }`}
        >
          Stack Architecture
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'tree' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="text-[10px] uppercase font-bold text-neutral-600 tracking-wider flex items-center justify-between">
              <span>PROJECT ROOT</span>
              <span>/{project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}</span>
            </div>

            <div className="border-2 border-black divide-y divide-black bg-white">
              {fileKeys.map((filename) => {
                const isSelected = selectedFile === filename;
                const isSql = filename.endsWith('.sql');
                const isCode = filename.endsWith('.jsx') || filename.endsWith('.tsx') || filename.endsWith('.ts') || filename.endsWith('.js');
                const isConfig = filename.endsWith('.json') || filename.endsWith('.md');

                return (
                  <div key={filename}>
                    <div
                      onClick={() => setSelectedFile(isSelected ? null : filename)}
                      className={`flex items-center justify-between py-2 px-3 cursor-pointer transition-colors text-[11px] ${
                        isSelected ? 'bg-neutral-100 font-bold' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isSql ? (
                          <Database className="w-3.5 h-3.5 text-black shrink-0" />
                        ) : isCode ? (
                          <FileCode className="w-3.5 h-3.5 text-black shrink-0" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                        )}
                        <span className="truncate">{filename}</span>
                      </div>
                      <span className="text-[9px] font-mono border border-black px-1.5 py-0.2 bg-white uppercase shrink-0">
                        {isSql ? 'SQL DDL' : isCode ? 'CODE' : 'CONFIG'}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="p-3 bg-neutral-900 text-white border-t border-black space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-neutral-300">
                          <span>{filename}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(allFiles[filename]);
                            }}
                            className="flex items-center gap-1 hover:text-white border border-neutral-600 px-2 py-0.5 rounded"
                          >
                            {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="text-[10px] font-mono overflow-x-auto max-h-60 p-2 bg-black border border-neutral-700 leading-relaxed text-neutral-200">
                          {allFiles[filename]}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'tech' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="border-2 border-black p-4 space-y-3 bg-white">
              <div className="font-bold uppercase text-[11px] border-b border-black pb-1">
                Technology Specifications
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Frontend Framework:</span>
                  <span className="font-bold">React 19 + Vite 5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Component System:</span>
                  <span className="font-bold">Shadcn / Radix Primitives</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Styling:</span>
                  <span className="font-bold">Tailwind CSS (Monochrome)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Persistent Database:</span>
                  <span className="font-bold">Supabase PostgreSQL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Local Isolation:</span>
                  <span className="font-bold">WebContainers Wasm Node.js</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Type Guarantee:</span>
                  <span className="font-bold">Zod Schema Enforced</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">AppSec Gate:</span>
                  <span className="font-bold">AST Lexical Sanitizer</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
