'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme-provider';
import { 
  Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Layers, FileText, 
  Search, Lock, Download, Moon, Sun, HelpCircle, ExternalLink, RefreshCw, 
  ChevronDown, BookOpen, User, Check, Globe, Code, AlertTriangle, Play,
  Smartphone, Monitor, Tablet, Terminal, Cpu, Database, Eye, Zap, Sliders,
  CheckSquare, ArrowUpRight, Copy, CheckCheck, RefreshCcw, FileCode
} from 'lucide-react';

import {
  Button, Card, CardHeader, CardContent, CardFooter,
  Badge, Chip, Input, Dialog, DialogContent, DialogHeader, DialogTitle,
  Avatar, AvatarFallback, LinearProgress
} from '@/components/ui';

const DICTIONARIES = {
  en: {
    heroBadge: "Autonomous Verified AI Website Builder v2.4",
    heroTitlePrefix: "Build websites you can ",
    heroTitleHighlight: "trust",
    heroTitleSuffix: ", verified down to the byte.",
    heroSub: "Describe your vision. SiteForge executes real-time web research, synthesizes a validated JSON spec, builds a multi-page site, and Playwright-tests every link before export.",
    getStarted: "Start Building Free",
    signIn: "Sign in",
    liveDemo: "Try Interactive Demo",
    trustItems: [
      "Automated Playwright Crawl Test",
      "Grounded RAG Citations",
      "SHA-256 Zero-Collateral Proof",
      "1-Click Offline ZIP Export"
    ],
    sampleNotice: "Interactive Studio Sandbox — 100% Client-Side Simulation",
    tabPrompt: "1. Prompt & Research",
    tabPreview: "2. Live Preview Canvas",
    tabEvidence: "3. Evidence & RAG Claims",
    step1Title: "1. Describe & Research",
    step1Desc: "SiteForge scrapes live web sources and synthesizes structured business facts into a zod-validated spec.",
    step2Title: "2. Visual Studio & Locking",
    step2Desc: "Point-and-click to edit text, swap theme tokens, lock sections, or run scope-bounded AI edits.",
    step3Title: "3. Playwright Verification",
    step3Desc: "Headless browser crawls every page, CTA button, and form at 375px and 1280px viewports.",
    step4Title: "4. No-Lockin ZIP Export",
    step4Desc: "Download standard offline-ready HTML, CSS, JS, and JSON spec files with zero vendor lock-in.",
  },
  te: {
    heroBadge: "అటానమస్ వెరిఫైడ్ AI వెబ్‌సైట్ బిల్డర్ v2.4",
    heroTitlePrefix: "మీరు విశ్వసించగల ",
    heroTitleHighlight: "వెబ్‌సైట్‌ను",
    heroTitleSuffix: " నిర్మించండి, నిరూపణను చూడండి.",
    heroSub: "మీ ఆలోచనను వివరించండి. SiteForge వెబ్‌లో పరిశోధించి, ఆకృతిని నిర్ధారించి, మూలాలతో ఆధారాలను చూపిస్తుంది.",
    getStarted: "ఉచితంగా ప్రారంభించండి",
    signIn: "లాగిన్ అవ్వండి",
    liveDemo: "లైవ్ డెమో చూడండి",
    trustItems: [
      "ప్లేరైట్ బ్రౌజర్ పరీక్ష",
      "నిజమైన ఆధారాల లింక్‌లు",
      "SHA-256 భద్రతా ప్రూఫ్",
      "ఉచిత ZIP డౌన్‌లోడ్"
    ],
    sampleNotice: "ఇంటరాక్టివ్ స్టూడియో శాంపిల్ — 100% క్లయింట్-సైడ్ సిమ్యులేషన్",
    tabPrompt: "1. ప్రాంప్ట్ & రీసెర్చ్",
    tabPreview: "2. లైవ్ ప్రివ్యూ క్యాన్వాస్",
    tabEvidence: "3. సాక్ష్యాలు & మూలాలు",
    step1Title: "1. వివరణ & పరిశోధన",
    step1Desc: "SiteForge వెబ్ ఆధారాల నుండి విషయాలను సేకరించి పక్కా ఆకృతిని తయారుచేస్తుంది.",
    step2Title: "2. విజువల్ ఎడిటర్ & లాకింగ్",
    step2Desc: "పాయింట్-అండ్-క్లిక్ ద్వారా వచనాన్ని సులభంగా మార్చండి లేదా విభాగాలను లాక్ చేయండి.",
    step3Title: "3. ప్లాట్‌ఫారమ్ ధృవీకరణ",
    step3Desc: "ఎగుమతి చేయడానికి ముందు లింక్‌లు మరియు ఫారమ్‌లు బ్రౌజర్ ద్వారా తనిఖీ చేయబడతాయి.",
    step4Title: "4. ఉచిత ZIP ఎగుమతి",
    step4Desc: "పూర్తి HTML/CSS/JS కోడ్‌ను డౌన్‌లోడ్ చేసుకోండి.",
  },
  hi: {
    heroBadge: "स्वायत्त सत्यापित AI वेबसाइट बिल्डर v2.4",
    heroTitlePrefix: "एक ऐसी वेबसाइट बनाएं जिस पर आप ",
    heroTitleHighlight: "भरोसा",
    heroTitleSuffix: " कर सकें, और प्रमाण देखें।",
    heroSub: "अपनी आवश्यकता बताएं। SiteForge वेब पर शोध करता है, संरचना सत्यापित करता है, और स्रोतों के साथ तथ्यों की पुष्टि करता है।",
    getStarted: "मुफ्त में शुरू करें",
    signIn: "साइन इन करें",
    liveDemo: "लाइव डेमो देखें",
    trustItems: [
      "प्लेराइट स्वचालित परीक्षण",
      "सत्यापित स्रोत उद्धरण",
      "SHA-256 सुरक्षा प्रमाण",
      "1-क्लिक ज़िप निर्यात"
    ],
    sampleNotice: "इंटरएक्टिव स्टूडियो सैंपल — 100% क्लाइंट-साइड सिमुलेशन",
    tabPrompt: "1. प्रॉम्प्ट और शोध",
    tabPreview: "2. लाइव कैनवास पूर्वावलोकन",
    tabEvidence: "3. साक्ष्य और स्रोत",
    step1Title: "1. वर्णन और शोध",
    step1Desc: "SiteForge वेब स्रोतों से तथ्य एकत्र करता है और एक मान्य स्पेक बनाता है।",
    step2Title: "2. विज़ुअल स्टूडियो और लॉकिंग",
    step2Desc: "पॉइंट-एंड-क्लिक द्वारा टेक्स्ट संपादित करें या अनुभागों को लॉक करें।",
    step3Title: "3. स्वचालित प्लेराइट जांच",
    step3Desc: "निर्यात से पहले स्वचालित परीक्षण हर लिंक और फॉर्म की जांच करता है।",
    step4Title: "4. नो-लॉकइन ज़िप निर्यात",
    step4Desc: "मानक ऑफ़लाइन HTML, CSS और JS फ़ाइलें डाउनलोड करें।",
  }
};

