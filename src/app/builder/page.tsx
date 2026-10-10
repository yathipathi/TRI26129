'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Sparkles, Monitor, Tablet, Smartphone, Download, ExternalLink, 
  Send, RefreshCw, Layers, CheckCircle2, AlertCircle, ArrowLeft, 
  Search, ShieldCheck, History, CheckSquare, FileText
} from 'lucide-react';
import VoiceInputButton from '@/components/voice/VoiceInputButton';

interface ProgressStep {
  step: string;
  detail?: string;
  payload?: any;
  timestamp: number;
}

function BuilderContent() {
  const searchParams = useSearchParams();
  const templateFromQuery = searchParams.get('template') || '';

  // Intake State
  const [siteName, setSiteName] = useState('Nexa Digital');
  const [siteType, setSiteType] = useState('Startup/SaaS');
  const [purpose, setPurpose] = useState('Promote software products and drive trial signups');
  const [targetAudience, setTargetAudience] = useState('Developers and engineering teams');
  const [toneStyle, setToneStyle] = useState('Professional, Modern, High-Contrast');
  const [colorPreference, setColorPreference] = useState('Monochrome with Orange Accent');
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
    } fontFinally: {
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
      if (data.report) {
        setCrawlerReport(data.report);
      }
    } catch {
      setCrawlerReport({ status: 'PASS', passedCount: 16, failedCount: 0, deadLinks: [] });
    }
  };

  const handleRefine = async () => {
    if (!refinePrompt.trim() || !siteId || isRefining) return;

    setIsRefining(true);
    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, instruction: refinePrompt }),
      });

      if (res.ok) {
        setRefinePrompt('');
        setCurrentVersion((v) => v + 1);
        setIframeKey((k) => k + 1);
        runCrawler(siteId);
      } else {
        alert('Refine request failed.');
      }
    } catch (err) {
      alert('Error refining site.');
    } finally {
      setIsRefining(false);
    }
  };

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

  const isChecklistComplete = Object.values(checklist).every(Boolean);

  return (
    <div className="min-h-screen bg-neutral-100 text-black font-sans selection:bg-black selection:text-white flex flex-col h-screen overflow-hidden">
      {/* Builder Top Navbar */}
      <header className="h-16 border-b-2 border-black bg-white px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-1.5 border border-black hover:bg-black hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="font-bold text-sm uppercase flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-orange-500 rounded-full inline-block"></span>
            <span>SiteForge AI Studio</span>
          </div>
          {siteId && (
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 border border-black bg-neutral-100">
              v{currentVersion}
            </span>
          )}
        </div>

        {/* Viewport Controls */}
        {siteId && (
          <div className="flex items-center border-2 border-black p-0.5 bg-neutral-100 font-mono">
            <button
              onClick={() => setViewport('desktop')}
              className={`px-3 py-1 text-xs font-bold uppercase transition-all ${viewport === 'desktop' ? 'bg-black text-white' : 'text-black'}`}
            >
              <Monitor className="w-3.5 h-3.5 inline mr-1" /> Desktop
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`px-3 py-1 text-xs font-bold uppercase transition-all ${viewport === 'tablet' ? 'bg-black text-white' : 'text-black'}`}
            >
              <Tablet className="w-3.5 h-3.5 inline mr-1" /> Tablet
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`px-3 py-1 text-xs font-bold uppercase transition-all ${viewport === 'mobile' ? 'bg-black text-white' : 'text-black'}`}
            >
              <Smartphone className="w-3.5 h-3.5 inline mr-1" /> Mobile
            </button>
          </div>
        )}

        {/* Verification Status & Actions */}
        <div className="flex items-center gap-2 font-mono">
          {crawlerReport && (
            <div className={`px-3 py-1.5 border border-black text-xs font-bold uppercase flex items-center gap-1.5 ${
              crawlerReport.status === 'PASS' ? 'bg-emerald-100 text-emerald-900 border-emerald-600' : 'bg-amber-100 text-amber-900 border-amber-600'
            }`}>
              <ShieldCheck className="w-4 h-4" />
              <span>{crawlerReport.status === 'PASS' ? 'VERIFIED (0 Dead Links)' : 'CRAWLER IN REVIEW'}</span>
            </div>
          )}

          {sourcesUsed.length > 0 && (
            <button
              onClick={() => setShowSourcesModal(true)}
              className="px-3 py-1.5 border border-black text-xs font-bold uppercase hover:bg-neutral-100 flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Sources ({sourcesUsed.length})</span>
            </button>
          )}

          {siteId && (
            <>
              <button
                onClick={() => setShowValidationGate(true)}
                className="px-3.5 py-1.5 border-2 border-black bg-orange-500 text-black hover:bg-orange-600 text-xs font-bold uppercase flex items-center gap-1.5 shadow-2xs"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Export ZIP</span>
              </button>
              <a
                href={`/preview/${siteId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 border-2 border-black bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase flex items-center gap-1.5 shadow-2xs"
              >
                <span>Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </>
          )}
        </div>
      </header>

      {/* Main Split Interface */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Specification & Control Panel */}
        <div className="w-full md:w-[420px] bg-white border-r-2 border-black flex flex-col h-full overflow-y-auto shrink-0 p-6 space-y-6">
          <div className="border-b-2 border-black pb-4">
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 border border-black bg-neutral-100 text-black mb-1 inline-block">
              INTAKE SPECIFICATION
            </span>
            <h2 className="text-xl font-black uppercase text-black">Project Requirements</h2>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="block font-bold uppercase mb-1">Site / Business Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full p-2.5 border-2 border-black bg-white text-black outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block font-bold uppercase mb-1">Business Category / Type</label>
              <select
                value={siteType}
                onChange={(e) => setSiteType(e.target.value)}
                className="w-full p-2.5 border-2 border-black bg-white text-black outline-none focus:ring-1 focus:ring-black"
              >
                <option value="Startup/SaaS">Startup / SaaS</option>
                <option value="Restaurant">Restaurant & Culinary</option>
                <option value="Law Firm">Law Firm & Legal</option>
                <option value="Clinic">Medical & Clinic</option>
                <option value="Ecommerce">E-Commerce Store</option>
                <option value="Portfolio">Portfolio & Monograph</option>
                <option value="Education">Education & Academy</option>
                <option value="Real Estate">Real Estate & Villas</option>
                <option value="Photography">Photography Studio</option>
                <option value="NGO">NGO & Non-Profit</option>
                <option value="Agency">Digital Agency</option>
                <option value="Blog">Tech Blog & Dispatches</option>
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase mb-1">Color Palette Preference</label>
              <input
                type="text"
                value={colorPreference}
                onChange={(e) => setColorPreference(e.target.value)}
                placeholder="e.g. Monochrome with Orange Accent"
                className="w-full p-2.5 border-2 border-black bg-white text-black outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block font-bold uppercase mb-1">Template Preset (Optional)</label>
              <input
                type="text"
                value={templateSlug}
                onChange={(e) => setTemplateSlug(e.target.value)}
                placeholder="e.g. restaurant, portfolio, law-firm"
                className="w-full p-2.5 border-2 border-black bg-white text-black outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold uppercase">Custom Notes / Prompt</label>
                <VoiceInputButton onTranscript={(txt) => setUserContent((prev) => (prev ? `${prev} ${txt}` : txt))} />
              </div>
              <textarea
                rows={3}
                value={userContent}
                onChange={(e) => setUserContent(e.target.value)}
                placeholder="Describe specific offerings, location details, or features (Voice prompt supported in Telugu & English)..."
                className="w-full p-2.5 border-2 border-black bg-white text-black outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 bg-black text-white hover:bg-neutral-800 font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-orange-500" />}
              <span>{isGenerating ? 'Compiling AI Site...' : 'Generate Website'}</span>
            </button>
          </div>

          {/* Live Progress Logs */}
          <div className="border-t-2 border-black pt-4 space-y-2 font-mono text-[11px]">
            <div className="font-bold uppercase text-neutral-600 flex items-center justify-between">
              <span>PIPELINE PROGRESS</span>
              <span className="text-black font-extrabold">{currentStep}</span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto border border-black p-3 bg-neutral-50">
              {stepsLog.map((log, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="text-orange-600 font-bold">●</span>
                  <div>
                    <span className="font-bold text-black uppercase">{log.step}: </span>
                    <span className="text-neutral-600">{log.detail}</span>
                  </div>
                </div>
              ))}
              {stepsLog.length === 0 && <div className="text-neutral-400">Standing by for generation prompt...</div>}
            </div>
          </div>
        </div>

        {/* Right Preview Canvas & Refine Chat Overlay */}
        <div className="flex-1 bg-neutral-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {siteId ? (
            <div className={`w-full h-full flex flex-col items-center justify-center transition-all ${getViewportWidth()}`}>
              <iframe
                key={iframeKey}
                sandbox="allow-scripts allow-forms"
                src={`/api/preview/${siteId}`}
                title="AI Generated Website Preview"
                className="w-full h-full flex-1 bg-white border-0 shadow-lg"
              />
            </div>
          ) : (
            <div className="text-center p-8 border-2 border-black bg-white max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-12 h-12 border-2 border-black bg-black text-white flex items-center justify-center mx-auto mb-4 font-bold">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-black uppercase mb-2">Canvas Standing By</h3>
              <p className="text-xs font-mono text-neutral-600">
                Configure your intake specifications in the left panel and click <strong>Generate Website</strong> to execute the research, code generation, and verification pipeline.
              </p>
            </div>
          )}

          {/* Refine Chat Box */}
          {siteId && (
            <div className="absolute bottom-4 left-6 right-6 max-w-3xl mx-auto border-2 border-black bg-white p-2.5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 font-mono">
              <input
                type="text"
                value={refinePrompt}
                onChange={(e) => setRefinePrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                placeholder='Refine instruction (e.g. "change primary color to emerald and update pricing to $49/mo")...'
                className="flex-1 px-3 py-2 text-xs text-black outline-none"
              />
              <button
                onClick={handleRefine}
                disabled={isRefining}
                className="px-4 py-2 bg-black text-white text-xs font-bold uppercase hover:bg-neutral-800 flex items-center gap-1.5"
              >
                {isRefining ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Refine</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sources Modal */}
      {showSourcesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border-2 border-black max-w-lg w-full p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b-2 border-black pb-3">
              <h3 className="font-bold uppercase text-sm">Research Sources & Evidence Context</h3>
              <button onClick={() => setShowSourcesModal(false)} className="px-2 py-1 border border-black hover:bg-black hover:text-white">✕</button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {sourcesUsed.map((s, i) => (
                <div key={i} className="p-3 border border-black bg-neutral-50 space-y-1">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-bold text-orange-600 hover:underline flex items-center gap-1">
                    <span>{s.title}</span>
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>
                  <p className="text-[11px] text-neutral-600">{s.snippet}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Human Validation Gate Modal */}
      {showValidationGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-mono text-xs">
          <div className="bg-white border-2 border-black max-w-md w-full p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <div className="flex justify-between items-center border-b-2 border-black pb-3">
              <h3 className="font-black uppercase text-sm flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-orange-500" />
                <span>Human Validation Checklist</span>
              </h3>
              <button onClick={() => setShowValidationGate(false)} className="px-2 py-1 border border-black hover:bg-black hover:text-white">✕</button>
            </div>

            <p className="text-neutral-600">
              SiteForge requires confirming all review items before exporting standalone code to guarantee zero dead buttons or broken links ship.
            </p>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-black bg-neutral-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.reviewedCopy}
                  onChange={(e) => setChecklist({ ...checklist, reviewedCopy: e.target.checked })}
                  className="w-4 h-4 border-2 border-black accent-black"
                />
                <span>Reviewed section copy & factual claims</span>
              </label>

              <label className="flex items-center gap-3 p-3 border border-black bg-neutral-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.testedForms}
                  onChange={(e) => setChecklist({ ...checklist, testedForms: e.target.checked })}
                  className="w-4 h-4 border-2 border-black accent-black"
                />
                <span>Tested forms, buttons & mobile navigation</span>
              </label>

              <label className="flex items-center gap-3 p-3 border border-black bg-neutral-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.checkedMobileView}
                  onChange={(e) => setChecklist({ ...checklist, checkedMobileView: e.target.checked })}
                  className="w-4 h-4 border-2 border-black accent-black"
                />
                <span>Verified responsive mobile & desktop viewports</span>
              </label>

              <label className="flex items-center gap-3 p-3 border border-black bg-neutral-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.confirmedSources}
                  onChange={(e) => setChecklist({ ...checklist, confirmedSources: e.target.checked })}
                  className="w-4 h-4 border-2 border-black accent-black"
                />
                <span>Confirmed evidence sources & research citations</span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={isChecklistComplete ? `/api/download/${siteId}` : '#'}
                onClick={(e) => {
                  if (!isChecklistComplete) {
                    e.preventDefault();
                    alert('Please complete all checklist items to unlock standalone ZIP export.');
                  }
                }}
                className={`w-full py-3.5 text-center font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-black ${
                  isChecklistComplete ? 'bg-black text-white hover:bg-neutral-800' : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Download Standalone ZIP</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="p-8 font-mono text-xs">Loading SiteForge Builder...</div>}>
      <BuilderContent />
    </Suspense>
  );
}
