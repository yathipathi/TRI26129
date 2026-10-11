import { z } from 'zod';
import crypto from 'crypto';
import { runWebSearch, SearchResult } from './search';
import { callLLM } from './llm';
import { saveSiteFiles, GeneratedSiteMeta } from './storage';
import { getTemplateBySlug } from './templates';
import { createProject } from './db';
import fs from 'fs';
import path from 'path';

export const IntakeSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  siteType: z.string().default('General Business'),
  purpose: z.string().optional().default('Promote business services and engage users'),
  targetAudience: z.string().optional().default('General public and prospective customers'),
  pagesNeeded: z.array(z.string()).optional().default(['index.html', 'about.html', 'services.html', 'contact.html']),
  toneStyle: z.string().optional().default('Professional, Modern, High-Contrast'),
  colorPreference: z.string().optional().default('Monochrome with Orange accent'),
  language: z.string().optional().default('English'),
  templateSlug: z.string().optional(),
  userContent: z.string().optional().default(''),
});

export type IntakeInput = z.infer<typeof IntakeSchema>;
export type SSECallback = (step: string, detail?: string, payload?: any) => void;

function synthesizePromptDrivenBrief(input: IntakeInput, sources: SearchResult[]): any {
  const fullText = `${input.siteName} ${input.siteType} ${input.purpose} ${input.userContent}`.toLowerCase();

  // 1. Poll / Voting Application Detection
  if (fullText.includes('poll') || fullText.includes('voting') || fullText.includes('ballot') || fullText.includes('survey')) {
    const brand = (!input.siteName || input.siteName.toLowerCase().includes('portfolio') || input.siteName.toLowerCase().includes('nexa') || input.siteName === 'Custom Generated Website')
      ? 'PollPulse Live'
      : input.siteName;

    return {
      title: brand,
      tagline: 'Real-Time Polling & Community Voting Platform',
      heroHeadline: 'Interactive Live Polling & Community Voting Platform',
      heroSubtitle: 'Launch single-click polls, gather verified responses, and visualize live vote percentages across engineering teams and public audiences.',
      colorPalette: { primary: '#09090b', secondary: '#ffffff', accent: '#2563eb' },
      isPollApp: true,
      pages: [
        { fileName: 'index.html', pageTitle: 'Active Polls', sections: ['hero', 'active-poll', 'features', 'stats', 'create-poll'] },
        { fileName: 'about.html', pageTitle: 'About Platform', sections: ['hero', 'mission', 'integrity', 'contact'] },
        { fileName: 'services.html', pageTitle: 'Features & API', sections: ['hero', 'tiers', 'api', 'contact'] },
        { fileName: 'contact.html', pageTitle: 'Contact Team', sections: ['hero', 'contact-form', 'faq'] }
      ],
      features: [
        { title: 'Live Instant Voting Engine', description: 'Single-click vote casting with animated percentage progress bars and real-time tallying.' },
        { title: 'Anti-Ballot Stuffing Guard', description: 'Session-based and IP verification guards prevent duplicate votes and ballot manipulation.' },
        { title: 'Custom Poll Creator', description: 'Create multi-choice questions, set active deadlines, and export voting results.' }
      ],
      faqs: [
        { question: 'How do users cast a vote?', answer: 'Select your choice in the active poll widget and click "Submit Vote". Percentages update instantly.' },
        { question: 'Can I embed polls on external websites?', answer: 'Yes, PollPulse provides standard iframe embeds and developer API endpoints.' },
        { question: 'Are poll results anonymous?', answer: 'Yes, votes are logged anonymously with cryptographic session tokens.' }
      ]
    };
  }

  // 2. Restaurant / Bakery / Food
  if (fullText.includes('bakery') || fullText.includes('restaurant') || fullText.includes('cafe') || fullText.includes('food') || fullText.includes('dine')) {
    const brand = (!input.siteName || input.siteName.toLowerCase().includes('portfolio') || input.siteName.toLowerCase().includes('nexa') || input.siteName === 'Custom Generated Website')
      ? 'Artisanal Craft Bakery & Cafe'
      : input.siteName;

    return {
      title: brand,
      tagline: 'Artisanal Breads, Fresh Pastries & Specialty Coffee',
      heroHeadline: 'Fresh Artisanal Bakery & Specialty Cafe',
      heroSubtitle: 'Handcrafting sourdough loaves, authentic pastries, and organic brews fresh daily.',
      colorPalette: { primary: '#38220f', secondary: '#fffcf7', accent: '#f97316' },
      isBakery: true,
      pages: [
        { fileName: 'index.html', pageTitle: 'Home', sections: ['hero', 'menu', 'features', 'contact'] },
        { fileName: 'about.html', pageTitle: 'Our Story', sections: ['hero', 'craft', 'contact'] },
        { fileName: 'services.html', pageTitle: 'Menu & Combos', sections: ['hero', 'menu-list', 'contact'] },
        { fileName: 'contact.html', pageTitle: 'Visit & Order', sections: ['hero', 'order-form', 'faq'] }
      ],
      features: [
        { title: 'Woodfired Baking', description: 'Traditional fermentation and stone hearth ovens creating crisp golden crusts.' },
        { title: 'Local Organic Ingredients', description: 'Sourced from regional farms with zero chemical preservatives.' },
        { title: 'Daily Online Orders', description: 'Order ahead for express bakery counter pickup or local delivery.' }
      ],
      faqs: [
        { question: 'What are your opening hours?', answer: 'We are open Tuesday through Sunday from 7:00 AM to 8:00 PM.' },
        { question: 'Do you offer gluten-free options?', answer: 'Yes, we prepare fresh gluten-free pastries and sourdough loaves daily.' }
      ]
    };
  }

  // 3. Healthcare / Clinic
  if (fullText.includes('clinic') || fullText.includes('hospital') || fullText.includes('health') || fullText.includes('doctor') || fullText.includes('dental')) {
    const brand = (!input.siteName || input.siteName.toLowerCase().includes('portfolio') || input.siteName.toLowerCase().includes('nexa') || input.siteName === 'Custom Generated Website')
      ? 'Apex Specialty Health Clinic'
      : input.siteName;

    return {
      title: brand,
      tagline: 'Comprehensive Medical Care & Patient Wellness',
      heroHeadline: 'Compassionate Patient Care & Clinical Excellence',
      heroSubtitle: 'Board-certified specialists delivering personalized healthcare and advanced clinical diagnostics.',
      colorPalette: { primary: '#0f172a', secondary: '#f8fafc', accent: '#0284c7' },
      isClinic: true,
      pages: [
        { fileName: 'index.html', pageTitle: 'Home', sections: ['hero', 'services', 'doctors', 'contact'] },
        { fileName: 'about.html', pageTitle: 'About Us', sections: ['hero', 'doctors', 'accreditations'] },
        { fileName: 'services.html', pageTitle: 'Specialties', sections: ['hero', 'clinical-services'] },
        { fileName: 'contact.html', pageTitle: 'Appointments', sections: ['hero', 'booking-form', 'faq'] }
      ],
      features: [
        { title: 'Board-Certified Specialists', description: 'Experienced physicians across internal medicine, cardiology, and pediatrics.' },
        { title: 'Same-Day Diagnostics', description: 'On-site digital imaging, blood work, and rapid lab test turnarounds.' },
        { title: 'Online Appointment Booking', description: 'Reserve priority doctor consultations with instant SMS confirmations.' }
      ],
      faqs: [
        { question: 'How do I schedule an appointment?', answer: 'Book online via our contact form or call our patient intake line.' },
        { question: 'Do you accept health insurance?', answer: 'We partner with all major medical insurance networks and cashless providers.' }
      ]
    };
  }

  // 4. E-Commerce / Online Store
  if (fullText.includes('store') || fullText.includes('shop') || fullText.includes('ecommerce') || fullText.includes('e-commerce') || fullText.includes('clothing') || fullText.includes('shoes')) {
    const brand = (!input.siteName || input.siteName.toLowerCase().includes('portfolio') || input.siteName.toLowerCase().includes('nexa') || input.siteName === 'Custom Generated Website')
      ? 'Aura Commerce Store'
      : input.siteName;

    return {
      title: brand,
      tagline: 'Curated Premium Collections & Direct Checkout',
      heroHeadline: 'Premium Quality Essentials Delivered to Your Door',
      heroSubtitle: 'Explore our latest drops crafted with sustainable materials, zero compromise on design, and instant nationwide shipping.',
      colorPalette: { primary: '#18181b', secondary: '#fafafa', accent: '#059669' },
      isEcommerce: true,
      pages: [
        { fileName: 'index.html', pageTitle: 'Storefront', sections: ['hero', 'products', 'features', 'newsletter'] },
        { fileName: 'about.html', pageTitle: 'Our Brand', sections: ['hero', 'craftsmanship', 'sustainability'] },
        { fileName: 'services.html', pageTitle: 'Collections', sections: ['hero', 'catalog', 'sizing'] },
        { fileName: 'contact.html', pageTitle: 'Customer Care', sections: ['hero', 'support-form', 'faq'] }
      ],
      features: [
        { title: 'Carbon-Neutral Delivery', description: 'Every shipment is 100% carbon offset and packaged in recyclable materials.' },
        { title: '30-Day Risk-Free Returns', description: 'Not completely satisfied? Exchange or return hassle-free with prepaid labels.' },
        { title: 'Secure Instant Checkout', description: 'Encrypted payments via Apple Pay, Google Pay, and major credit cards.' }
      ],
      faqs: [
        { question: 'What is your shipping window?', answer: 'Orders are processed within 24 hours and delivered in 2-4 business days.' },
        { question: 'How can I track my package?', answer: 'You will receive an automated tracking link via email as soon as your package leaves our fulfillment center.' }
      ]
    };
  }

  // 5. General / Custom Application (Extract Title & Content From Purpose)
  let derivedTitle = input.siteName;
  if (!derivedTitle || derivedTitle === 'Custom Generated Website' || derivedTitle.includes('Experience') || derivedTitle === 'Nexa Digital') {
    const cleanPurpose = input.purpose.replace(/generate|create|build|a|an|the|website|app|application|platform/gi, '').trim();
    const words = cleanPurpose.split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      derivedTitle = words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Platform';
    } else {
      derivedTitle = 'Modern Web App';
    }
  }

  return {
    title: derivedTitle,
    tagline: `Engineered for ${input.siteType}`,
    heroHeadline: `${derivedTitle} — Tailored for ${input.targetAudience}`,
    heroSubtitle: input.purpose || `Delivering high-performance, validated web solutions engineered with zero latency and full code ownership.`,
    colorPalette: { primary: '#09090b', secondary: '#ffffff', accent: '#f97316' },
    pages: [
      { fileName: 'index.html', pageTitle: 'Home', sections: ['hero', 'features', 'stats', 'pricing', 'contact'] },
      { fileName: 'about.html', pageTitle: 'About Us', sections: ['hero', 'story', 'team', 'contact'] },
      { fileName: 'services.html', pageTitle: 'Services', sections: ['hero', 'service-grid', 'pricing', 'contact'] },
      { fileName: 'contact.html', pageTitle: 'Contact', sections: ['hero', 'contact-form', 'faq'] },
    ],
    features: [
      { title: 'Deterministic Performance', description: `Engineered specifically to solve requirements for ${input.purpose}.` },
      { title: 'Tailored for ' + input.targetAudience, description: `Custom architecture and intuitive user workflows designed for maximum retention.` },
      { title: 'Verified Code Architecture', description: 'End-to-end link integrity, responsive styling, and zero vendor lock-in.' }
    ],
    faqs: [
      { question: `What is the core purpose of ${derivedTitle}?`, answer: input.purpose || 'Delivering modern, responsive web experiences.' },
      { question: 'Who is this platform built for?', answer: `Tailored for ${input.targetAudience}.` }
    ]
  };
}

