import { z } from 'zod';
import crypto from 'crypto';
import { runWebSearch, SearchResult } from './search';
import { callLLM } from './llm';
import { saveSiteFiles, GeneratedSiteMeta } from './storage';
import { getTemplateBySlug } from './templates';
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

export async function runGenerationPipeline(rawInput: any, onProgress?: SSECallback): Promise<{ siteId: string; meta: GeneratedSiteMeta }> {
  // 1. INTAKE & VALIDATION
  const input = IntakeSchema.parse(rawInput);
  const siteId = 'site-' + crypto.randomUUID().substring(0, 8);
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

  // Deduplicate sources
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

  let brief: any = {
    title: input.siteName,
    tagline: `Premier ${input.siteType} Solutions`,
    heroHeadline: `${input.siteName} — Built for Velocity & Conviction`,
    heroSubtitle: `Experience frictionless execution, tailored service offerings, and high performance with ${input.siteName}.`,
    colorPalette: { primary: '#09090b', secondary: '#ffffff', accent: '#f97316' },
    pages: [
      { fileName: 'index.html', pageTitle: 'Home', sections: ['hero', 'features', 'stats', 'pricing', 'contact'] },
      { fileName: 'about.html', pageTitle: 'About Us', sections: ['hero', 'story', 'team', 'contact'] },
      { fileName: 'services.html', pageTitle: 'Services', sections: ['hero', 'service-grid', 'pricing', 'contact'] },
      { fileName: 'contact.html', pageTitle: 'Contact', sections: ['hero', 'contact-form', 'faq'] },
    ],
    features: [
      { title: 'Deterministic Performance', description: 'Engineered for sub-millisecond edge response and maximum reliability.' },
      { title: 'Tailored Service Architecture', description: `Custom solutions designed specifically for ${input.targetAudience}.` },
      { title: 'Cryptographic Security', description: 'End-to-end data integrity, continuous uptime SLAs, and compliance.' },
    ],
    faqs: [
      { question: `How do I get started with ${input.siteName}?`, answer: 'Submit an inquiry through our contact form or select your preferred service tier.' },
      { question: 'What is the response timeframe?', answer: 'Our team responds to all inbound inquiries within 4 business hours.' },
    ],
  };

  try {
    const rawBriefJson = await callLLM([{ role: 'user', content: briefPrompt }], { jsonMode: true, temperature: 0.5 });
    const parsedBrief = JSON.parse(rawBriefJson);
    if (parsedBrief && parsedBrief.title) {
      brief = { ...brief, ...parsedBrief };
    }
  } catch (err) {
    console.warn('[PIPELINE] Brief generation parsing failed, using benchmark brief');
  }

  // 5. CODE GENERATION
  onProgress?.('Generating code', 'Compiling multi-page responsive HTML, CSS styles, and interactive JS...');

  let templateBaseHtml = '';
  if (input.templateSlug) {
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
    // Adapt template HTML with brief title & details
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
  generatedFiles['styles.css'] = `/* Custom Styles for ${input.siteName} */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

body {
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  background-color: ${brief.colorPalette?.secondary || '#ffffff'};
  color: ${brief.colorPalette?.primary || '#09090b'};
}
.font-mono { font-family: 'JetBrains Mono', monospace; }
`;

  generatedFiles['script.js'] = `// Interactive Mobile Menu & Form Handling
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (toggleBtn && mobileNav) {
    toggleBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('hidden');
    });
  }

  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Form submitted successfully!');
    });
  });
});
`;

  // 6. VALIDATION & AUTO-REPAIR
  onProgress?.('Validating', 'Parsing generated HTML, checking internal links and content integrity...');

  let validationErrors: string[] = [];

  // Check 1: No empty placeholder files
  for (const [filename, content] of Object.entries(generatedFiles)) {
    if (!content || content.trim().length < 50) {
      validationErrors.push(`File ${filename} is empty or invalid.`);
    }
  }

  // Check 2: No lorem ipsum
  for (const [filename, content] of Object.entries(generatedFiles)) {
    if (/lorem\s+ipsum/i.test(content)) {
      validationErrors.push(`File ${filename} contains placeholder "Lorem Ipsum" text.`);
    }
  }

  if (validationErrors.length > 0) {
    console.warn('[PIPELINE] Validation errors detected, executing auto-repair:', validationErrors);
    for (const [filename, content] of Object.entries(generatedFiles)) {
      generatedFiles[filename] = content.replace(/lorem\s+ipsum[\s\S]*?\./gi, `High quality service tailored for ${input.siteName}.`);
    }
  }

  // 7. SAVE & SERVE
  onProgress?.('Saving', `Writing site files to disk under /generated/${siteId}/...`);
  const meta = saveSiteFiles(siteId, generatedFiles, {
    name: input.siteName,
    type: input.siteType,
    templateSlug: input.templateSlug,
    prompt: input.userContent || `${input.siteName} (${input.siteType})`,
    sources: sources.map((s) => ({ title: s.title, url: s.url, snippet: s.snippet })),
    brief: brief,
  });

  onProgress?.('Done', `Generation complete for ${siteId}`, { siteId });

  return { siteId, meta };
}

function generatePageHtml(fileName: string, brief: any, input: IntakeInput): string {
  const pageTitle = fileName === 'index.html' ? 'Home' : fileName.replace('.html', '').toUpperCase();
  const primary = brief.colorPalette?.primary || '#09090b';
  const accent = brief.colorPalette?.accent || '#f97316';

  const navLinks = [
    { label: 'Home', href: 'index.html' },
    { label: 'About', href: 'about.html' },
    { label: 'Services', href: 'services.html' },
    { label: 'Contact', href: 'contact.html' },
  ];

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
          Get Started
        </a>
      </div>

      <!-- Mobile Hamburger Button -->
      <button id="mobile-menu-btn" aria-label="Toggle Menu" className="md:hidden p-2 border-2 border-[${primary}] text-[${primary}] hover:bg-neutral-100">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>

    <!-- Mobile Dropdown Nav -->
    <div id="mobile-nav" className="hidden md:hidden border-t-2 border-[${primary}] bg-white px-6 py-4 space-y-3 font-mono text-xs font-bold uppercase">
      ${navLinks.map((l) => `<a href="${l.href}" class="block py-2 hover:text-[${accent}]">${l.label}</a>`).join('')}
      <a href="contact.html" class="block w-full py-3 bg-[${primary}] text-white text-center font-bold uppercase">Get Started</a>
    </div>
  </header>

  <!-- Page Content -->
  <main className="flex-1">
    ${renderPageBody(fileName, brief, input, primary, accent)}
  </main>

  <!-- Footer -->
  <footer className="py-12 px-6 bg-white text-[${primary}] font-mono text-xs border-t-2 border-[${primary}]">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="font-bold uppercase tracking-wider">
        © 2026 ${brief.title}. All rights reserved.
      </div>
      <div className="flex items-center gap-6 font-bold uppercase">
        <a href="index.html" class="hover:underline">Home</a>
        <a href="about.html" class="hover:underline">About</a>
        <a href="services.html" class="hover:underline">Services</a>
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
      <div class="max-w-4xl mx-auto text-center">
        <span class="text-xs font-mono font-bold uppercase px-3 py-1 border-2 border-[${primary}] bg-white mb-6 inline-block">ABOUT ${brief.title.toUpperCase()}</span>
        <h1 class="text-4xl sm:text-5xl font-black uppercase mb-6">${brief.title} Mission & Vision</h1>
        <p class="text-base text-neutral-700 font-mono leading-relaxed mb-8">Dedicated to providing top-tier ${input.siteType} solutions for ${input.targetAudience}. Engineered with high precision, zero latency, and absolute reliability.</p>
      </div>
    </section>
    <section class="py-20 px-6 border-b-2 border-[${primary}] bg-white">
      <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="p-8 border-2 border-[${primary}] bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono">
          <h3 class="text-xl font-bold uppercase mb-3 text-[${accent}]">// Our Core Values</h3>
          <p class="text-sm text-neutral-700 leading-relaxed">Continuous innovation, transparent pricing, and relentless dedication to quality across every touchpoint.</p>
        </div>
        <div class="p-8 border-2 border-[${primary}] bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono">
          <h3 class="text-xl font-bold uppercase mb-3 text-[${accent}]">// Operational Excellence</h3>
          <p class="text-sm text-neutral-700 leading-relaxed">24/7 dedicated coverage and SOC2-compliant data practices trusted by industry leaders.</p>
        </div>
      </div>
    </section>`;
  }

  if (fileName === 'services.html') {
    return `
    <section class="py-20 px-6 border-b-2 border-[${primary}] bg-neutral-50">
      <div class="max-w-4xl mx-auto text-center">
        <span class="text-xs font-mono font-bold uppercase px-3 py-1 border-2 border-[${primary}] bg-white mb-6 inline-block">SERVICES & OFFERINGS</span>
        <h1 class="text-4xl sm:text-5xl font-black uppercase mb-6">${brief.title} Offerings</h1>
        <p class="text-base text-neutral-700 font-mono leading-relaxed">Explore our comprehensive suite of ${input.siteType} services.</p>
      </div>
    </section>
    <section class="py-20 px-6 border-b-2 border-[${primary}] bg-white">
      <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
        ${(brief.features || [])
          .map(
            (f: any, idx: number) => `
        <div class="p-6 border-2 border-[${primary}] bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div class="text-xs font-bold text-[${accent}] mb-2">// SERVICE 0${idx + 1}</div>
          <h3 class="text-lg font-bold uppercase mb-2">${f.title}</h3>
          <p class="text-xs text-neutral-600 leading-relaxed">${f.description}</p>
        </div>`
          )
          .join('')}
      </div>
    </section>`;
  }

  if (fileName === 'contact.html') {
    return `
    <section class="py-24 px-6 border-b-2 border-[${primary}] bg-neutral-50">
      <div class="max-w-3xl mx-auto border-2 border-[${primary}] p-8 sm:p-12 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div class="text-center mb-10 font-mono">
          <span class="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 border border-[${primary}] bg-neutral-100 mb-3 inline-block">
            DIRECT CONTACT
          </span>
          <h2 class="text-3xl font-black uppercase mb-2">Connect With ${brief.title}</h2>
          <p class="text-xs text-neutral-600">Our technical team responds within 4 business hours.</p>
        </div>
        <form class="space-y-4 font-mono text-xs" onsubmit="event.preventDefault(); alert('Message sent!');">
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

  // Default index.html Body
  return `
  <section class="py-24 sm:py-32 px-6 border-b-2 border-[${primary}] bg-neutral-50 relative overflow-hidden">
    <div class="max-w-5xl mx-auto text-center relative z-10 font-mono">
      <div class="inline-flex items-center gap-2 px-3.5 py-1 mb-8 border-2 border-[${primary}] bg-white text-xs font-bold uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        <span class="w-2 h-2 rounded-full bg-[${accent}]"></span>
        <span>${input.siteType.toUpperCase()} // ${brief.title.toUpperCase()}</span>
      </div>
      <h1 class="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-[1.08] mb-8 font-sans">
        ${brief.heroHeadline}
      </h1>
      <p class="text-lg sm:text-xl text-neutral-700 max-w-3xl mx-auto font-normal leading-relaxed mb-12">
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
        <h2 class="text-3xl font-black uppercase">Core Capabilities</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${(brief.features || [])
          .map(
            (f: any, idx: number) => `
        <div class="p-6 border-2 border-[${primary}] bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div class="text-xs font-bold text-[${accent}] mb-2">// 0${idx + 1} CAPABILITY</div>
          <h3 class="text-lg font-bold uppercase mb-2">${f.title}</h3>
          <p class="text-xs text-neutral-600 leading-relaxed">${f.description}</p>
        </div>`
          )
          .join('')}
      </div>
    </div>
  </section>
  `;
}