const SAMPLE_PROMPTS = [
  "SaaS AI Developer Copilot landing page with pricing tiers and doc search",
  "Modern Tech Platform with feature showcase, customer reviews & contact form",
  "Aesthetics Medical Clinic with online appointment booking & patient intake"
];

export default function MasterLandingPage() {
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [lang, setLang] = useState<'en' | 'te' | 'hi'>('en');
  const t = DICTIONARIES[lang];

  // Interactive Demo Studio State
  const [activeTab, setActiveTab] = useState<'prompt' | 'preview' | 'evidence'>('preview');
  const [promptText, setPromptText] = useState(SAMPLE_PROMPTS[0]);
  const [demoViewport, setDemoViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [demoState, setDemoState] = useState<'idle' | 'generating' | 'ready'>('ready');
  const [demoProgress, setDemoProgress] = useState(100);

  // Comparison Switcher State
  const [comparisonMode, setComparisonMode] = useState<'problem' | 'siteforge'>('siteforge');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [faqSearch, setFaqSearch] = useState('');

  const triggerDemoRun = (newPrompt?: string) => {
    if (newPrompt) setPromptText(newPrompt);
    setDemoState('generating');
    setDemoProgress(15);
    setActiveTab('prompt');

    setTimeout(() => setDemoProgress(45), 400);
    setTimeout(() => setDemoProgress(75), 800);
    setTimeout(() => {
      setDemoProgress(100);
      setDemoState('ready');
      setActiveTab('preview');
    }, 1200);
  };

  const faqItems = [
    {
      q: "Is SiteForge free to use?",
      a: "Yes. SiteForge uses free-tier LLM integrations (Google Gemini 2.0 Flash, Groq, OpenRouter) with local fallback compilers. You can build, edit, verify, and export websites without entering a credit card."
    },
    {
      q: "Can I export my website code without vendor lock-in?",
      a: "Yes. SiteForge produces standard, offline-ready HTML5, Tailwind CSS, JavaScript, and JSON SiteSpec files inside a clean ZIP package. You own 100% of the exported code."
    },
    {
      q: "Does it support Telugu and Hindi languages?",
      a: "Yes. SiteForge features full multi-language site generation and translation support for English, Telugu (తెలుగు), and Hindi (हिन्दी) with native typography fallbacks."
    },
    {
      q: "How does the Playwright verification engine work?",
      a: "Before exporting, SiteForge executes automated Playwright browser instances checking navigation target links, contact forms, interactive modals, and WCAG contrast ratios across mobile (375px) and desktop (1280px) viewports."
    },
    {
      q: "How does SiteForge prevent hallucinations and false claims?",
      a: "All generated claims carry verified source citations linking to uploaded Knowledge Library PDFs/notes or web research snippets. Unbacked claims are flagged as 'Needs review'."
    },
    {
      q: "What is SHA-256 Zero-Collateral Damage Proof?",
      a: "When you edit a specific section manually or via AI, SiteForge computes SHA-256 section hashes before and after. It mathematically proves that non-target sections remain 100% byte-identical."
    }
  ].filter(f => f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase()));

  return (
    <div className="min-h-screen bg-md-surface-low text-md-on-surface flex flex-col font-sans selection:bg-md-primary-container selection:text-md-on-primary-container">
      {/* Schema.org Metadata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "SiteForge Verified AI Website Builder",
            "operatingSystem": "Web",
            "applicationCategory": "DeveloperApplication",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "description": "Autonomous verified AI website builder with Playwright crawl testing, RAG citations, and zero-collateral visual editing."
          })
        }}
      />

      {/* Skip Navigation Link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-md-primary focus:text-md-on-primary focus:z-50">
        Skip to main content
      </a>

      {/* ─── Sticky Master App Bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-md-surface/85 backdrop-blur-lg border-b border-md-outline-variant/40 px-4 md:px-8 py-3.5 flex items-center justify-between m3-transition">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-md-full bg-gradient-to-br from-md-primary-container via-md-surface to-md-secondary-container text-md-on-primary-container flex items-center justify-center font-bold shadow-xs group-hover:scale-105 m3-transition">
            <Sparkles className="w-5 h-5 text-md-primary" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight block text-md-on-surface leading-none">SiteForge</span>
            <span className="text-[10px] font-mono tracking-wider text-md-primary uppercase">Verified Studio</span>
          </div>
        </Link>

        {/* Navigation Anchors */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-md-on-surface-variant">
          <a href="#studio-demo" className="hover:text-md-primary m3-transition">Live Demo</a>
          <a href="#workflow" className="hover:text-md-primary m3-transition">Workflow</a>
          <a href="#comparison" className="hover:text-md-primary m3-transition">Why SiteForge</a>
          <a href="#deep-dives" className="hover:text-md-primary m3-transition">Features</a>
          <a href="#students" className="hover:text-md-primary m3-transition">For Students</a>
          <a href="#faq" className="hover:text-md-primary m3-transition">FAQ</a>
        </nav>

        {/* Right Header Toolbar */}
        <div className="flex items-center gap-3">
          {/* Language Picker Dropdown */}
          <div className="flex items-center gap-1 bg-md-surface-container px-2 py-1 rounded-md-full text-xs border border-md-outline-variant/40 shadow-xs">
            <Globe className="w-3.5 h-3.5 text-md-primary" />
            <button onClick={() => setLang('en')} className={`px-2 py-0.5 rounded-md-xs font-bold transition-all ${lang === 'en' ? 'bg-md-primary text-md-on-primary shadow-xs' : 'text-md-on-surface-variant hover:text-md-on-surface'}`}>EN</button>
            <button onClick={() => setLang('te')} className={`px-2 py-0.5 rounded-md-xs font-bold transition-all ${lang === 'te' ? 'bg-md-primary text-md-on-primary shadow-xs' : 'text-md-on-surface-variant hover:text-md-on-surface'}`}>తెలుగు</button>
            <button onClick={() => setLang('hi')} className={`px-2 py-0.5 rounded-md-xs font-bold transition-all ${lang === 'hi' ? 'bg-md-primary text-md-on-primary shadow-xs' : 'text-md-on-surface-variant hover:text-md-on-surface'}`}>हिन्दी</button>
          </div>

          {/* Theme Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md-full hover:bg-md-surface-container text-md-on-surface-variant m3-transition cursor-pointer"
            title="Toggle Light / Dark Theme"
          >
            {resolvedTheme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <Link href="/login" className="text-xs font-bold px-3 py-2 text-md-on-surface-variant hover:text-md-on-surface hidden sm:inline-block m3-transition">
            {t.signIn}
          </Link>

          <Link href="/signup" className="px-5 py-2.5 bg-md-primary text-md-on-primary text-xs font-bold rounded-md-full shadow-md-1 hover:shadow-md-2 hover:scale-[1.02] m3-transition flex items-center gap-1.5">
            <span>{t.getStarted}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ─── Main Marketing Body ─────────────────────────────────────────── */}
      <main id="main-content" className="flex-1 space-y-24 pb-24">
        
        {/* 1. HERO SECTION */}
        <section className="pt-16 md:pt-24 px-4 md:px-8 max-w-7xl mx-auto text-center space-y-10">
          {/* Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md-full bg-md-primary-container/80 text-md-on-primary-container text-xs font-semibold border border-md-primary/30 shadow-xs animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-mono">{t.heroBadge}</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-md-on-surface max-w-5xl mx-auto leading-[1.08]">
            {t.heroTitlePrefix}
            <span className="bg-gradient-to-r from-md-primary via-orange-500 to-amber-500 bg-clip-text text-transparent px-1">
              {t.heroTitleHighlight}
            </span>
            {t.heroTitleSuffix}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-md-on-surface-variant max-w-3xl mx-auto leading-relaxed font-normal">
            {t.heroSub}
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-md-primary text-md-on-primary font-bold text-sm rounded-md-full shadow-md-2 hover:shadow-md-3 hover:scale-[1.02] m3-transition flex items-center justify-center gap-2.5"
            >
              <span>{t.getStarted}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#studio-demo"
              className="w-full sm:w-auto px-7 py-4 bg-md-surface-container border border-md-outline-variant/80 text-md-on-surface font-semibold text-sm rounded-md-full hover:bg-md-surface-container-high m3-transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-md-primary fill-md-primary" />
              <span>{t.liveDemo}</span>
            </a>
          </div>

          {/* Trust Guarantees Row */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-md-on-surface-variant font-medium">
            {t.trustItems.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* ─── 2. INTERACTIVE STUDIO DEMO PLAYGROUND ────────────────────── */}
          <div id="studio-demo" className="pt-8 scroll-mt-24">
            <div className="bg-md-surface border border-md-outline-variant/60 rounded-md-2xl shadow-md-3 overflow-hidden text-left max-w-6xl mx-auto">
              
              {/* Top Studio Chrome Header Bar */}
              <div className="bg-md-surface-container px-4 py-3 border-b border-md-outline-variant/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono font-bold text-md-on-surface">SiteForge Studio Playground</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-mono px-2 py-0.5 rounded-full font-bold uppercase">Live Interactive</span>
                </div>

                {/* Workspace Mode Tabs */}
                <div className="flex items-center gap-1 bg-md-surface p-1 rounded-md-lg border border-md-outline-variant/40 text-xs w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab('prompt')}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md-sm font-semibold m3-transition flex items-center justify-center gap-1.5 ${
                      activeTab === 'prompt' ? 'bg-md-primary-container text-md-on-primary-container font-bold' : 'text-md-on-surface-variant hover:text-md-on-surface'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>{t.tabPrompt}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md-sm font-semibold m3-transition flex items-center justify-center gap-1.5 ${
                      activeTab === 'preview' ? 'bg-md-primary-container text-md-on-primary-container font-bold' : 'text-md-on-surface-variant hover:text-md-on-surface'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>{t.tabPreview}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('evidence')}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md-sm font-semibold m3-transition flex items-center justify-center gap-1.5 ${
                      activeTab === 'evidence' ? 'bg-md-primary-container text-md-on-primary-container font-bold' : 'text-md-on-surface-variant hover:text-md-on-surface'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t.tabEvidence}</span>
                  </button>
                </div>
              </div>

              {/* Playground Content Area */}
              <div className="p-6 space-y-6">
                
                {/* TAB 1: Prompt & Research */}
                {activeTab === 'prompt' && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-md-on-surface-variant">
                        <span>Input Prompt / Business Requirements:</span>
                        <span className="text-md-primary">Tavily Web Search + Gemini 2.0 Flash</span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={promptText}
                          onChange={(e) => setPromptText(e.target.value)}
                          placeholder="Describe your site vision..."
                          className="flex-1 px-4 py-3 rounded-md-lg bg-md-surface-container border border-md-outline-variant text-sm text-md-on-surface outline-none focus:border-md-primary font-sans"
                        />
                        <button
                          onClick={() => triggerDemoRun()}
                          disabled={demoState === 'generating'}
                          className="px-6 py-3 bg-md-primary text-md-on-primary text-xs font-bold rounded-md-lg hover:opacity-90 disabled:opacity-50 m3-transition flex items-center justify-center gap-2 shrink-0"
                        >
                          <Zap className="w-4 h-4" />
                          <span>{demoState === 'generating' ? 'Synthesizing...' : 'Synthesize Spec'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Preset Chips */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-md-on-surface-variant font-medium">Try Preset:</span>
                      {SAMPLE_PROMPTS.map((p) => (
                        <button
                          key={p}
                          onClick={() => triggerDemoRun(p)}
                          className="text-xs px-3 py-1 rounded-md-full bg-md-surface-container-high border border-md-outline-variant/40 hover:border-md-primary text-md-on-surface truncate max-w-xs m3-transition cursor-pointer"
                        >
                          {p.split(' ')[0]}...
                        </button>
                      ))}
                    </div>

                    {/* Stream Log Visualization */}
                    <div className="p-4 rounded-md-lg bg-black text-emerald-400 font-mono text-xs space-y-2 border border-neutral-800 shadow-inner">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2 text-[11px] text-neutral-400">
                        <span>SSE STREAMLOG LOGS</span>
                        <span>PROGRESS: {demoProgress}%</span>
                      </div>
                      <p>✓ Web Research: Fetched 3 sources from Tavily API</p>
                      <p>✓ Zod Schema: Validated SiteSpec & PageSpec contract</p>
                      <p>✓ Multi-Page Compiler: Generated index.html, menu.html, about.html</p>
                      <p className="text-amber-400">✓ Playwright Engine: 100% link & form verification passed</p>
                    </div>
                  </div>
                )}

                {/* TAB 2: Live Preview Canvas */}
                {activeTab === 'preview' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs border-b border-md-outline-variant/30 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-md-on-surface">Interactive Canvas Viewport:</span>
                        <span className="text-md-on-surface-variant text-[11px]">Sandboxed iframe iframe bridge script active</span>
                      </div>

                      {/* Breakpoint Viewport Switcher */}
                      <div className="flex items-center bg-md-surface-container p-1 rounded-md-sm border border-md-outline-variant/40">
                        <button
                          onClick={() => setDemoViewport('desktop')}
                          className={`px-2.5 py-1 rounded-md-xs text-xs font-semibold flex items-center gap-1 ${demoViewport === 'desktop' ? 'bg-md-primary text-md-on-primary' : 'text-md-on-surface-variant'}`}
                        >
                          <Monitor className="w-3.5 h-3.5" />
                          <span>1280px</span>
                        </button>

                        <button
                          onClick={() => setDemoViewport('tablet')}
                          className={`px-2.5 py-1 rounded-md-xs text-xs font-semibold flex items-center gap-1 ${demoViewport === 'tablet' ? 'bg-md-primary text-md-on-primary' : 'text-md-on-surface-variant'}`}
                        >
                          <Tablet className="w-3.5 h-3.5" />
                          <span>768px</span>
                        </button>

                        <button
                          onClick={() => setDemoViewport('mobile')}
                          className={`px-2.5 py-1 rounded-md-xs text-xs font-semibold flex items-center gap-1 ${demoViewport === 'mobile' ? 'bg-md-primary text-md-on-primary' : 'text-md-on-surface-variant'}`}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>375px</span>
                        </button>
                      </div>
                    </div>

                    {/* Resizable Canvas Wrapper */}
                    <div className="flex justify-center bg-neutral-900 p-4 rounded-md-xl border border-md-outline-variant/60">
                      <div
                        className={`transition-all duration-300 bg-white rounded-md-lg overflow-hidden shadow-2xl h-[420px] ${
                          demoViewport === 'mobile' ? 'w-[375px]' : demoViewport === 'tablet' ? 'w-[768px]' : 'w-full'
                        }`}
                      >
                        <iframe
                          src="/api/preview/demo"
                          title="SiteForge Live Canvas Preview"
                          sandbox="allow-scripts allow-forms"
                          className="w-full h-full border-0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Evidence & RAG Claims */}
                {activeTab === 'evidence' && (
                  <div className="space-y-4 animate-fadeIn text-xs">
                    <div className="p-4 rounded-md-lg bg-md-surface-container border border-md-outline-variant/40 space-y-3">
                      <div className="flex items-center justify-between font-bold text-md-on-surface">
                        <span className="flex items-center gap-2 text-md-primary">
                          <FileText className="w-4 h-4" />
                          <span>Knowledge Source: Telangana Culinary History Guide (PDF)</span>
                        </span>
                        <Badge variant="primary">Grounding Verified</Badge>
                      </div>
                      <p className="text-md-on-surface-variant leading-relaxed">
                        &quot;Osmania biscuits and Irani Chai are iconic culinary symbols of Hyderabad... Baked in traditional firewood clay ovens to achieve crisp golden crusts.&quot;
                      </p>
                      <div className="pt-2 border-t border-md-outline-variant/30 flex items-center justify-between text-[11px] text-md-on-surface-variant font-mono">
                        <span>Matched Chunk ID: #chk-telangana-88</span>
                        <span>Confidence: High (98.4%)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-md-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 space-y-1">
                        <p className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Grounded Claim #1</span>
                        </p>
                        <p className="text-[11px]">Firewood clay ovens for Osmania biscuits</p>
                      </div>

                      <div className="p-3.5 rounded-md-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 space-y-1">
                        <p className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Grounded Claim #2</span>
                        </p>
                        <p className="text-[11px]">Irani Chai brewed with buffalo milk & spices</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. 4-STEP WORKFLOW CARDS ───────────────────────────────────── */}
        <section id="workflow" className="py-16 px-4 md:px-8 max-w-7xl mx-auto space-y-12 scroll-mt-24">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">How SiteForge works in four steps</h2>
            <p className="text-sm md:text-base text-md-on-surface-variant max-w-2xl mx-auto">
              From input specification to verified offline code export with zero vendor lock-in.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-md-2xl bg-md-surface border border-md-outline-variant/60 space-y-4 hover:border-md-primary m3-transition group">
              <div className="w-12 h-12 rounded-md-full bg-md-primary-container text-md-primary flex items-center justify-center font-bold text-lg group-hover:scale-110 m3-transition">
                01
              </div>
              <h3 className="font-bold text-lg text-md-on-surface">{t.step1Title}</h3>
              <p className="text-xs text-md-on-surface-variant leading-relaxed">{t.step1Desc}</p>
            </div>

            <div className="p-6 rounded-md-2xl bg-md-surface border border-md-outline-variant/60 space-y-4 hover:border-md-primary m3-transition group">
              <div className="w-12 h-12 rounded-md-full bg-md-secondary-container text-md-secondary flex items-center justify-center font-bold text-lg group-hover:scale-110 m3-transition">
                02
              </div>
              <h3 className="font-bold text-lg text-md-on-surface">{t.step2Title}</h3>
              <p className="text-xs text-md-on-surface-variant leading-relaxed">{t.step2Desc}</p>
            </div>

            <div className="p-6 rounded-md-2xl bg-md-surface border border-md-outline-variant/60 space-y-4 hover:border-md-primary m3-transition group">
              <div className="w-12 h-12 rounded-md-full bg-md-tertiary-container text-md-tertiary flex items-center justify-center font-bold text-lg group-hover:scale-110 m3-transition">
                03
              </div>
              <h3 className="font-bold text-lg text-md-on-surface">{t.step3Title}</h3>
              <p className="text-xs text-md-on-surface-variant leading-relaxed">{t.step3Desc}</p>
            </div>

            <div className="p-6 rounded-md-2xl bg-md-surface border border-md-outline-variant/60 space-y-4 hover:border-md-primary m3-transition group">
              <div className="w-12 h-12 rounded-md-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-lg group-hover:scale-110 m3-transition">
                04
              </div>
              <h3 className="font-bold text-lg text-md-on-surface">{t.step4Title}</h3>
              <p className="text-xs text-md-on-surface-variant leading-relaxed">{t.step4Desc}</p>
            </div>
          </div>
        </section>

        {/* ─── 4. "THE PROBLEM, HONESTLY" COMPARISON ───────────────────────── */}
        <section id="comparison" className="py-16 px-4 md:px-8 max-w-6xl mx-auto space-y-12 scroll-mt-24">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">The problem with AI website builders, solved</h2>
            <p className="text-sm md:text-base text-md-on-surface-variant max-w-2xl mx-auto">
              We engineered SiteForge to eliminate hallucinations, broken code, and unintended side-effects.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-md-2xl bg-md-surface border border-md-outline-variant/60 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="px-3 py-1 rounded-md-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold w-fit">
                  PROBLEM 1: HALLUCINATED FACTS
                </div>
                <h3 className="text-xl font-bold">Unverified Claims</h3>
                <p className="text-xs text-md-on-surface-variant leading-relaxed">
                  Generic AI website builders invent dummy phone numbers, fake addresses, and unbacked corporate awards.
                </p>
              </div>
              <div className="p-4 rounded-md-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SiteForge Fix: Grounded RAG Citations</span>
                </p>
                <p className="text-[11px]">All claim fields carry source citations or an explicit &quot;Needs review&quot; flag.</p>
              </div>
            </div>

            <div className="p-8 rounded-md-2xl bg-md-surface border border-md-outline-variant/60 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="px-3 py-1 rounded-md-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold w-fit">
                  PROBLEM 2: BROKEN LINKS
                </div>
                <h3 className="text-xl font-bold">Dead Buttons & 404 Pages</h3>
                <p className="text-xs text-md-on-surface-variant leading-relaxed">
                  Generated code frequently contains unlinked CTA buttons, missing subpages, and non-functional forms.
                </p>
              </div>
              <div className="p-4 rounded-md-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SiteForge Fix: Playwright Crawl Test</span>
                </p>
                <p className="text-[11px]">Headless browser crawls every page, button, and form before export is granted.</p>
              </div>
            </div>

            <div className="p-8 rounded-md-2xl bg-md-surface border border-md-outline-variant/60 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="px-3 py-1 rounded-md-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold w-fit">
                  PROBLEM 3: OVERWRITE DAMAGE
                </div>
                <h3 className="text-xl font-bold">Unintended Side Effects</h3>
                <p className="text-xs text-md-on-surface-variant leading-relaxed">
                  Prompting the AI to edit one section often mutates or breaks adjacent, perfectly styled sections.
                </p>
              </div>
              <div className="p-4 rounded-md-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SiteForge Fix: SHA-256 Hash Proof</span>
                </p>
                <p className="text-[11px]">Computes hashes before/after edit; asserts non-target sections are byte-identical.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 5. FEATURE DEEP-DIVES ───────────────────────────────────────── */}
        <section id="deep-dives" className="py-16 px-4 md:px-8 max-w-7xl mx-auto space-y-20 scroll-mt-24">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Core Architecture & Tools</h2>
            <p className="text-sm md:text-base text-md-on-surface-variant">Built for precision control, grounding, and developer verification.</p>
          </div>

          {/* Deep Dive 1: Verified Working Engine */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-md-xl bg-md-primary-container text-md-primary flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-md-on-surface">1. Verified Working Engine</h3>
              <p className="text-xs md:text-sm text-md-on-surface-variant leading-relaxed">
                Before permitting export, SiteForge runs automated Playwright browser tests across all generated pages. It validates internal routing, form submissions, accessibility contrast, and responsive viewports.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero broken links or dead buttons guaranteed before export.</span>
              </div>
            </div>

            <div className="p-6 rounded-md-2xl bg-black text-emerald-400 font-mono text-xs space-y-3 border border-neutral-800 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3 text-neutral-400 font-bold">
                <span>[Playwright Engine Output]</span>
                <span className="text-emerald-400">VERIFIED PASS</span>
              </div>
              <p>✓ index.html ─── 200 OK (Desktop 1280px & Mobile 375px)</p>
              <p>✓ menu.html ──── 200 OK (Interactive items verified)</p>
              <p>✓ contact.html ─ 200 OK (Form submit handler validated)</p>
              <p className="text-amber-400">✓ Contrast check: Passed WCAG 2.2 AA ratios across all sections</p>
            </div>
          </div>

          {/* Deep Dive 2: Student Knowledge Library */}
          <div id="students" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center scroll-mt-24">
            <div className="p-6 rounded-md-2xl bg-md-surface border border-md-outline-variant/60 space-y-4 font-mono text-xs order-2 lg:order-1">
              <div className="flex items-center justify-between border-b border-md-outline-variant/30 pb-3 font-bold text-md-primary">
                <span>[Knowledge Library RAG]</span>
                <Badge variant="primary">PDF Ingestion Ready</Badge>
              </div>
              <p className="text-md-on-surface-variant">Source File: Telangana_Culinary_Guide.pdf</p>
              <p className="text-md-on-surface">Excerpt: &quot;Osmania biscuits were named after Mir Osman Ali Khan...&quot;</p>
              <div className="p-3 rounded-md-lg bg-md-surface-container border border-md-outline-variant/40 space-y-1">
                <span className="font-bold text-md-primary block">Generated Flashcard #1</span>
                <span className="text-md-on-surface-variant">Q: Who inspired the Osmania biscuit recipe?</span>
                <span className="text-emerald-600 block font-semibold">✓ Grounded Source Citation [Page 14]</span>
              </div>
            </div>

            <div className="space-y-5 order-1 lg:order-2">
              <div className="w-12 h-12 rounded-md-xl bg-md-secondary-container text-md-secondary flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-md-on-surface">2. Knowledge Library for Students</h3>
              <p className="text-xs md:text-sm text-md-on-surface-variant leading-relaxed">
                Students and researchers can upload PDFs, notes, or articles. SiteForge constructs study guides, quizzes, and revision sites grounded strictly in uploaded documents with exact citations.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-md-secondary">
                <CheckCircle2 className="w-4 h-4" />
                <span>Displays &quot;Not found in sources&quot; instead of inventing answers.</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 6. AUDIENCE SECTIONS ─────────────────────────────────────────── */}
        <section className="py-16 px-4 md:px-8 max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Who SiteForge is built for</h2>
            <p className="text-sm md:text-base text-md-on-surface-variant">Role-based features tailored for accuracy, speed, and ownership.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-md-2xl bg-md-surface border border-md-outline-variant/60 space-y-4">
              <div className="p-3 w-fit rounded-md-xl bg-md-primary-container text-md-primary font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Students & Educators</h3>
              <p className="text-xs text-md-on-surface-variant leading-relaxed">
                Upload lecture notes and research papers to auto-generate study sites, revision flashcards, and quizzes with source citations.
              </p>
            </div>

            <div className="p-8 rounded-md-2xl bg-md-surface border border-md-outline-variant/60 space-y-4">
              <div className="p-3 w-fit rounded-md-xl bg-md-secondary-container text-md-secondary font-bold">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Freelancers & Agencies</h3>
              <p className="text-xs text-md-on-surface-variant leading-relaxed">
                Build multi-page client websites in minutes with point-and-click editing, section locking, and 1-click offline ZIP export.
              </p>
            </div>

            <div className="p-8 rounded-md-2xl bg-md-surface border border-md-outline-variant/60 space-y-4">
              <div className="p-3 w-fit rounded-md-xl bg-md-tertiary-container text-md-tertiary font-bold">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Template Authors</h3>
              <p className="text-xs text-md-on-surface-variant leading-relaxed">
                Create structured template galleries with locked design tokens, predefined component props, and guided user workflows.
              </p>
            </div>
          </div>
        </section>

        {/* ─── 7. FAQ ACCORDION WITH SEARCH ─────────────────────────────────── */}
        <section id="faq" className="py-16 px-4 md:px-8 max-w-4xl mx-auto space-y-8 scroll-mt-24">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm md:text-base text-md-on-surface-variant">Honest answers about data, export, and verification features.</p>
          </div>

          {/* Search FAQ */}
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-md-on-surface-variant" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Search questions (e.g. export, free, Telugu)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-md-full bg-md-surface-container border border-md-outline-variant text-sm outline-none focus:border-md-primary"
            />
          </div>

          <div className="space-y-4">
            {faqItems.map((faq, idx) => (
              <div key={faq.q} className="border border-md-outline-variant/60 rounded-md-xl bg-md-surface overflow-hidden m3-transition">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left font-bold text-sm flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 m3-transition ${openFaq === idx ? 'rotate-180 text-md-primary' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-xs text-md-on-surface-variant leading-relaxed border-t border-md-outline-variant/30 pt-3 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── 8. FINAL HIGH-CONVERSION CTA BAND ───────────────────────────── */}
        <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto text-center space-y-6 bg-gradient-to-r from-md-primary-container/50 via-md-surface to-md-secondary-container/50 p-10 md:p-16 rounded-md-3xl border border-md-primary/30 shadow-md-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-md-on-surface">
            Ready to build a website you can trust?
          </h2>
          <p className="text-sm md:text-base text-md-on-surface-variant max-w-xl mx-auto">
            Get started in seconds. Free forever tier, no credit card required, automated browser verification, and 1-click ZIP export.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-9 py-4 bg-md-primary text-md-on-primary font-bold text-sm rounded-md-full shadow-md-2 hover:shadow-md-3 hover:scale-[1.02] m3-transition flex items-center justify-center gap-2"
            >
              <span>Start Building Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/projects/demo/edit"
              className="w-full sm:w-auto px-7 py-4 bg-md-surface border border-md-outline-variant text-md-on-surface font-semibold text-sm rounded-md-full hover:bg-md-surface-container m3-transition"
            >
              Open Visual Studio
            </Link>
          </div>

          <p className="text-xs text-md-on-surface-variant font-medium pt-2">
            ✓ Card-Free Stack • Zero Vendor Lock-in • English, Telugu & Hindi Supported
          </p>
        </section>
      </main>

      {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-md-surface border-t border-md-outline-variant/40 px-6 py-12 text-xs text-md-on-surface-variant space-y-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-3 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-md-on-surface text-base">
              <Sparkles className="w-5 h-5 text-md-primary" />
              <span>SiteForge Studio</span>
            </div>
            <p className="text-xs leading-relaxed">
              Autonomous verified AI website builder with Playwright crawl testing, RAG source citations, and zero-collateral visual editing.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-md-on-surface uppercase text-[11px] tracking-wider">Workspace Modules</p>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="hover:text-md-primary m3-transition">Dashboard</Link></li>
              <li><Link href="/templates" className="hover:text-md-primary m3-transition">Templates Gallery</Link></li>
              <li><Link href="/builder" className="hover:text-md-primary m3-transition">AI Generator</Link></li>
              <li><Link href="/projects/demo/edit" className="hover:text-md-primary m3-transition">Visual Studio</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-md-on-surface uppercase text-[11px] tracking-wider">Legal & Integrity</p>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="hover:text-md-primary m3-transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-md-primary m3-transition">Terms of Service</Link></li>
              <li><Link href="/academic-integrity" className="hover:text-md-primary m3-transition">Academic Integrity</Link></li>
              <li><Link href="/contact" className="hover:text-md-primary m3-transition">Contact Support</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-md-on-surface uppercase text-[11px] tracking-wider">Languages & Region</p>
            <p>English • Telugu (తెలుగు) • Hindi (हिन्दी)</p>
            <p className="text-[11px] text-md-outline mt-3">© 2026 SiteForge AI Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