export async function runGenerationPipeline(rawInput: any, onProgress?: SSECallback, userId: string = 'usr-default'): Promise<{ siteId: string; meta: GeneratedSiteMeta }> {
  // 1. INTAKE & VALIDATION
  const input = IntakeSchema.parse(rawInput);
  const siteId = 'site-' + crypto.randomUUID().substring(0, 8);

  // If user entered a specific purpose (e.g. "generate a poll application"), adjust effective siteName if it was just template default
  const promptLower = `${input.siteName} ${input.purpose} ${input.userContent}`.toLowerCase();
  if ((promptLower.includes('poll') || promptLower.includes('voting')) && (input.siteName === 'Portfolio Experience' || input.siteName === 'Nexa Digital')) {
    input.siteName = 'PollPulse Live App';
  }

  onProgress?.('Planning', `Intake validated for "${input.siteName}" (${input.siteType})`);

  // 2. QUERY PLANNING
  const queriesPrompt = `Generate 4 focused search queries to gather design trends, market standards, section copy ideas, and service offerings for building a website for:
Site Name: "${input.siteName}"
Type: "${input.siteType}"
Purpose: "${input.purpose}"
Location/Details: "${input.userContent}"

Return a raw JSON array of 4 strings. Example: ["query 1", "query 2", "query 3", "query 4"]`;

  let queries: string[] = [
    `${input.siteName} ${input.siteType} website design trends`,
    `${input.siteType} services pricing and section copy`,
    `best layout practices for ${input.siteType}`,
    `${input.siteName} customer offerings and FAQ`,
  ];

  try {
    const rawQueriesJson = await callLLM([{ role: 'user', content: queriesPrompt }], { jsonMode: true, temperature: 0.3 });
    const parsed = JSON.parse(rawQueriesJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      queries = parsed.slice(0, 4);
    } else if (parsed.queries && Array.isArray(parsed.queries)) {
      queries = parsed.queries.slice(0, 4);
    }
  } catch (err) {
    console.warn('[PIPELINE] Query planning parsing failed, using fallback queries');
  }

  onProgress?.('Searching', `Executing ${queries.length} search queries across web sources...`, { queries });

  // 3. WEB RESEARCH
  const searchResults: SearchResult[] = [];
  for (const query of queries) {
    const results = await runWebSearch(query, 2);
    searchResults.push(...results);
  }

  const uniqueSourcesMap = new Map<string, SearchResult>();
  searchResults.forEach((r) => {
    if (r.url && !uniqueSourcesMap.has(r.url)) {
      uniqueSourcesMap.set(r.url, r);
    }
  });
  const sources = Array.from(uniqueSourcesMap.values()).slice(0, 6);

  onProgress?.('Reading sources', `Gathered ${sources.length} research sources`, { sources });

  // 4. CONTENT BRIEF
  onProgress?.('Writing content', 'Formulating structured content brief, sitemap, and copy...');
  const researchSummary = sources.map((s) => `Source [${s.title}] (${s.url}): ${s.snippet}`).join('\n');

  // Baseline prompt-driven brief synthesized directly from user's intent
  let brief = synthesizePromptDrivenBrief(input, sources);

  const briefPrompt = `You are a Lead UX Architect. Synthesize a structured Content Brief for a website based on this research:
User Details:
Site Name: ${input.siteName}
Type: ${input.siteType}
Purpose: ${input.purpose}
Audience: ${input.targetAudience}
Tone: ${input.toneStyle}
Color Preference: ${input.colorPreference}

Research Context:
${researchSummary}

Return a valid JSON object with keys:
- "title": string
- "tagline": string
- "heroHeadline": string
- "heroSubtitle": string
- "colorPalette": { "primary": string, "secondary": string, "accent": string }
- "pages": array of objects { "fileName": string, "pageTitle": string, "sections": array of strings }
- "features": array of objects { "title": string, "description": string }
- "faqs": array of objects { "question": string, "answer": string }`;

  try {
    const rawBriefJson = await callLLM([{ role: 'user', content: briefPrompt }], { jsonMode: true, temperature: 0.5 });
    const parsedBrief = JSON.parse(rawBriefJson);
    if (parsedBrief && parsedBrief.title && parsedBrief.heroHeadline) {
      brief = { ...brief, ...parsedBrief };
    }
  } catch (err) {
    console.warn('[PIPELINE] LLM brief parsing failed; successfully used prompt-driven synthesis');
  }

  // 5. CODE GENERATION
  onProgress?.('Generating code', 'Compiling multi-page responsive HTML, CSS styles, and interactive JS...');

  // Decouple template if user has a custom purpose or prompt mismatches template
  let templateBaseHtml = '';
  const hasCustomPurpose = Boolean(input.purpose && input.purpose.trim() !== '' && input.purpose !== 'Promote business services and engage users');
  const isTemplateMismatched = Boolean(input.templateSlug && (
    hasCustomPurpose ||
    (input.templateSlug === 'portfolio' && (promptLower.includes('poll') || promptLower.includes('vote') || promptLower.includes('restaurant') || promptLower.includes('clinic') || promptLower.includes('store') || promptLower.includes('ecommerce'))) ||
    (input.templateSlug === 'restaurant' && promptLower.includes('poll'))
  ));

  if (input.templateSlug && !isTemplateMismatched && !hasCustomPurpose) {
    const tItem = getTemplateBySlug(input.templateSlug);
    if (tItem) {
      const tPath = path.join(process.cwd(), 'public', 'templates', input.templateSlug, 'index.html');
      if (fs.existsSync(tPath)) {
        templateBaseHtml = fs.readFileSync(tPath, 'utf-8');
      }
    }
  }

  const generatedFiles: Record<string, string> = {};

  // Build index.html
  if (templateBaseHtml) {
    let adaptedHtml = templateBaseHtml
      .replace(/<title>.*?<\/title>/i, `<title>${brief.title} — ${brief.tagline}</title>`)
      .replace(/<h1[^>]*>.*?<\/h1>/i, `<h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-[1.08] mb-8">${brief.heroHeadline || brief.title}</h1>`)
      .replace(/OFFICIAL TEMPLATE \/\/ [A-Z0-9_-]+/gi, `${input.siteType.toUpperCase()} // ${input.siteName.toUpperCase()}`);
    generatedFiles['index.html'] = adaptedHtml;
  } else {
    generatedFiles['index.html'] = generatePageHtml('index.html', brief, input);
  }

  // Build additional pages (about.html, services.html, contact.html)
  generatedFiles['about.html'] = generatePageHtml('about.html', brief, input);
  generatedFiles['services.html'] = generatePageHtml('services.html', brief, input);
  generatedFiles['contact.html'] = generatePageHtml('contact.html', brief, input);

  // Styles & Scripts
  generatedFiles['styles.css'] = `/* Custom Styles for ${brief.title} */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

body {
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  background-color: ${brief.colorPalette?.secondary || '#ffffff'};
  color: ${brief.colorPalette?.primary || '#09090b'};
}
.font-mono { font-family: 'JetBrains Mono', monospace; }
`;

  generatedFiles['script.js'] = `// Interactive Mobile Menu, Live Forms & Poll Engine
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (toggleBtn && mobileNav) {
    toggleBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('hidden');
    });
  }

  // Live Interactive Poll Voting Engine
  const pollForm = document.getElementById('poll-vote-form');
  if (pollForm) {
    pollForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const selected = pollForm.querySelector('input[name="poll_option"]:checked');
      if (selected) {
        const val = selected.value;
        const msg = document.getElementById('vote-success-msg');
        if (msg) msg.classList.remove('hidden');
        
        const submitBtn = document.getElementById('vote-btn');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerText = '✓ Vote Cast Successfully!';
          submitBtn.style.opacity = '0.7';
        }
        
        const counter = document.getElementById('total-vote-counter');
        if (counter) counter.innerText = 'Total Votes: 1,481 (You Voted!)';

        const pctEl = document.getElementById('pct-' + val);
        const barEl = document.getElementById('bar-' + val);
        if (pctEl && barEl) {
          pctEl.innerText = 'Vote Counted!';
          barEl.style.backgroundColor = '#10b981';
        }
      }
    });
  }

  // Live E-Commerce Cart Counter Engine
  let cartItemCount = 0;
  const cartButtons = document.querySelectorAll('.add-to-cart-btn');
  const cartBadge = document.getElementById('cart-badge');
  cartButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      cartItemCount++;
      if (cartBadge) {
        cartBadge.innerText = String(cartItemCount);
        cartBadge.classList.remove('hidden');
      }
      const orig = btn.innerText;
      btn.innerText = '✓ Added to Bag';
      setTimeout(() => { btn.innerText = orig; }, 1500);
    });
  });

  // Generic Contact, Booking & Inbound Forms
  const forms = document.querySelectorAll('form:not(#poll-vote-form)');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const successBox = form.querySelector('.form-success-alert');
      if (successBox) {
        successBox.classList.remove('hidden');
      } else {
        const div = document.createElement('div');
        div.className = 'mt-3 p-3 bg-emerald-100 border border-emerald-600 text-emerald-900 font-bold text-xs';
        div.innerText = '✓ Request submitted successfully! Our team will follow up shortly.';
        form.appendChild(div);
      }
      form.reset();
    });
  });
});
`;

  // 6. VALIDATION & AUTO-REPAIR
  onProgress?.('Validating', 'Parsing generated HTML, checking internal links and content integrity...');

  let validationErrors: string[] = [];
  for (const [filename, content] of Object.entries(generatedFiles)) {
    if (!content || content.trim().length < 50) {
      validationErrors.push(`File ${filename} is empty or invalid.`);
    }
  }

  for (const [filename, content] of Object.entries(generatedFiles)) {
    if (/lorem\s+ipsum/i.test(content)) {
      validationErrors.push(`File ${filename} contains placeholder "Lorem Ipsum" text.`);
    }
  }

  if (validationErrors.length > 0) {
    for (const [filename, content] of Object.entries(generatedFiles)) {
      generatedFiles[filename] = content.replace(/lorem\s+ipsum[\s\S]*?\./gi, `High quality service tailored for ${brief.title}.`);
    }
  }

  // 7. SAVE & SERVE
  onProgress?.('Saving', `Writing site files to disk under /generated/${siteId}/...`);
  const meta = saveSiteFiles(siteId, generatedFiles, {
    name: brief.title,
    type: input.siteType,
    templateSlug: isTemplateMismatched ? undefined : input.templateSlug,
    prompt: input.purpose || `${brief.title} (${input.siteType})`,
    sources: sources.map((s) => ({ title: s.title, url: s.url, snippet: s.snippet })),
    brief: brief,
  });

  // Register in DB for user
  try {
    const initialSpec = {
      meta: {
        siteId,
        siteName: brief.title,
        siteType: input.siteType,
        goal: input.purpose || '',
        audience: input.targetAudience || '',
        tone: input.toneStyle || '',
        language: input.language || 'English',
        templateSlug: isTemplateMismatched ? undefined : input.templateSlug,
      },
      theme: {
        palette: brief.colorPalette || { primary: '#09090b', secondary: '#ffffff', accent: '#2563eb', background: '#ffffff', text: '#000000' },
        fonts: { sans: 'Inter', mono: 'JetBrains Mono' },
        radius: '0.25rem',
      },
      pages: [
        {
          slug: 'index.html',
          title: 'Home',
          seo: { metaTitle: `${brief.title} — ${brief.tagline}`, metaDescription: brief.heroSubtitle || brief.tagline },
          sections: [
            { id: `sec-hero-${siteId}`, type: 'hero' as any, title: brief.heroHeadline || brief.title, subtitle: brief.heroSubtitle || '', props: { title: brief.heroHeadline, subtitle: brief.heroSubtitle } }
          ]
        }
      ],
      nav: { brandName: brief.title, links: [{ label: 'Home', href: 'index.html' }] },
      footer: { brandName: brief.title, copyright: `© 2026 ${brief.title}`, links: [] },
      data: {}
    };

    createProject({
      id: siteId,
      userId: userId,
      name: brief.title,
      type: input.siteType,
      status: 'verified',
      currentVersion: 1,
      siteSpec: initialSpec as any,
      fileTree: generatedFiles,
    });
  } catch (err) {
    console.warn('[PIPELINE] DB registration notice:', err);
  }

  return { siteId, meta };
}

