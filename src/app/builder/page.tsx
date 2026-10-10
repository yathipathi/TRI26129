'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Sparkles, Monitor, Tablet, Smartphone, Download, ExternalLink, 
  Send, RefreshCw, Layers, CheckCircle2, AlertCircle, ArrowLeft, 
  Search, ShieldCheck, History, CheckSquare, FileText, Edit3, Activity
} from 'lucide-react';
import VoiceInputButton from '@/components/voice/VoiceInputButton';
import {
  Button, Card, CardHeader, CardContent, CardFooter,
  Badge, Chip, Input, TextField, Dialog, DialogContent, DialogHeader, DialogTitle,
  LinearProgress
} from '@/components/ui';

interface ProgressStep {
  step: string;
  detail?: string;
  payload?: any;
  timestamp: number;
}

function BuilderContent() {
  const searchParams = useSearchParams();
  const templateFromQuery = searchParams.get('template') || '';
  const promptFromQuery = searchParams.get('prompt') || '';

  // Intake State
  const [siteName, setSiteName] = useState(promptFromQuery ? 'Custom Generated Website' : 'Nexa Digital');
  const [siteType, setSiteType] = useState('Startup/SaaS');
  const [purpose, setPurpose] = useState(promptFromQuery || 'Promote software products and drive trial signups');
  const [targetAudience, setTargetAudience] = useState('Developers and engineering teams');
  const [toneStyle, setToneStyle] = useState('Professional, Modern, High-Contrast');
  const [colorPreference, setColorPreference] = useState('Material 3 Seed Blue (#0b57d0)');
  const [userContent, setUserContent] = useState('');
  const [templateSlug, setTemplateSlug] = useState(templateFromQuery);

  // Pipeline State
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('Ready');
  const [stepsLog, setStepsLog] = useState<ProgressStep[]>([]);
  const [siteId, setSiteId] = useState<string>('');
  const [currentVersion, setCurrentVersion] = useState<number>(1);
  const [sourcesUsed, setSourcesUsed] = useState<{ title: string; url: string; snippet?: string }[]>([]);
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [showValidationGate, setShowValidationGate] = useState(false);

  // Crawler Report & Validation Gate State
  const [crawlerReport, setCrawlerReport] = useState<{ status: 'PASS' | 'FAIL'; passedCount: number; failedCount: number; deadLinks: string[] } | null>(null);
  const [checklist, setChecklist] = useState({
    reviewedCopy: false,
    testedForms: false,
    checkedMobileView: false,
    confirmedSources: false,
  });

  // Refine & Preview State
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [refinePrompt, setRefinePrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);

  useEffect(() => {
    if (templateFromQuery) {
      setTemplateSlug(templateFromQuery);
      setSiteName(templateFromQuery.charAt(0).toUpperCase() + templateFromQuery.slice(1) + ' Experience');
    }
  }, [templateFromQuery]);

  const handleGenerate = async () => {
    if (!siteName.trim()) return;

    setIsGenerating(true);
    setStepsLog([]);
    setSiteId('');
    setCrawlerReport(null);
    setSourcesUsed([]);
    setCurrentStep('Planning');

    const payload = {
      siteName,
      siteType,
      purpose,
      targetAudience,
      toneStyle,
      colorPreference,
      templateSlug: templateSlug || undefined,
      userContent,
    };

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Generation failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              try {
                const data: ProgressStep = JSON.parse(dataStr);
                setStepsLog((prev) => [...prev, data]);
                setCurrentStep(data.step);

                if (data.payload?.sources) {
                  setSourcesUsed(data.payload.sources);
                }

                if (data.step === 'Done' && data.payload?.siteId) {
                  const generatedId = data.payload.siteId;
                  setSiteId(generatedId);
                  setIframeKey((k) => k + 1);

                  // Trigger automated crawler test
                  runCrawler(generatedId);
                }
              } catch (e) {
                console.error('SSE parse error:', e);
              }
            }
          }
        }
      }
    } catch (err: any) {
      setStepsLog((prev) => [...prev, { step: 'Error', detail: err.message, timestamp: Date.now() }]);
      setCurrentStep('Error');
    } finally {
      setIsGenerating(false);
    }
  };

  const runCrawler = async (targetSiteId: string) => {
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: targetSiteId }),
      });
      const data = await res.json();
      if (res.ok && data.report) {
        setCrawlerReport(data.report);
      }
    } catch (e) {
      console.error('Crawler failed', e);
    }
  };

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinePrompt.trim() || !siteId || isRefining) return;

    setIsRefining(true);
    const instruction = refinePrompt;
    setRefinePrompt('');

    try {
      const res = await fetch(`/api/projects/${siteId}/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: instruction }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentVersion((v) => v + 1);
        setIframeKey((k) => k + 1);
        runCrawler(siteId);
      } else {
        alert(data.error || 'Refinement failed');
      }
    } catch {
      alert('Error connecting to refine API');
    } finally {
      setIsRefining(false);
    }
  };

  const handleExportZip = async () => {
    if (!siteId) return;
    window.location.href = `/api/export?siteId=${siteId}`;
  };

  return (
    <div className="min-h-screen bg-md-surface-low text-md-on-surface font-sans flex flex-col selection:bg-md-primary-container selection:text-md-on-primary-container">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-md-surface/90 backdrop-blur-md border-b border-md-outline-variant/50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-md-full hover:bg-md-surface-container text-md-on-surface-variant m3-transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center font-bold text-xs">
              <Sparkles className="w-4 h-4 text-md-primary" />
            </div>
            <span className="font-bold text-base text-md-on-surface">AI Site Builder</span>
          </div>
        </div>

        {siteId && (
          <div className="flex items-center gap-3">
            <Badge variant={crawlerReport?.status === 'PASS' ? 'primary' : 'tonal'}>
              {crawlerReport ? `Crawler: ${crawlerReport.status} (${crawlerReport.passedCount} links passed)` : 'Running Verifier...'}
            </Badge>

            <Link href={`/projects/${siteId}/edit`}>
              <Button variant="tonal" size="sm">
                <Edit3 className="w-3.5 h-3.5" />
                <span>Open Visual Editor</span>
              </Button>
            </Link>

            <Button variant="filled" size="sm" onClick={() => setShowValidationGate(true)}>
              <Download className="w-3.5 h-3.5" />
              <span>Export ZIP</span>
            </Button>
          </div>
        )}
      </header>

      {/* Main Workspace split into Intake vs Live Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane: Prompt & Parameters Form */}
        <aside className="w-full lg:w-[440px] bg-md-surface border-r border-md-outline-variant/40 p-6 overflow-y-auto space-y-6 shrink-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary">Step 1: Intake Spec</Badge>
              {templateSlug && <Badge variant="tonal">Template: {templateSlug}</Badge>}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-md-on-surface">Site Architecture Prompt</h2>
            <p className="text-xs text-md-on-surface-variant">
              Provide your business requirements or click voice input to speak in English/Telugu.
            </p>
          </div>

          <div className="space-y-4">
            <TextField
              label="Website Name / Brand"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="e.g. Hyderabad Craft Bakery"
            />

            <div>
              <label className="block text-xs font-medium text-md-on-surface-variant mb-1.5">Industry Category</label>
              <select
                value={siteType}
                onChange={(e) => setSiteType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md-sm border border-md-outline bg-md-surface-lowest text-md-on-surface text-sm outline-none m3-transition focus:border-md-primary"
              >
                <option value="Startup/SaaS">Startup / SaaS</option>
                <option value="Restaurant/Café">Restaurant / Café</option>
                <option value="Portfolio/Personal">Portfolio / Personal</option>
                <option value="E-Commerce">E-Commerce Store</option>
                <option value="Clinic/Healthcare">Clinic / Healthcare</option>
                <option value="Law Firm">Law Firm / Professional Services</option>
                <option value="Agency">Agency / Studio</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-md-on-surface-variant">Primary Goal & Content</label>
                <VoiceInputButton onTranscript={(text) => setPurpose((prev) => prev ? `${prev} ${text}` : text)} />
              </div>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={3}
                placeholder="Describe your site's target features, products, prices..."
                className="w-full px-3.5 py-2.5 rounded-md-sm border border-md-outline bg-md-surface-lowest text-md-on-surface text-sm outline-none m3-transition focus:border-md-primary resize-none placeholder:text-md-on-surface-variant/50"
              />
            </div>

            <TextField
              label="Target Audience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Local food lovers in Hyderabad"
            />

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !siteName.trim()}
              variant="filled"
              className="w-full py-3.5 font-semibold text-sm shadow-md-1 hover:shadow-md-2"
            >
              {isGenerating ? (
                <span>Autonomous AI Pipeline Running...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Build Verified Website</span>
                </>
              )}
            </Button>
          </div>

          {/* Transparent Agent Execution Logs */}
          {stepsLog.length > 0 && (
            <Card className="p-4 bg-md-surface-container space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-md-primary flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Agent Execution Log
                </span>
                <Badge variant="tonal">{currentStep}</Badge>
              </div>

              {isGenerating && <LinearProgress />}

              <div className="space-y-2 max-h-48 overflow-y-auto text-xs font-mono pr-1">
                {stepsLog.map((s, idx) => (
                  <div key={idx} className="p-2 rounded bg-md-surface border border-md-outline-variant/40 space-y-0.5">
                    <div className="flex items-center justify-between font-semibold text-md-on-surface">
                      <span>{s.step}</span>
                      <span className="text-[10px] text-md-on-surface-variant">{new Date(s.timestamp).toLocaleTimeString()}</span>
                    </div>
                    {s.detail && <p className="text-[11px] text-md-on-surface-variant">{s.detail}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </aside>

        {/* Right Pane: Sandboxed Live Preview Canvas & Control Toolbar */}
        <main className="flex-1 bg-md-surface-container-low flex flex-col justify-between overflow-hidden">
          {siteId ? (
            <>
              {/* Device Viewport Bar */}
              <div className="p-3 bg-md-surface border-b border-md-outline-variant/40 flex items-center justify-between px-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-md-on-surface-variant">Device View:</span>
                  <div className="flex items-center bg-md-surface-container p-1 rounded-md-sm border border-md-outline-variant">
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
                </div>

                <div className="flex items-center gap-3">
                  {sourcesUsed.length > 0 && (
                    <Button variant="tonal" size="sm" onClick={() => setShowSourcesModal(true)}>
                      <Search className="w-3.5 h-3.5" />
                      <span>{sourcesUsed.length} Fact Sources</span>
                    </Button>
                  )}
                  <Link href={`/preview/${siteId}`} target="_blank">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Full Window</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Sandboxed Iframe */}
              <div className="flex-1 p-4 flex justify-center items-center overflow-auto">
                <iframe
                  key={iframeKey}
                  src={`/preview/${siteId}`}
                  sandbox="allow-scripts allow-forms"
                  className={`bg-white rounded-md-lg shadow-md-2 border border-md-outline-variant m3-transition h-full ${
                    viewport === 'desktop' ? 'w-full' : viewport === 'tablet' ? 'w-[768px]' : 'w-[375px]'
                  }`}
                />
              </div>

              {/* Refinement Prompt Bar */}
              <div className="p-4 bg-md-surface border-t border-md-outline-variant/40">
                <form onSubmit={handleRefine} className="flex gap-3 max-w-4xl mx-auto">
                  <Input
                    type="text"
                    value={refinePrompt}
                    onChange={(e) => setRefinePrompt(e.target.value)}
                    placeholder="Ask AI to refine this site (e.g. Add Telugu language switcher, update hero heading)..."
                    className="flex-1 py-2.5 text-sm"
                  />
                  <Button type="submit" disabled={isRefining || !refinePrompt.trim()} variant="filled" size="sm" className="px-5 font-semibold">
                    <Send className="w-4 h-4" />
                    <span>{isRefining ? 'Refining...' : 'Refine Site'}</span>
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-md-full bg-md-surface-container flex items-center justify-center text-md-primary shadow-xs">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="max-w-md">
                <h3 className="text-xl font-bold text-md-on-surface">Ready to generate website</h3>
                <p className="text-xs text-md-on-surface-variant mt-1.5">
                  Fill in your website requirements on the left panel and click &quot;Build Verified Website&quot; to launch the AI research and generation pipeline.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Sources Citation Modal */}
      <Dialog open={showSourcesModal} onClose={() => setShowSourcesModal(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Internet Research Fact Sources</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
            {sourcesUsed.map((src, i) => (
              <div key={i} className="p-3 bg-md-surface-container rounded-md-md border border-md-outline-variant/40 space-y-1 text-xs">
                <p className="font-semibold text-md-on-surface">{src.title}</p>
                <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-md-primary underline break-all block">
                  {src.url}
                </a>
                {src.snippet && <p className="text-md-on-surface-variant text-[11px] italic">{src.snippet}</p>}
              </div>
            ))}
          </div>
          <CardFooter className="justify-end">
            <Button variant="ghost" onClick={() => setShowSourcesModal(false)}>Close</Button>
          </CardFooter>
        </DialogContent>
      </Dialog>

      {/* Human Approval / Export Checklist Gate */}
      <Dialog open={showValidationGate} onClose={() => setShowValidationGate(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Human Approval Gate before ZIP Export</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4 text-xs">
            <p className="text-md-on-surface-variant">
              Confirm your pre-flight audit checklist to unlock zero lock-in standalone ZIP download.
            </p>

            <div className="space-y-3">
              {[
                { key: 'reviewedCopy', label: 'Reviewed evidence sources and facts (U2)' },
                { key: 'testedForms', label: 'Verified interactive form fallback endpoints (U11/U12)' },
                { key: 'checkedMobileView', label: 'Checked responsive design across mobile/tablet views' },
                { key: 'confirmedSources', label: 'Confirmed zero unverified claims flag (U3)' },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-3 p-3 bg-md-surface-container rounded-md-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(checklist as any)[item.key]}
                    onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                    className="w-4 h-4 rounded border-md-outline text-md-primary"
                  />
                  <span className="font-medium text-md-on-surface">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
          <CardFooter className="justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowValidationGate(false)}>Cancel</Button>
            <Button
              variant="filled"
              disabled={!Object.values(checklist).every(Boolean)}
              onClick={handleExportZip}
              className="font-semibold"
            >
              <Download className="w-4 h-4" />
              <span>Download Standalone ZIP</span>
            </Button>
          </CardFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-md-on-surface-variant">Loading AI Builder...</div>}>
      <BuilderContent />
    </Suspense>
  );
}
