'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  SiteSpec, SectionSpec, PageSpec, SectionType, EditorCommand, AIProposal, AIEditScope 
} from '@/types';

import EditorTopBar from '@/components/editor/EditorTopBar';
import EditorLeftPane from '@/components/editor/EditorLeftPane';
import EditorRightPane from '@/components/editor/EditorRightPane';
import AIProposalModal from '@/components/editor/AIProposalModal';
import { CommandPalette } from '@/components/editor/CommandPalette';
import { HumanValidationModal } from '@/components/validation/HumanValidationModal';
import { SECTION_REGISTRY } from '@/lib/section-registry';
import { 
  Sparkles, Layers, ShieldCheck, Download, AlertTriangle, 
  Send, RefreshCw, X, CheckSquare, Plus 
} from 'lucide-react';

function EditorContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const projectId = (params?.id as string) || '';
  const initialSectionFromQuery = searchParams.get('section') || undefined;

  // Project & Spec State
  const [projectName, setProjectName] = useState('Loading...');
  const [siteSpec, setSiteSpec] = useState<SiteSpec | null>(null);
  const [activePageSlug, setActivePageSlug] = useState('index.html');
  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>(initialSectionFromQuery);

  // Layout & Viewport State
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewMode, setPreviewMode] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [validationGateOpen, setValidationGateOpen] = useState(false);

  // Command Stack & Undo/Redo State
  const [commandStack, setCommandStack] = useState<EditorCommand[]>([]);
  const [stackIndex, setStackIndex] = useState(-1);
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...' | 'Offline - retrying'>('Saved');
  const [revision, setRevision] = useState(1);

  // AI Editing State
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiScope, setAiScope] = useState<AIEditScope>('section');
  const [isAiExecuting, setIsAiExecuting] = useState(false);
  const [activeProposal, setActiveProposal] = useState<AIProposal | null>(null);

  // Loading & Error State
  const [loading, setLoading] = useState(true);
  const [unauthorizedError, setUnauthorizedError] = useState(false);

  // Iframe Canvas Ref
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load project working draft
  useEffect(() => {
    if (!projectId) return;

    fetch(`/api/projects/${projectId}/draft`)
      .then((res) => {
        if (res.status === 401 || res.status === 404) {
          setUnauthorizedError(true);
          throw new Error('404 Not Found');
        }
        return res.json();
      })
      .then((data) => {
        if (data.spec) {
          setSiteSpec(data.spec);
          setProjectName(data.project?.name || data.spec.meta?.siteName || projectId);
          setActivePageSlug(data.spec.pages[0]?.slug || 'index.html');
          setRevision(data.revision || 1);
        }
      })
      .catch((err) => {
        console.error('Editor loading error:', err);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  // Push new command state to Undo/Redo stack
  const executeOperation = useCallback(
    (newSpec: SiteSpec, description: string) => {
      if (!siteSpec) return;

      const newCommand: EditorCommand = {
        id: 'cmd-' + Date.now(),
        type: 'UPDATE_SECTION_PROPS',
        description,
        timestamp: Date.now(),
        doState: JSON.parse(JSON.stringify(newSpec)),
        undoState: JSON.parse(JSON.stringify(siteSpec)),
      };

      const updatedStack = commandStack.slice(0, stackIndex + 1);
      setCommandStack([...updatedStack, newCommand]);
      setStackIndex(updatedStack.length);
      setSiteSpec(newSpec);
      triggerAutosave(newSpec);
    },
    [siteSpec, commandStack, stackIndex]
  );

  // Debounced Autosave (1.5s)
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const triggerAutosave = (specToSave: SiteSpec) => {
    setSaveStatus('Saving...');
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/draft`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spec: specToSave, revision }),
        });
        if (res.ok) {
          setSaveStatus('Saved');
        } else {
          setSaveStatus('Offline - retrying');
        }
      } catch {
        setSaveStatus('Offline - retrying');
      }
    }, 1500);
  };

  // Undo / Redo Actions
  const handleUndo = () => {
    if (stackIndex >= 0 && commandStack[stackIndex]) {
      const cmd = commandStack[stackIndex];
      setSiteSpec(cmd.undoState);
      setStackIndex(stackIndex - 1);
      triggerAutosave(cmd.undoState);
    }
  };

  const handleRedo = () => {
    if (stackIndex + 1 < commandStack.length && commandStack[stackIndex + 1]) {
      const cmd = commandStack[stackIndex + 1];
      setSiteSpec(cmd.doState);
      setStackIndex(stackIndex + 1);
      triggerAutosave(cmd.doState);
    }
  };

  // Live Section Patching via postMessage or API
  const patchSectionOnCanvas = async (section: SectionSpec) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/render-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section }),
      });
      const data = await res.json();
      if (data.html && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: 'PATCH_SECTION_HTML', sectionId: section.id, html: data.html },
          '*'
        );
      }
    } catch {
      // Fallback reload iframe key
    }
  };

  // Section Operations
  const activePage = siteSpec?.pages.find((p) => p.slug === activePageSlug) || siteSpec?.pages[0];
  const activeSections = activePage?.sections || [];

  const handleUpdateSectionProps = (sectionId: string, newProps: Record<string, any>) => {
    if (!siteSpec || !activePage) return;

    const newSpec: SiteSpec = JSON.parse(JSON.stringify(siteSpec));
    const targetPage = newSpec.pages.find((p) => p.slug === activePageSlug);
    if (!targetPage) return;

    const targetSec = targetPage.sections.find((s) => s.id === sectionId);
    if (targetSec) {
      if (targetSec.isLocked) {
        alert('Section is locked against manual and AI edits.');
        return;
      }
      targetSec.props = newProps;

      // Mark user edited prop keys as pinned
      if (!targetSec.pinnedFields) targetSec.pinnedFields = [];
      Object.keys(newProps).forEach((k) => {
        if (!targetSec.pinnedFields?.includes(k)) {
          targetSec.pinnedFields?.push(k);
        }
      });

      executeOperation(newSpec, `Updated props for ${targetSec.title || sectionId}`);
      patchSectionOnCanvas(targetSec);
    }
  };

  const handleTogglePinField = (sectionId: string, fieldKey: string) => {
    if (!siteSpec || !activePage) return;

    const newSpec: SiteSpec = JSON.parse(JSON.stringify(siteSpec));
    const targetPage = newSpec.pages.find((p) => p.slug === activePageSlug);
    const targetSec = targetPage?.sections.find((s) => s.id === sectionId);

    if (targetSec) {
      if (!targetSec.pinnedFields) targetSec.pinnedFields = [];
      if (targetSec.pinnedFields.includes(fieldKey)) {
        targetSec.pinnedFields = targetSec.pinnedFields.filter((k) => k !== fieldKey);
      } else {
        targetSec.pinnedFields.push(fieldKey);
      }
      executeOperation(newSpec, `Toggled pin for field "${fieldKey}"`);
    }
  };

  const handleReorderSections = (newSections: SectionSpec[]) => {
    if (!siteSpec || !activePage) return;

    const newSpec: SiteSpec = JSON.parse(JSON.stringify(siteSpec));
    const targetPage = newSpec.pages.find((p) => p.slug === activePageSlug);
    if (targetPage) {
      targetPage.sections = newSections;
      executeOperation(newSpec, 'Reordered page sections');
    }
  };

  const handleToggleLock = (id: string) => {
    if (!siteSpec || !activePage) return;
    const newSpec: SiteSpec = JSON.parse(JSON.stringify(siteSpec));
    const targetPage = newSpec.pages.find((p) => p.slug === activePageSlug);
    const sec = targetPage?.sections.find((s) => s.id === id);
    if (sec) {
      sec.isLocked = !sec.isLocked;
      executeOperation(newSpec, `Toggled lock for section ${sec.title || id}`);
    }
  };

  const handleToggleHide = (id: string) => {
    if (!siteSpec || !activePage) return;
    const newSpec: SiteSpec = JSON.parse(JSON.stringify(siteSpec));
    const targetPage = newSpec.pages.find((p) => p.slug === activePageSlug);
    const sec = targetPage?.sections.find((s) => s.id === id);
    if (sec) {
      sec.isHidden = !sec.isHidden;
      executeOperation(newSpec, `Toggled visibility for section ${sec.title || id}`);
    }
  };

  const handleDuplicateSection = (id: string) => {
    if (!siteSpec || !activePage) return;
    const newSpec: SiteSpec = JSON.parse(JSON.stringify(siteSpec));
    const targetPage = newSpec.pages.find((p) => p.slug === activePageSlug);
    const idx = targetPage?.sections.findIndex((s) => s.id === id);

    if (targetPage && idx !== undefined && idx !== -1) {
      const original = targetPage.sections[idx];
      const dup: SectionSpec = JSON.parse(JSON.stringify(original));
      dup.id = `sec-${dup.type}-${Date.now().toString(36)}`;
      dup.title = `${dup.title} (Copy)`;
      targetPage.sections.splice(idx + 1, 0, dup);
      executeOperation(newSpec, `Duplicated section ${original.title}`);
      setSelectedSectionId(dup.id);
    }
  };

  const handleDeleteSection = (id: string) => {
    if (!siteSpec || !activePage) return;
    const newSpec: SiteSpec = JSON.parse(JSON.stringify(siteSpec));
    const targetPage = newSpec.pages.find((p) => p.slug === activePageSlug);
    if (targetPage) {
      targetPage.sections = targetPage.sections.filter((s) => s.id !== id);
      executeOperation(newSpec, `Deleted section ${id}`);
      if (selectedSectionId === id) setSelectedSectionId(undefined);
    }
  };

  const handleAddSectionFromRegistry = (type: SectionType) => {
    if (!siteSpec || !activePage) return;
    const item = SECTION_REGISTRY.find((r) => r.type === type);
    const newSpec: SiteSpec = JSON.parse(JSON.stringify(siteSpec));
    const targetPage = newSpec.pages.find((p) => p.slug === activePageSlug);

    if (targetPage) {
      const newSec: SectionSpec = {
        id: `sec-${type}-${Date.now().toString(36)}`,
        type,
        title: item?.name || type,
        subtitle: item?.defaultProps?.subtitle || '',
        badge: item?.defaultProps?.badge || 'NEW',
        props: JSON.parse(JSON.stringify(item?.defaultProps || {})),
      };
      targetPage.sections.push(newSec);
      executeOperation(newSpec, `Added section ${newSec.title}`);
      setSelectedSectionId(newSec.id);
    }
  };

  const handleAddSectionWithAI = async (description: string) => {
    if (!siteSpec || !activePage) return;
    try {
      const res = await fetch('/api/ai/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          siteName: siteSpec.meta?.siteName || projectName,
          siteType: siteSpec.meta?.siteType || 'General Business',
        }),
      });
      const data = await res.json();
      if (res.ok && data.section) {
        const newSpec: SiteSpec = JSON.parse(JSON.stringify(siteSpec));
        const targetPage = newSpec.pages.find((p) => p.slug === activePageSlug);
        if (targetPage) {
          targetPage.sections.push(data.section);
          executeOperation(newSpec, `AI added section "${data.section.title}"`);
          setSelectedSectionId(data.section.id);
        }
      }
    } catch {
      alert('Error generating section with AI');
    }
  };

  // AI Refinement Desk & Proposal Review
  const handleAIExecuteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInstruction.trim() || !siteSpec || isAiExecuting) return;

    setIsAiExecuting(true);
    try {
      const res = await fetch('/api/ai/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spec: siteSpec,
          scope: aiScope,
          targetSectionId: selectedSectionId,
          instruction: aiInstruction.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.proposal) {
        setActiveProposal(data.proposal);
      } else {
        alert(data.error || 'AI proposal generation failed.');
      }
    } catch {
      alert('Error running AI edit request.');
    } finally {
      setIsAiExecuting(false);
    }
  };

  const handleAcceptAIProposal = (proposal: AIProposal) => {
    if (proposal.proposedSpec) {
      executeOperation(proposal.proposedSpec, `Accepted AI proposal: "${proposal.prompt}"`);
      setActiveProposal(null);
      setAiInstruction('');
    }
  };

  const handleRunQuickAction = async (action: string, sec: SectionSpec) => {
    try {
      const res = await fetch('/api/ai/quick-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, section: sec }),
      });
      const data = await res.json();
      if (res.ok && data.section) {
        handleUpdateSectionProps(sec.id, data.section.props);
      }
    } catch {
      alert('Quick action failed');
    }
  };

  const handleUploadAsset = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/projects/${projectId}/assets`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) return data.url;
      alert(data.error || 'Upload failed');
      return null;
    } catch {
      alert('Asset upload error');
      return null;
    }
  };

  // Viewport Container Width
  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[390px] h-[720px] rounded-3xl border-8 border-neutral-900 shadow-2xl';
      case 'tablet':
        return 'max-w-[768px] h-[800px] rounded-xl border-4 border-neutral-900 shadow-xl';
      default:
        return 'w-full h-full';
    }
  };

  if (unauthorizedError) {
    return (
      <div className="min-h-screen bg-neutral-100 text-black font-mono flex items-center justify-center p-6">
        <div className="border-2 border-black bg-white p-8 max-w-md text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto" />
          <h2 className="text-xl font-black uppercase">404 Not Found</h2>
          <p className="text-xs text-neutral-600">The project repository does not exist or you do not have permission to access it.</p>
          <Link href="/" className="inline-block px-6 py-3 bg-black text-white font-bold text-xs uppercase">
            Return to Dashboard →
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !siteSpec) {
    return (
      <div className="min-h-screen bg-neutral-100 text-black font-mono flex items-center justify-center p-6">
        <div className="text-xs font-bold uppercase flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
          <span>Loading Visual Editor Environment...</span>
        </div>
      </div>
    );
  }

  const pagesList = siteSpec.pages.map((p) => ({ slug: p.slug, title: p.title }));
  const selectedSection = activeSections.find((s) => s.id === selectedSectionId);

  return (
    <div className="min-h-screen bg-neutral-100 text-black font-sans selection:bg-black selection:text-white flex flex-col h-screen overflow-hidden">
      {/* Top Bar */}
      <EditorTopBar
        projectName={projectName}
        onRenameProject={setProjectName}
        pages={pagesList}
        activePageSlug={activePageSlug}
        onSelectPage={setActivePageSlug}
        viewport={viewport}
        onChangeViewport={setViewport}
        canUndo={stackIndex >= 0}
        canRedo={stackIndex + 1 < commandStack.length}
        onUndo={handleUndo}
        onRedo={handleRedo}
        saveStatus={saveStatus}
        previewMode={previewMode}
        onTogglePreviewMode={() => setPreviewMode(!previewMode)}
        onRunVerify={() => router.push(`/projects/${projectId}`)}
        onOpenExportModal={() => setValidationGateOpen(true)}
        aiPanelOpen={aiPanelOpen}
        onToggleAIPanel={() => setAiPanelOpen(!aiPanelOpen)}
      />

      {/* 3-Pane Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Pane (Outline, Add Library, Pages) */}
        {!previewMode && (
          <EditorLeftPane
            sections={activeSections}
            selectedSectionId={selectedSectionId}
            onSelectSection={setSelectedSectionId}
            onReorderSections={handleReorderSections}
            onToggleLock={handleToggleLock}
            onToggleHide={handleToggleHide}
            onDuplicateSection={handleDuplicateSection}
            onDeleteSection={handleDeleteSection}
            onAddSectionFromRegistry={handleAddSectionFromRegistry}
            onAddSectionWithAI={handleAddSectionWithAI}
            pages={siteSpec.pages}
            activePageSlug={activePageSlug}
            onSelectPage={setActivePageSlug}
            onAddPage={(title, slug) => {
              const newSpec: SiteSpec = JSON.parse(JSON.stringify(siteSpec));
              newSpec.pages.push({
                slug,
                title,
                seo: { metaTitle: title, metaDescription: title },
                sections: [{ id: `sec-hero-${Date.now()}`, type: 'hero', title, props: { title } }],
              });
              executeOperation(newSpec, `Added page ${title}`);
              setActivePageSlug(slug);
            }}
            onDeletePage={(slug) => {
              if (slug === 'index.html') return;
              const newSpec: SiteSpec = JSON.parse(JSON.stringify(siteSpec));
              newSpec.pages = newSpec.pages.filter((p) => p.slug !== slug);
              executeOperation(newSpec, `Deleted page ${slug}`);
              setActivePageSlug('index.html');
            }}
          />
        )}

        {/* Center Live Canvas (Sandboxed Iframe) */}
        <div className="flex-1 bg-neutral-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <div className={`w-full h-full flex flex-col items-center justify-center transition-all ${getViewportWidth()}`}>
            <iframe
              ref={iframeRef}
              sandbox="allow-scripts allow-forms allow-same-origin allow-modals allow-popups"
              src={`/api/preview/${projectId}`}
              title="Visual Live Editor Canvas"
              className="w-full h-full flex-1 bg-white border-0 shadow-lg"
            />
          </div>

          {/* AI Editing Overlay Drawer */}
          {aiPanelOpen && (
            <div className="absolute bottom-4 left-6 right-6 max-w-3xl mx-auto border-2 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-3 font-mono text-xs z-30">
              <div className="flex justify-between items-center border-b-2 border-black pb-2">
                <div className="font-bold uppercase text-black flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span>AI Co-Pilot Editing Desk</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] uppercase font-bold text-neutral-500">Scope:</label>
                  <select
                    value={aiScope}
                    onChange={(e) => setAiScope(e.target.value as any)}
                    className="p-1 border border-black text-[11px] uppercase bg-white font-bold"
                  >
                    <option value="section">This Section (@{selectedSection?.title || 'Selected'})</option>
                    <option value="page">This Page ({activePageSlug})</option>
                    <option value="site">Whole Site</option>
                  </select>
                  <button onClick={() => setAiPanelOpen(false)} className="p-1 border border-black hover:bg-black hover:text-white">✕</button>
                </div>
              </div>

              <form onSubmit={handleAIExecuteRequest} className="flex gap-2">
                <input
                  type="text"
                  value={aiInstruction}
                  onChange={(e) => setAiInstruction(e.target.value)}
                  placeholder='Describe changes (e.g. "make pricing tier $49/mo and rewrite hero headline to be bold")...'
                  className="flex-1 p-2.5 border-2 border-black bg-white text-black outline-none"
                />
                <button
                  type="submit"
                  disabled={isAiExecuting || !aiInstruction.trim()}
                  className="px-6 py-2.5 bg-black text-white font-bold uppercase hover:bg-neutral-800 flex items-center gap-1.5 shrink-0"
                >
                  {isAiExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-orange-500" />}
                  <span>{isAiExecuting ? 'Drafting...' : 'Generate Proposal'}</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Pane (Schema-Driven Inspector) */}
        {!previewMode && (
          <EditorRightPane
            section={selectedSection}
            siteSpec={siteSpec}
            onUpdateSectionProps={handleUpdateSectionProps}
            onTogglePinField={handleTogglePinField}
            onUpdateTheme={(theme) => {
              const newSpec: SiteSpec = JSON.parse(JSON.stringify(siteSpec));
              newSpec.theme = theme;
              executeOperation(newSpec, 'Updated global theme');
            }}
            onRunQuickAction={handleRunQuickAction}
            onUploadAsset={handleUploadAsset}
          />
        )}
      </div>

      {/* AI Proposal Review Modal */}
      {activeProposal && (
        <AIProposalModal
          proposal={activeProposal}
          onAccept={handleAcceptAIProposal}
          onReject={() => setActiveProposal(null)}
        />
      )}

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        sections={activeSections}
        onSelectSection={setSelectedSectionId}
        pages={pagesList}
        onSelectPage={setActivePageSlug}
        onChangeViewport={setViewport}
        onToggleAIPanel={() => setAiPanelOpen(true)}
      />

      {/* Human Validation Checklist Gate Modal */}
      <HumanValidationModal
        isOpen={validationGateOpen}
        onClose={() => setValidationGateOpen(false)}
        project={{ id: projectId, title: projectName, description: '', prompt: '', industry: '', tone: '', sections: [], createdAt: Date.now(), updatedAt: Date.now() }}
        onApproveAndDeploy={() => {
          setValidationGateOpen(false);
          window.location.href = `/api/download/${projectId}`;
        }}
      />
    </div>
  );
}

export default function VisualEditorPage() {
  return (
    <Suspense fallback={<div className="p-8 font-mono text-xs">Loading Editor Studio...</div>}>
      <EditorContent />
    </Suspense>
  );
}