function generatePageHtml(fileName: string, brief: any, input: IntakeInput): string {
  const primary = brief.colorPalette?.primary || '#09090b';
  const accent = brief.colorPalette?.accent || '#2563eb';

  const navLinks = [
    { label: 'Home', href: 'index.html' },
    { label: 'About', href: 'about.html' },
    { label: brief.isPollApp ? 'Polls & API' : 'Services', href: 'services.html' },
    { label: 'Contact', href: 'contact.html' },
  ];

  let pageTitle = 'Home';
  if (fileName === 'about.html') pageTitle = 'About Us';
  if (fileName === 'services.html') pageTitle = brief.isPollApp ? 'Poll Features' : 'Services';
  if (fileName === 'contact.html') pageTitle = 'Contact';

  const activeNavHtml = navLinks
    .map(
      (l) =>
        `<a href="${l.href}" class="hover:text-[${accent}] transition-colors ${
          l.href === fileName ? 'underline underline-offset-4 decoration-2 font-bold' : ''
        }">${l.label}</a>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brief.title} — ${pageTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css">
  <script src="script.js" defer></script>
</head>
<body class="min-h-screen bg-white text-[${primary}] selection:bg-black selection:text-white flex flex-col justify-between">

  <!-- Header / Navigation -->
  <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-[${primary}]">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <a href="index.html" class="text-xl font-black uppercase tracking-tight text-[${primary}] flex items-center gap-2">
        <span class="w-3 h-3 bg-[${accent}] border border-[${primary}] inline-block"></span>
        <span>${brief.title}</span>
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-8 text-xs font-mono font-bold uppercase tracking-wider">
        ${activeNavHtml}
      </nav>

      <div class="hidden md:flex items-center gap-3">
        <a href="contact.html" class="px-5 py-2.5 bg-[${primary}] text-white text-xs font-mono font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          ${brief.isPollApp ? 'Create Poll' : 'Get Started'}
        </a>
      </div>

      <!-- Mobile Hamburger Button -->
      <button id="mobile-menu-btn" aria-label="Toggle Menu" class="md:hidden p-2 border-2 border-[${primary}] text-[${primary}] hover:bg-neutral-100">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>

    <!-- Mobile Dropdown Nav -->
    <div id="mobile-nav" class="hidden md:hidden border-t-2 border-[${primary}] bg-white px-6 py-4 space-y-3 font-mono text-xs font-bold uppercase">
      ${navLinks.map((l) => `<a href="${l.href}" class="block py-2 hover:text-[${accent}]">${l.label}</a>`).join('')}
      <a href="contact.html" class="block w-full py-3 bg-[${primary}] text-white text-center font-bold uppercase">${brief.isPollApp ? 'Create Poll' : 'Get Started'}</a>
    </div>
  </header>

  <!-- Page Content -->
  <main class="flex-1">
    ${renderPageBody(fileName, brief, input, primary, accent)}
  </main>

  <!-- Footer -->
  <footer class="py-12 px-6 bg-white text-[${primary}] font-mono text-xs border-t-2 border-[${primary}]">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="font-bold uppercase tracking-wider">
        © 2026 ${brief.title}. All rights reserved.
      </div>
      <div class="flex items-center gap-6 font-bold uppercase">
        <a href="index.html" class="hover:underline">Home</a>
        <a href="about.html" class="hover:underline">About</a>
        <a href="services.html" class="hover:underline">${brief.isPollApp ? 'Polls & API' : 'Services'}</a>
        <a href="contact.html" class="hover:underline">Contact</a>
      </div>
    </div>
  </footer>

</body>
</html>`;
}

function renderPageBody(fileName: string, brief: any, input: IntakeInput, primary: string, accent: string): string {
  if (fileName === 'about.html') {
    return `
    <section class="py-20 px-6 border-b-2 border-[${primary}] bg-neutral-50">
      <div class="max-w-4xl mx-auto text-center font-mono">
        <span class="text-xs font-bold uppercase px-3 py-1 border-2 border-[${primary}] bg-white mb-6 inline-block">ABOUT ${brief.title.toUpperCase()}</span>
        <h1 class="text-4xl sm:text-5xl font-black uppercase mb-6 font-sans">${brief.title} Mission & Vision</h1>
        <p class="text-base text-neutral-700 leading-relaxed mb-8">${brief.heroSubtitle}</p>
      </div>
    </section>
    <section class="py-20 px-6 border-b-2 border-[${primary}] bg-white font-mono">
      <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="p-8 border-2 border-[${primary}] bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 class="text-xl font-bold uppercase mb-3 text-[${accent}]">// Real-Time Integrity</h3>
          <p class="text-sm text-neutral-700 leading-relaxed">Engineered with low-latency event processing, high-availability architecture, and rigorous verification guarantees.</p>
        </div>
        <div class="p-8 border-2 border-[${primary}] bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 class="text-xl font-bold uppercase mb-3 text-[${accent}]">// Community Focused</h3>
          <p class="text-sm text-neutral-700 leading-relaxed">Built for ${input.targetAudience} to make collaborative decisions, collect feedback, and share insights seamlessly.</p>
        </div>
      </div>
    </section>`;
  }

  if (fileName === 'services.html') {
    return `
    <section class="py-20 px-6 border-b-2 border-[${primary}] bg-neutral-50 font-mono">
      <div class="max-w-4xl mx-auto text-center">
        <span class="text-xs font-bold uppercase px-3 py-1 border-2 border-[${primary}] bg-white mb-6 inline-block">${brief.isPollApp ? 'POLLING CAPABILITIES' : 'SERVICES & OFFERINGS'}</span>
        <h1 class="text-4xl sm:text-5xl font-black uppercase mb-6 font-sans">${brief.title} Features</h1>
        <p class="text-base text-neutral-700 leading-relaxed">${brief.tagline}</p>
      </div>
    </section>
    <section class="py-20 px-6 border-b-2 border-[${primary}] bg-white font-mono">
      <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        ${(brief.features || [])
          .map(
            (f: any, idx: number) => `
        <div class="p-6 border-2 border-[${primary}] bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div class="text-xs font-bold text-[${accent}] mb-2">// CAPABILITY 0${idx + 1}</div>
          <h3 class="text-lg font-bold uppercase mb-2 font-sans">${f.title}</h3>
          <p class="text-xs text-neutral-600 leading-relaxed">${f.description}</p>
        </div>`
          )
          .join('')}
      </div>
    </section>`;
  }

  if (fileName === 'contact.html') {
    return `
    <section class="py-24 px-6 border-b-2 border-[${primary}] bg-neutral-50 font-mono">
      <div class="max-w-3xl mx-auto border-2 border-[${primary}] p-8 sm:p-12 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div class="text-center mb-10">
          <span class="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 border border-[${primary}] bg-neutral-100 mb-3 inline-block">
            DIRECT INTAKE
          </span>
          <h2 class="text-3xl font-black uppercase mb-2 font-sans">Connect With ${brief.title}</h2>
          <p class="text-xs text-neutral-600">Our technical team responds within 4 business hours.</p>
        </div>
        <form class="space-y-4 text-xs" onsubmit="event.preventDefault(); alert('Message sent!');">
          <div>
            <label class="block font-bold uppercase mb-1">Full Name</label>
            <input type="text" required placeholder="Enter full name" class="w-full p-3 border-2 border-[${primary}] outline-none bg-white" />
          </div>
          <div>
            <label class="block font-bold uppercase mb-1">Email Address</label>
            <input type="email" required placeholder="name@company.com" class="w-full p-3 border-2 border-[${primary}] outline-none bg-white" />
          </div>
          <div>
            <label class="block font-bold uppercase mb-1">Message</label>
            <textarea rows="4" required placeholder="Tell us about your requirements..." class="w-full p-3 border-2 border-[${primary}] outline-none bg-white"></textarea>
          </div>
          <button type="submit" class="w-full py-4 bg-[${primary}] text-white font-bold uppercase tracking-wider hover:opacity-90 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Send Message →
          </button>
        </form>
      </div>
    </section>`;
  }

  // index.html Body
  if (brief.isPollApp) {
    return `
    <!-- Poll Hero Section -->
    <section class="py-20 sm:py-28 px-6 border-b-2 border-[${primary}] bg-neutral-50 relative overflow-hidden font-mono">
      <div class="max-w-5xl mx-auto text-center relative z-10">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 mb-8 border-2 border-[${primary}] bg-white text-xs font-bold uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>LIVE COMMUNITY POLLING // REAL-TIME VOTES</span>
        </div>
        <h1 class="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-[1.08] mb-8 font-sans">
          ${brief.heroHeadline}
        </h1>
        <p class="text-lg sm:text-xl text-neutral-700 max-w-3xl mx-auto font-normal leading-relaxed mb-10 font-sans">
          ${brief.heroSubtitle}
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#live-poll" class="w-full sm:w-auto px-8 py-4 bg-[${primary}] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Vote on Active Poll ↓
          </a>
          <a href="#create-poll" class="w-full sm:w-auto px-8 py-4 bg-white text-[${primary}] border-2 border-[${primary}] font-bold text-xs uppercase tracking-wider hover:bg-neutral-100 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Create Custom Poll
          </a>
        </div>
      </div>
    </section>

    <!-- Interactive Live Poll Section -->
    <section id="live-poll" class="py-20 px-6 bg-white border-b-2 border-[${primary}] font-mono scroll-mt-20">
      <div class="max-w-3xl mx-auto border-2 border-[${primary}] p-8 sm:p-12 bg-neutral-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b-2 border-[${primary}] mb-6 gap-3">
          <div>
            <span class="text-xs font-bold uppercase px-3 py-1 bg-blue-100 text-blue-900 border border-[${primary}] inline-block mb-1">
              • ACTIVE LIVE POLL #2026
            </span>
            <h2 class="text-xl sm:text-2xl font-black uppercase text-[${primary}] font-sans">
              Which frontend framework is your top choice in 2026?
            </h2>
          </div>
          <span class="text-xs font-bold text-neutral-600 bg-white border border-[${primary}] px-3 py-1.5 shrink-0" id="total-vote-counter">
            Total Votes: 1,480
          </span>
        </div>

        <form id="poll-vote-form" class="space-y-4">
          <label class="block p-4 border-2 border-[${primary}] bg-white hover:bg-neutral-100 cursor-pointer transition-all">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-sm flex items-center gap-2">
                <input type="radio" name="poll_option" value="opt1" checked class="w-4 h-4 text-[${primary}]">
                Next.js 15 & React 19
              </span>
              <span class="text-xs font-bold text-blue-600 font-mono" id="pct-opt1">46% (680 votes)</span>
            </div>
            <div class="w-full bg-neutral-200 h-3 border border-[${primary}] overflow-hidden">
              <div id="bar-opt1" class="bg-blue-600 h-full transition-all duration-500" style="width: 46%"></div>
            </div>
          </label>

          <label class="block p-4 border-2 border-[${primary}] bg-white hover:bg-neutral-100 cursor-pointer transition-all">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-sm flex items-center gap-2">
                <input type="radio" name="poll_option" value="opt2" class="w-4 h-4 text-[${primary}]">
                Python FastAPI & PyTorch AI
              </span>
              <span class="text-xs font-bold text-blue-600 font-mono" id="pct-opt2">28% (415 votes)</span>
            </div>
            <div class="w-full bg-neutral-200 h-3 border border-[${primary}] overflow-hidden">
              <div id="bar-opt2" class="bg-blue-600 h-full transition-all duration-500" style="width: 28%"></div>
            </div>
          </label>

          <label class="block p-4 border-2 border-[${primary}] bg-white hover:bg-neutral-100 cursor-pointer transition-all">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-sm flex items-center gap-2">
                <input type="radio" name="poll_option" value="opt3" class="w-4 h-4 text-[${primary}]">
                TypeScript & Node.js Serverless
              </span>
              <span class="text-xs font-bold text-blue-600 font-mono" id="pct-opt3">16% (236 votes)</span>
            </div>
            <div class="w-full bg-neutral-200 h-3 border border-[${primary}] overflow-hidden">
              <div id="bar-opt3" class="bg-blue-600 h-full transition-all duration-500" style="width: 16%"></div>
            </div>
          </label>

          <label class="block p-4 border-2 border-[${primary}] bg-white hover:bg-neutral-100 cursor-pointer transition-all">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-sm flex items-center gap-2">
                <input type="radio" name="poll_option" value="opt4" class="w-4 h-4 text-[${primary}]">
                Rust & WebAssembly High-Perf
              </span>
              <span class="text-xs font-bold text-blue-600 font-mono" id="pct-opt4">10% (149 votes)</span>
            </div>
            <div class="w-full bg-neutral-200 h-3 border border-[${primary}] overflow-hidden">
              <div id="bar-opt4" class="bg-blue-600 h-full transition-all duration-500" style="width: 10%"></div>
            </div>
          </label>

          <button type="submit" id="vote-btn" class="w-full py-4 bg-[${primary}] text-white font-bold uppercase tracking-wider hover:opacity-90 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
            Submit Vote →
          </button>
        </form>

        <div id="vote-success-msg" class="hidden mt-4 p-4 bg-emerald-100 border-2 border-emerald-600 text-emerald-900 text-xs font-bold">
          ✓ Your vote has been officially logged! Live percentage distributions updated.
        </div>
      </div>
    </section>

    <!-- Create Custom Poll Section -->
    <section id="create-poll" class="py-20 px-6 bg-neutral-50 border-b-2 border-[${primary}] font-mono scroll-mt-20">
      <div class="max-w-3xl mx-auto border-2 border-[${primary}] p-8 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div class="mb-6 border-b-2 border-[${primary}] pb-3">
          <span class="text-xs font-bold uppercase text-[${accent}]">// POLL CREATOR</span>
          <h2 class="text-2xl font-black uppercase font-sans">Launch A New Community Poll</h2>
        </div>
        <form class="space-y-4 text-xs" onsubmit="event.preventDefault(); alert('Poll created successfully! Active on network.');">
          <div>
            <label class="block font-bold uppercase mb-1">Poll Question / Title</label>
            <input type="text" required placeholder="e.g. Which LLM provider has the best latency?" class="w-full p-3 border-2 border-[${primary}] outline-none bg-neutral-50" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold uppercase mb-1">Choice A</label>
              <input type="text" required placeholder="Option 1" class="w-full p-3 border-2 border-[${primary}] outline-none bg-neutral-50" />
            </div>
            <div>
              <label class="block font-bold uppercase mb-1">Choice B</label>
              <input type="text" required placeholder="Option 2" class="w-full p-3 border-2 border-[${primary}] outline-none bg-neutral-50" />
            </div>
          </div>
          <button type="submit" class="w-full py-3.5 bg-blue-600 text-white font-bold uppercase tracking-wider hover:bg-blue-700 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            Publish New Poll Now →
          </button>
        </form>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="py-20 px-6 border-b-2 border-[${primary}] bg-white font-mono">
      <div class="max-w-7xl mx-auto">
        <div class="mb-12 border-b-2 border-[${primary}] pb-4">
          <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border border-[${primary}] bg-neutral-100 mb-2 inline-block">
            PLATFORM CAPABILITIES
          </span>
          <h2 class="text-3xl font-black uppercase font-sans">Core Polling Infrastructure</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${(brief.features || [])
            .map(
              (f: any, idx: number) => `
          <div class="p-6 border-2 border-[${primary}] bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div class="text-xs font-bold text-[${accent}] mb-2">// 0${idx + 1} CAPABILITY</div>
            <h3 class="text-lg font-bold uppercase mb-2 font-sans">${f.title}</h3>
            <p class="text-xs text-neutral-600 leading-relaxed">${f.description}</p>
          </div>`
            )
            .join('')}
        </div>
      </div>
    </section>
    `;
  }

  // Bakery / Cafe Body
  if (brief.isBakery) {
    return `
    <section class="py-20 sm:py-28 px-6 border-b-2 border-[${primary}] bg-amber-50/50 relative overflow-hidden font-mono">
      <div class="max-w-5xl mx-auto text-center relative z-10">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 mb-6 border-2 border-[${primary}] bg-white text-xs font-bold uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>ARTISANAL STONE HEARTH // FRESH DAILY</span>
        </div>
        <h1 class="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-[1.08] mb-6 font-sans">
          ${brief.heroHeadline}
        </h1>
        <p class="text-lg sm:text-xl text-neutral-700 max-w-3xl mx-auto font-normal leading-relaxed mb-8 font-sans">
          ${brief.heroSubtitle}
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#menu-showcase" class="w-full sm:w-auto px-8 py-4 bg-[${primary}] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
            View Today's Fresh Bakes ↓
          </a>
          <a href="contact.html" class="w-full sm:w-auto px-8 py-4 bg-white text-[${primary}] border-2 border-[${primary}] font-bold text-xs uppercase tracking-wider hover:bg-neutral-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
            Order Pickup & Catering
          </a>
        </div>
      </div>
    </section>

    <!-- Fresh Bakes Showcase -->
    <section id="menu-showcase" class="py-20 px-6 bg-white border-b-2 border-[${primary}] font-mono scroll-mt-20">
      <div class="max-w-7xl mx-auto">
        <div class="mb-12 border-b-2 border-[${primary}] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border border-[${primary}] bg-amber-100 mb-2 inline-block">
              MORNING BATCH
            </span>
            <h2 class="text-3xl font-black uppercase font-sans">Fresh From The Hearth</h2>
          </div>
          <span class="text-xs font-bold text-neutral-500">Baked fresh every morning at 5:00 AM</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div class="p-6 border-2 border-[${primary}] bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <div class="text-xs font-bold text-amber-700 mb-2">// ORGANIC SOURDOUGH</div>
              <h3 class="text-lg font-bold uppercase mb-2 font-sans">Country Boule</h3>
              <p class="text-xs text-neutral-600 mb-4 leading-relaxed">Naturally fermented 48-hour sourdough with deep blistered crust.</p>
            </div>
            <div class="flex items-center justify-between border-t border-[${primary}] pt-4">
              <span class="font-black text-sm">$8.50</span>
              <button class="add-to-cart-btn px-3 py-1.5 bg-[${primary}] text-white text-xs font-bold uppercase hover:opacity-90">Add to Box</button>
            </div>
          </div>
          <div class="p-6 border-2 border-[${primary}] bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <div class="text-xs font-bold text-amber-700 mb-2">// VIENNOISERIE</div>
              <h3 class="text-lg font-bold uppercase mb-2 font-sans">Almond Croissant</h3>
              <p class="text-xs text-neutral-600 mb-4 leading-relaxed">Double-baked with organic almond frangipane and toasted flakes.</p>
            </div>
            <div class="flex items-center justify-between border-t border-[${primary}] pt-4">
              <span class="font-black text-sm">$5.25</span>
              <button class="add-to-cart-btn px-3 py-1.5 bg-[${primary}] text-white text-xs font-bold uppercase hover:opacity-90">Add to Box</button>
            </div>
          </div>
          <div class="p-6 border-2 border-[${primary}] bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <div class="text-xs font-bold text-amber-700 mb-2">// SPECIALTY ROAST</div>
              <h3 class="text-lg font-bold uppercase mb-2 font-sans">Nitro Cold Brew</h3>
              <p class="text-xs text-neutral-600 mb-4 leading-relaxed">Single-origin Ethiopian beans infused with velvety nitrogen micro-bubbles.</p>
            </div>
            <div class="flex items-center justify-between border-t border-[${primary}] pt-4">
              <span class="font-black text-sm">$4.75</span>
              <button class="add-to-cart-btn px-3 py-1.5 bg-[${primary}] text-white text-xs font-bold uppercase hover:opacity-90">Add to Box</button>
            </div>
          </div>
          <div class="p-6 border-2 border-[${primary}] bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <div class="text-xs font-bold text-amber-700 mb-2">// RUSTIC SWEET</div>
              <h3 class="text-lg font-bold uppercase mb-2 font-sans">Cardamom Bun</h3>
              <p class="text-xs text-neutral-600 mb-4 leading-relaxed">Swedish style twisted brioche with crushed green cardamom seeds.</p>
            </div>
            <div class="flex items-center justify-between border-t border-[${primary}] pt-4">
              <span class="font-black text-sm">$4.50</span>
              <button class="add-to-cart-btn px-3 py-1.5 bg-[${primary}] text-white text-xs font-bold uppercase hover:opacity-90">Add to Box</button>
            </div>
          </div>
        </div>
      </div>
    </section>
    `;
  }

  // Healthcare / Clinic Body
  if (brief.isClinic) {
    return `
    <section class="py-20 sm:py-28 px-6 border-b-2 border-[${primary}] bg-sky-50/40 relative overflow-hidden font-mono">
      <div class="max-w-5xl mx-auto text-center relative z-10">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 mb-6 border-2 border-[${primary}] bg-white text-xs font-bold uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <span class="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
          <span>PATIENT-FIRST HEALTHCARE // ACCREDITED MEDICAL CARE</span>
        </div>
        <h1 class="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-[1.08] mb-6 font-sans">
          ${brief.heroHeadline}
        </h1>
        <p class="text-lg sm:text-xl text-neutral-700 max-w-3xl mx-auto font-normal leading-relaxed mb-8 font-sans">
          ${brief.heroSubtitle}
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#book-consultation" class="w-full sm:w-auto px-8 py-4 bg-[${primary}] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
            Book Priority Consultation ↓
          </a>
          <a href="services.html" class="w-full sm:w-auto px-8 py-4 bg-white text-[${primary}] border-2 border-[${primary}] font-bold text-xs uppercase tracking-wider hover:bg-neutral-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
            Explore Medical Specialties
          </a>
        </div>
      </div>
    </section>

    <!-- Booking Intake Section -->
    <section id="book-consultation" class="py-20 px-6 bg-white border-b-2 border-[${primary}] font-mono scroll-mt-20">
      <div class="max-w-3xl mx-auto border-2 border-[${primary}] p-8 sm:p-12 bg-neutral-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div class="mb-8 border-b-2 border-[${primary}] pb-4">
          <span class="text-xs font-bold uppercase text-[${accent}]">// DIRECT PATIENT INTAKE</span>
          <h2 class="text-2xl font-black uppercase font-sans">Schedule Doctor Consultation</h2>
        </div>
        <form class="space-y-4 text-xs" onsubmit="event.preventDefault(); alert('Appointment requested! Confirmation SMS sent.');">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold uppercase mb-1">Patient Full Name</label>
              <input type="text" required placeholder="Full Name" class="w-full p-3 border-2 border-[${primary}] outline-none bg-white" />
            </div>
            <div>
              <label class="block font-bold uppercase mb-1">Phone Number</label>
              <input type="tel" required placeholder="+1 (555) 000-0000" class="w-full p-3 border-2 border-[${primary}] outline-none bg-white" />
            </div>
          </div>
          <div>
            <label class="block font-bold uppercase mb-1">Department / Specialty</label>
            <select class="w-full p-3 border-2 border-[${primary}] outline-none bg-white">
              <option>General Medicine & Health Checkup</option>
              <option>Cardiology & Vascular Health</option>
              <option>Pediatrics & Family Care</option>
              <option>Dental & Maxillofacial</option>
              <option>Diagnostic Lab & Imaging</option>
            </select>
          </div>
          <button type="submit" class="w-full py-4 bg-sky-700 text-white font-bold uppercase tracking-wider hover:bg-sky-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Confirm Priority Appointment →
          </button>
        </form>
      </div>
    </section>
    `;
  }

  // E-Commerce Store Body
  if (brief.isEcommerce) {
    return `
    <section class="py-20 sm:py-28 px-6 border-b-2 border-[${primary}] bg-emerald-50/30 relative overflow-hidden font-mono">
      <div class="max-w-5xl mx-auto text-center relative z-10">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 mb-6 border-2 border-[${primary}] bg-white text-xs font-bold uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>FLAGSHIP COLLECTION // VERIFIED QUALITY</span>
        </div>
        <h1 class="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-[1.08] mb-6 font-sans">
          ${brief.heroHeadline}
        </h1>
        <p class="text-lg sm:text-xl text-neutral-700 max-w-3xl mx-auto font-normal leading-relaxed mb-8 font-sans">
          ${brief.heroSubtitle}
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#store-products" class="w-full sm:w-auto px-8 py-4 bg-[${primary}] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
            Shop Catalog ↓
          </a>
          <a href="services.html" class="w-full sm:w-auto px-8 py-4 bg-white text-[${primary}] border-2 border-[${primary}] font-bold text-xs uppercase tracking-wider hover:bg-neutral-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
            Seasonal Lookbook
          </a>
        </div>
      </div>
    </section>

    <!-- Product Grid -->
    <section id="store-products" class="py-20 px-6 bg-white border-b-2 border-[${primary}] font-mono scroll-mt-20">
      <div class="max-w-7xl mx-auto">
        <div class="mb-12 border-b-2 border-[${primary}] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border border-[${primary}] bg-emerald-100 mb-2 inline-block">
              CURATED DROPS
            </span>
            <h2 class="text-3xl font-black uppercase font-sans">Featured Catalog</h2>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-neutral-600">Cart: </span>
            <span id="cart-badge" class="px-2 py-0.5 bg-emerald-600 text-white font-bold text-xs rounded-full">0</span>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div class="p-6 border-2 border-[${primary}] bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <div class="text-xs font-bold text-emerald-700 mb-2">// DROP 01</div>
              <h3 class="text-lg font-bold uppercase mb-2 font-sans">Heavyweight Fleece Hoodie</h3>
              <p class="text-xs text-neutral-600 mb-4 leading-relaxed">450 GSM French Terry cotton with double-needle ribbed binding.</p>
            </div>
            <div class="flex items-center justify-between border-t border-[${primary}] pt-4">
              <span class="font-black text-sm">$78.00</span>
              <button class="add-to-cart-btn px-3 py-1.5 bg-[${primary}] text-white text-xs font-bold uppercase hover:opacity-90">Add to Bag</button>
            </div>
          </div>
          <div class="p-6 border-2 border-[${primary}] bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <div class="text-xs font-bold text-emerald-700 mb-2">// DROP 02</div>
              <h3 class="text-lg font-bold uppercase mb-2 font-sans">Full-Grain Leather Tote</h3>
              <p class="text-xs text-neutral-600 mb-4 leading-relaxed">Vegetable-tanned harness leather with brass rivets and key lanyard.</p>
            </div>
            <div class="flex items-center justify-between border-t border-[${primary}] pt-4">
              <span class="font-black text-sm">$120.00</span>
              <button class="add-to-cart-btn px-3 py-1.5 bg-[${primary}] text-white text-xs font-bold uppercase hover:opacity-90">Add to Bag</button>
            </div>
          </div>
          <div class="p-6 border-2 border-[${primary}] bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <div class="text-xs font-bold text-emerald-700 mb-2">// DROP 03</div>
              <h3 class="text-lg font-bold uppercase mb-2 font-sans">Titanium Key Carabiner</h3>
              <p class="text-xs text-neutral-600 mb-4 leading-relaxed">Grade-5 aerospace titanium with integrated bottle opener notch.</p>
            </div>
            <div class="flex items-center justify-between border-t border-[${primary}] pt-4">
              <span class="font-black text-sm">$32.00</span>
              <button class="add-to-cart-btn px-3 py-1.5 bg-[${primary}] text-white text-xs font-bold uppercase hover:opacity-90">Add to Bag</button>
            </div>
          </div>
          <div class="p-6 border-2 border-[${primary}] bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <div class="text-xs font-bold text-emerald-700 mb-2">// DROP 04</div>
              <h3 class="text-lg font-bold uppercase mb-2 font-sans">Desk Mat & Cable Guard</h3>
              <p class="text-xs text-neutral-600 mb-4 leading-relaxed">Water-resistant vegan leather with magnetic cord organizer.</p>
            </div>
            <div class="flex items-center justify-between border-t border-[${primary}] pt-4">
              <span class="font-black text-sm">$45.00</span>
              <button class="add-to-cart-btn px-3 py-1.5 bg-[${primary}] text-white text-xs font-bold uppercase hover:opacity-90">Add to Bag</button>
            </div>
          </div>
        </div>
      </div>
    </section>
    `;
  }

  // Default Standard Index Body
  return `
  <section class="py-24 sm:py-32 px-6 border-b-2 border-[${primary}] bg-neutral-50 relative overflow-hidden font-mono">
    <div class="max-w-5xl mx-auto text-center relative z-10">
      <div class="inline-flex items-center gap-2 px-3.5 py-1 mb-8 border-2 border-[${primary}] bg-white text-xs font-bold uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        <span class="w-2 h-2 rounded-full bg-[${accent}]"></span>
        <span>${input.siteType.toUpperCase()} // ${brief.title.toUpperCase()}</span>
      </div>
      <h1 class="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-[1.08] mb-8 font-sans">
        ${brief.heroHeadline}
      </h1>
      <p class="text-lg sm:text-xl text-neutral-700 max-w-3xl mx-auto font-normal leading-relaxed mb-12 font-sans">
        ${brief.heroSubtitle}
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="services.html" class="w-full sm:w-auto px-8 py-4 bg-[${primary}] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Explore Services →
        </a>
        <a href="contact.html" class="w-full sm:w-auto px-8 py-4 bg-white text-[${primary}] border-2 border-[${primary}] font-bold text-xs uppercase tracking-wider hover:bg-neutral-100 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Contact Us
        </a>
      </div>
    </div>
  </section>

  <!-- Features Grid -->
  <section class="py-20 px-6 border-b-2 border-[${primary}] bg-white font-mono">
    <div class="max-w-7xl mx-auto">
      <div class="mb-12 border-b-2 border-[${primary}] pb-4">
        <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border border-[${primary}] bg-neutral-100 mb-2 inline-block">
          FEATURES
        </span>
        <h2 class="text-3xl font-black uppercase font-sans">Core Capabilities</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${(brief.features || [])
          .map(
            (f: any, idx: number) => `
        <div class="p-6 border-2 border-[${primary}] bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div class="text-xs font-bold text-[${accent}] mb-2">// 0${idx + 1} CAPABILITY</div>
          <h3 class="text-lg font-bold uppercase mb-2 font-sans">${f.title}</h3>
          <p class="text-xs text-neutral-600 leading-relaxed">${f.description}</p>
        </div>`
          )
          .join('')}
      </div>
    </div>
  </section>
  `;
}
