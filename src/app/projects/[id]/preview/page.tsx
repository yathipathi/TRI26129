'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Eye, Edit3, Monitor, Tablet, Smartphone, Undo2, Redo2,
  Sparkles, Download, ArrowUp, ArrowDown, Copy, EyeOff, Lock, Trash2,
  Plus, CheckCircle2, History, Send, Layers, HelpCircle, ShieldCheck, X
} from 'lucide-react';
import {
  Button, Card, CardHeader, CardContent, CardFooter,
  Badge, Chip, Input, TextField, Tabs, TabsList, TabsTrigger, TabsContent,
  Dialog, DialogContent, DialogHeader, DialogTitle, LinearProgress, Switch
} from '@/components/ui';
import { SiteSpec, SectionSpec, EditorCommand, AIProposal } from '@/types';

export default function PreviewEditPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.id as string) || '';

  const [mode, setMode] = useState<'interact' | 'edit'>('edit');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [siteSpec, setSiteSpec] = useState<any>(null);
  const [activePageSlug, setActivePageSlug] = useState('index.html');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Side Sheet & Modals State
  const [sideSheetOpen, setSideSheetOpen] = useState(false);
  const [sideSheetTab, setSideSheetTab] = useState<'ai' | 'content' | 'style' | 'layout' | 'sources' | 'history'>('ai');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [targetImage, setTargetImage] = useState<{ src: string; alt: string; sectionId: string | null }>({ src: '', alt: '', sectionId: null });

  // Command Stack & Save Status
  const [commandStack, setCommandStack] = useState<EditorCommand[]>([]);
  const [commandIndex, setCommandIndex] = useState(-1);
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...' | 'Offline - retrying'>('Saved');

  // AI Prompt & Proposal State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiScope, setAiScope] = useState<'section' | 'page' | 'site'>('section');
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [activeProposal, setActiveProposal] = useState<AIProposal | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load project data
  useEffect(() => {
    if (!projectId) return;

    fetch(`/api/projects/${projectId}`)
      .then((res) => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.project) {
          const spec = data.project.siteSpec || data.project;
          setSiteSpec(spec);
          if (spec.sections?.[0]?.id) {
            setSelectedSectionId(spec.sections[0].id);
          }
        }
      })
      .catch(() => {});
  }, [projectId, router]);

  // Listen for postMessage from bridge script
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      const msg = event.data;

      if (msg.type === 'SECTION_CLICKED') {
        setSelectedSectionId(msg.sectionId);
        setSideSheetOpen(true);
      } else if (msg.type === 'IMAGE_CLICKED') {
        setTargetImage({ src: msg.src, alt: msg.alt, sectionId: msg.sectionId });
        setImageModalOpen(true);
      } else if (msg.type === 'INLINE_TEXT_UPDATED') {
        handleInlineTextUpdate(msg.sectionId, msg.newText);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedSectionId, siteSpec]);

  // Push mode to iframe
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SET_EDIT_MODE',
        enabled: mode === 'edit',
      }, '*');
    }
  }, [mode]);

  // Execute State Mutation with Undo Stack
  const executeMutation = (newSpec: any, description: string) => {
    setSaveStatus('Saving...');
    const command: EditorCommand = {
      id: 'cmd-' + Date.now(),
      description,
      timestamp: Date.now(),
      prevSpec: siteSpec,
      nextSpec: newSpec,
    };

    const newStack = commandStack.slice(0, commandIndex + 1);
    newStack.push(command);
    setCommandStack(newStack);
    setCommandIndex(newStack.length - 1);
    setSiteSpec(newSpec);

    // Save draft to backend
    fetch(`/api/projects/${projectId}/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spec: newSpec, description }),
    }).then(() => setSaveStatus('Saved')).catch(() => setSaveStatus('Offline - retrying'));
  };

  const handleUndo = () => {
    if (commandIndex >= 0) {
      const cmd = commandStack[commandIndex];
      setSiteSpec(cmd.prevSpec);
      setCommandIndex(commandIndex - 1);
    }
  };

  const handleRedo = () => {
    if (commandIndex < commandStack.length - 1) {
      const nextIndex = commandIndex + 1;
      const cmd = commandStack[nextIndex];
      setSiteSpec(cmd.nextSpec);
      setCommandIndex(nextIndex);
    }
  };

  // Section Operations
  const currentSections: SectionSpec[] = siteSpec?.sections || siteSpec?.pages?.find((p: any) => p.slug === activePageSlug)?.sections || [];
  const selectedSection = currentSections.find((s) => s.id === selectedSectionId);

  const handleMoveSection = (direction: 'up' | 'down') => {
    if (!selectedSectionId || !siteSpec) return;
    const idx = currentSections.findIndex((s) => s.id === selectedSectionId);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentSections.length) return;

    const newSections = [...currentSections];
    const [moved] = newSections.splice(idx, 1);
    newSections.splice(targetIdx, 0, moved);

    const newSpec = { ...siteSpec, sections: newSections };
    executeMutation(newSpec, `Moved section ${moved.title} ${direction}`);
  };

  const handleDuplicateSection = () => {
    if (!selectedSection || !siteSpec) return;
    const newSection: SectionSpec = {
      ...selectedSection,
      id: 'sec-' + Date.now().toString(36),
      title: `${selectedSection.title} (Copy)`,
    };
    const idx = currentSections.findIndex((s) => s.id === selectedSectionId);
    const newSections = [...currentSections];
    newSections.splice(idx + 1, 0, newSection);

    const newSpec = { ...siteSpec, sections: newSections };
    executeMutation(newSpec, `Duplicated section ${selectedSection.title}`);
  };

  const handleDeleteSection = () => {
    if (!selectedSectionId || !siteSpec) return;
    if (selectedSection?.isLocked) {
      alert('Section is locked. Unlock it first before deleting.');
      return;
    }
    const newSections = currentSections.filter((s) => s.id !== selectedSectionId);
    const newSpec = { ...siteSpec, sections: newSections };
    setSelectedSectionId(newSections[0]?.id || null);
    executeMutation(newSpec, `Deleted section ${selectedSectionId}`);
  };

  const handleToggleLock = () => {
    if (!selectedSection || !siteSpec) return;
    const updated = { ...selectedSection, isLocked: !selectedSection.isLocked };
    const newSections = currentSections.map((s) => (s.id === selectedSectionId ? updated : s));
    const newSpec = { ...siteSpec, sections: newSections };
    executeMutation(newSpec, `${updated.isLocked ? 'Locked' : 'Unlocked'} section ${selectedSection.title}`);
  };

  const handleInlineTextUpdate = (secId: string | null, newText: string) => {
    if (!secId || !siteSpec || !newText) return;
    const targetSec = currentSections.find((s) => s.id === secId);
    if (!targetSec || targetSec.isLocked) return;

    const updated = { ...targetSec, title: newText };
    const newSections = currentSections.map((s) => (s.id === secId ? updated : s));
    const newSpec = { ...siteSpec, sections: newSections };

    // Patch DOM live
    fetch(`/api/projects/${projectId}/render-section`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionSpec: updated }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.html && iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'PATCH_SECTION_HTML',
            sectionId: secId,
            html: data.html,
          }, '*');
        }
      })
      .catch(() => {});

    executeMutation(newSpec, `Updated inline text in ${targetSec.title}`);
  };

  // AI Prompt Executer
  const handleRunAiRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isAiRunning) return;

    setIsAiRunning(true);
    const instruction = aiPrompt;
    setAiPrompt('');

    try {
      const res = await fetch('/api/ai/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          scope: aiScope,
          targetSectionId: selectedSectionId,
          instruction,
          currentSpec: siteSpec,
        }),
      });

      const data = await res.json();
      if (res.ok && data.proposal) {
        setActiveProposal(data.proposal);
      } else {
        alert(data.error || 'AI edit failed');
      }
    } catch {
      alert('Error connecting to AI edit pipeline');
    } finally {
      setIsAiRunning(false);
    }
  };

  const handleAcceptProposal = () => {
    if (!activeProposal) return;
    executeMutation(activeProposal.proposedSpec, activeProposal.changelog);
    setActiveProposal(null);
  };

  return (
    <div className="min-h-screen bg-md-surface-low text-md-on-surface font-sans flex flex-col h-screen overflow-hidden selection:bg-md-primary-container selection:text-md-on-primary-container">
      {/* ─── Top Control Header ────────────────────────────────────────────── */}
      <header className="h-16 bg-md-surface border-b border-md-outline-variant/50 px-6 flex items-center justify-between z-40 shrink-0 m3-transition select-none">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-md-full hover:bg-md-surface-container text-md-on-surface-variant m3-transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <span className="font-bold text-base text-md-on-surface block leading-tight">{siteSpec?.title || 'Preview & Edit'}</span>
            <span className="text-[11px] text-md-on-surface-variant">Live Preview Mode</span>
          </div>

          {/* Mode Switcher Pill */}
          <div className="flex items-center bg-md-surface-container p-1 rounded-md-full border border-md-outline-variant/40 ml-4">
            <button
              onClick={() => setMode('edit')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md-full text-xs font-semibold m3-transition ${
                mode === 'edit'
                  ? 'bg-md-primary text-md-on-primary shadow-xs'
                  : 'text-md-on-surface-variant hover:text-md-on-surface'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Mode</span>
            </button>
            <button
              onClick={() => setMode('interact')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md-full text-xs font-semibold m3-transition ${
                mode === 'interact'
                  ? 'bg-md-primary text-md-on-primary shadow-xs'
                  : 'text-md-on-surface-variant hover:text-md-on-surface'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Interact Mode</span>
            </button>
          </div>
        </div>

        {/* Center Viewport Switcher */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center bg-md-surface-container p-1 rounded-md-sm border border-md-outline-variant/40">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-md-xs text-xs ${viewport === 'desktop' ? 'bg-md-surface text-md-primary shadow-xs font-semibold' : 'text-md-on-surface-variant'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded-md-xs text-xs ${viewport === 'tablet' ? 'bg-md-surface text-md-primary shadow-xs font-semibold' : 'text-md-on-surface-variant'}`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-md-xs text-xs ${viewport === 'mobile' ? 'bg-md-surface text-md-primary shadow-xs font-semibold' : 'text-md-on-surface-variant'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 border-l border-md-outline-variant/40 pl-4">
            <button
              onClick={handleUndo}
              disabled={commandIndex < 0}
              className="p-1.5 rounded-md-xs hover:bg-md-surface-container text-md-on-surface-variant disabled:opacity-30"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={commandIndex >= commandStack.length - 1}
              className="p-1.5 rounded-md-xs hover:bg-md-surface-container text-md-on-surface-variant disabled:opacity-30"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Export Action */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-md-on-surface-variant font-medium">{saveStatus}</span>
          <a href={`/api/export?siteId=${projectId}`}>
            <Button variant="filled" size="sm" className="font-semibold shadow-md-1">
              <Download className="w-3.5 h-3.5" />
              <span>Export ZIP</span>
            </Button>
          </a>
        </div>
      </header>

      {/* ─── Main Preview Workspace Body ───────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Center Sandboxed Preview Iframe */}
        <main className="flex-1 bg-md-surface-container-low flex flex-col justify-center items-center p-4 relative overflow-auto">
          <iframe
            ref={iframeRef}
            src={`/preview/${projectId}`}
            sandbox="allow-scripts allow-forms allow-same-origin allow-modals allow-popups"
            className={`bg-white rounded-md-lg shadow-md-2 border border-md-outline-variant/60 m3-transition h-full ${
              viewport === 'desktop' ? 'w-full' : viewport === 'tablet' ? 'w-[768px]' : 'w-[375px]'
            }`}
          />

          {/* Floating Section Toolbar (when section selected in Edit Mode) */}
          {mode === 'edit' && selectedSection && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 p-1.5 bg-md-surface rounded-md-full shadow-md-3 border border-md-outline-variant animate-fadeIn">
              <span className="px-3 py-1 text-xs font-bold text-md-primary bg-md-primary-container/40 rounded-md-full">
                {selectedSection.type.toUpperCase()}
              </span>

              <div className="h-4 w-px bg-md-outline-variant/60 mx-1" />

              <button onClick={() => setSideSheetOpen(true)} className="p-2 rounded-md-full hover:bg-md-surface-container text-md-primary" title="Open AI Side Sheet">
                <Sparkles className="w-4 h-4" />
              </button>
              <button onClick={() => handleMoveSection('up')} className="p-2 rounded-md-full hover:bg-md-surface-container text-md-on-surface-variant" title="Move Up">
                <ArrowUp className="w-4 h-4" />
              </button>
              <button onClick={() => handleMoveSection('down')} className="p-2 rounded-md-full hover:bg-md-surface-container text-md-on-surface-variant" title="Move Down">
                <ArrowDown className="w-4 h-4" />
              </button>
              <button onClick={handleDuplicateSection} className="p-2 rounded-md-full hover:bg-md-surface-container text-md-on-surface-variant" title="Duplicate">
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={handleToggleLock} className="p-2 rounded-md-full hover:bg-md-surface-container text-md-on-surface-variant" title={selectedSection.isLocked ? 'Unlock' : 'Lock'}>
                <Lock className={`w-4 h-4 ${selectedSection.isLocked ? 'text-amber-500' : ''}`} />
              </button>
              <button onClick={handleDeleteSection} className="p-2 rounded-md-full hover:bg-md-error-container/40 text-md-error" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>

        {/* ─── Side Sheet / Inspector Drawer ───────────────────────────────── */}
        {sideSheetOpen && (
          <aside className="w-full sm:w-[420px] bg-md-surface border-l border-md-outline-variant/50 flex flex-col justify-between z-40 shadow-md-4 animate-fadeIn shrink-0">
            {/* Sheet Header */}
            <div className="p-4 border-b border-md-outline-variant/40 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-md-on-surface">Section Inspector</h3>
                <p className="text-xs text-md-on-surface-variant">{selectedSection?.title || selectedSectionId}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSideSheetOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Sheet Tabs */}
            <div className="flex-1 p-4 overflow-y-auto space-y-6">
              <Tabs defaultValue={sideSheetTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="ai" onClick={() => setSideSheetTab('ai')}>AI</TabsTrigger>
                  <TabsTrigger value="content" onClick={() => setSideSheetTab('content')}>Content</TabsTrigger>
                  <TabsTrigger value="style" onClick={() => setSideSheetTab('style')}>Style</TabsTrigger>
                  <TabsTrigger value="sources" onClick={() => setSideSheetTab('sources')}>Sources</TabsTrigger>
                </TabsList>

                {/* AI Tab */}
                <TabsContent value="ai" className="space-y-4 pt-3">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-md-on-surface-variant">AI Edit Scope</label>
                    <div className="flex items-center gap-2">
                      {(['section', 'page', 'site'] as const).map((sc) => (
                        <Chip key={sc} active={aiScope === sc} onClick={() => setAiScope(sc)}>
                          {sc.toUpperCase()}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleRunAiRequest} className="space-y-3">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={3}
                      placeholder="Describe what to change (e.g., Translate to Telugu, add discount pricing badge)..."
                      className="w-full px-3 py-2 rounded-md-sm border border-md-outline bg-md-surface-lowest text-xs text-md-on-surface outline-none focus:border-md-primary resize-none"
                    />
                    <Button type="submit" disabled={isAiRunning || !aiPrompt.trim()} variant="filled" className="w-full py-2 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAiRunning ? 'AI Pipeline Running...' : 'Apply AI Edit'}</span>
                    </Button>
                  </form>

                  {/* Proposal Review */}
                  {activeProposal && (
                    <Card className="p-4 bg-md-surface-container space-y-3 border-md-primary/40">
                      <div className="flex items-center justify-between text-xs font-bold text-md-primary">
                        <span>AI Proposal Proposal</span>
                        <Badge variant="primary">Review Diff</Badge>
                      </div>
                      <p className="text-xs text-md-on-surface-variant">{activeProposal.changelog}</p>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" size="sm" onClick={() => setActiveProposal(null)}>Reject</Button>
                        <Button variant="filled" size="sm" onClick={handleAcceptProposal}>Accept Proposal</Button>
                      </div>
                    </Card>
                  )}
                </TabsContent>

                {/* Content Props Tab */}
                <TabsContent value="content" className="space-y-4 pt-3">
                  {selectedSection ? (
                    <div className="space-y-3">
                      <TextField
                        label="Section Title"
                        value={selectedSection.title}
                        onChange={(e) => {
                          const updated = { ...selectedSection, title: e.target.value };
                          const newSections = currentSections.map((s) => (s.id === selectedSectionId ? updated : s));
                          executeMutation({ ...siteSpec, sections: newSections }, `Updated title to ${e.target.value}`);
                        }}
                      />

                      <TextField
                        label="Subtitle"
                        value={selectedSection.subtitle || ''}
                        onChange={(e) => {
                          const updated = { ...selectedSection, subtitle: e.target.value };
                          const newSections = currentSections.map((s) => (s.id === selectedSectionId ? updated : s));
                          executeMutation({ ...siteSpec, sections: newSections }, `Updated subtitle`);
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-md-on-surface-variant">Select a section to edit properties.</p>
                  )}
                </TabsContent>

                {/* Sources Tab */}
                <TabsContent value="sources" className="space-y-3 pt-3">
                  <div className="p-3 bg-md-surface-container rounded-md-sm text-xs space-y-1.5">
                    <p className="font-semibold text-md-on-surface">Grounding Sources</p>
                    <p className="text-md-on-surface-variant">
                      {selectedSection?.sources?.length ? `${selectedSection.sources.length} sources cited` : 'No citations attached yet.'}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </aside>
        )}
      </div>

      {/* Image Replacement Dialog */}
      <Dialog open={imageModalOpen} onClose={() => setImageModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace Image & Required Alt Text</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <TextField
              label="Image URL"
              value={targetImage.src}
              onChange={(e) => setTargetImage({ ...targetImage, src: e.target.value })}
            />

            <TextField
              label="Accessibility Alt Text (REQUIRED)"
              value={targetImage.alt}
              onChange={(e) => setTargetImage({ ...targetImage, alt: e.target.value })}
              placeholder="Describe the image context..."
            />

            <Button
              variant="tonal"
              size="sm"
              onClick={() => setTargetImage({ ...targetImage, alt: 'Artisan bakery pastries showcase in Hyderabad' })}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Suggest Alt Text</span>
            </Button>
          </div>
          <CardFooter className="justify-end gap-3">
            <Button variant="ghost" onClick={() => setImageModalOpen(false)}>Cancel</Button>
            <Button variant="filled" onClick={() => setImageModalOpen(false)}>Save Image</Button>
          </CardFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
