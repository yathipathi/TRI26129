import { WebsiteProject, Section } from '@/types';

export function generateStandaloneHTML(project: WebsiteProject): string {
  const sectionsHtml = project.sections
    .map((sec) => renderSectionToHtml(sec))
    .join('\n\n');

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(project.title)} — ${escapeHtml(project.description)}</title>
  <meta name="description" content="${escapeHtml(project.description)}">
  <script>
    (function() {
      try {
        var testKey = '__sf_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
      } catch (e) {
        var memoryStorage = {};
        try {
          Object.defineProperty(window, 'localStorage', {
            value: {
              getItem: function(k) { return memoryStorage[k] || null; },
              setItem: function(k, v) { memoryStorage[k] = String(v); },
              removeItem: function(k) { delete memoryStorage[k]; },
              clear: function() { memoryStorage = {}; }
            },
            configurable: true,
            writable: true
          });
        } catch(err) {}
      }
      if (typeof navigator !== 'undefined') {
        if (!navigator.clipboard) {
          navigator.clipboard = { writeText: function() { return Promise.resolve(); } };
        } else if (!navigator.clipboard.writeText) {
          navigator.clipboard.writeText = function() { return Promise.resolve(); };
        }
      }
    })();
  </script>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            background: '#ffffff',
            foreground: '#000000',
          },
          fontFamily: {
            sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    body {
      background-color: #ffffff;
      color: #000000;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    ::selection {
      background-color: #000000;
      color: #ffffff;
    }
  </style>
</head>
<body class="bg-white text-black min-h-screen selection:bg-black selection:text-white">
  ${sectionsHtml}
</body>
</html>`;
}

function escapeHtml(str: string = ''): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderSectionsHtml(sections: Section[]): string {
  return (sections || []).map((sec) => renderSectionToHtml(sec)).join('\n\n');
}

export function renderSectionToHtml(section: Section): string {
  switch (section.type) {
    case 'navbar':
      return `
  <!-- Navigation -->
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-black">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <a href="#" class="text-2xl font-black tracking-tighter uppercase text-black hover:opacity-80 transition-opacity">
          ${escapeHtml(section.title)}
        </a>
        ${section.badge ? `<span class="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 border border-black text-black">${escapeHtml(section.badge)}</span>` : ''}
      </div>
      <nav class="hidden md:flex items-center gap-8 text-sm font-semibold tracking-tight text-black">
        ${(section.items || [])
          .map((item) => `<a href="${item.description || '#'}" class="hover:underline underline-offset-4 decoration-2">${escapeHtml(item.title)}</a>`)
          .join('\n        ')}
      </nav>
      <div class="flex items-center gap-3">
        ${section.ctaSecondary ? `<a href="${section.ctaSecondary.link}" class="hidden sm:inline-flex px-4 py-2 text-xs uppercase font-bold tracking-wider border border-black text-black hover:bg-black hover:text-white transition-all">${escapeHtml(section.ctaSecondary.text)}</a>` : ''}
        ${section.ctaPrimary ? `<a href="${section.ctaPrimary.link}" class="px-5 py-2.5 text-xs uppercase font-bold tracking-wider bg-black text-white hover:bg-neutral-800 transition-all shadow-sm">${escapeHtml(section.ctaPrimary.text)}</a>` : ''}
      </div>
    </div>
  </header>`;

    case 'hero':
      return `
  <!-- Hero Section -->
  <section class="py-24 md:py-36 px-6 border-b border-black bg-white">
    <div class="max-w-5xl mx-auto text-center">
      ${section.badge ? `
      <div class="inline-flex items-center gap-2 px-3 py-1 mb-8 border border-black text-xs font-bold tracking-widest uppercase">
        <span>●</span>
        <span>${escapeHtml(section.badge)}</span>
      </div>` : ''}
      <h1 class="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] text-black uppercase mb-8">
        ${escapeHtml(section.title)}
      </h1>
      <p class="text-lg sm:text-xl text-neutral-700 max-w-3xl mx-auto font-normal leading-relaxed mb-12">
        ${escapeHtml(section.subtitle || '')}
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        ${section.ctaPrimary ? `
        <a href="${section.ctaPrimary.link}" class="w-full sm:w-auto px-8 py-4 bg-black text-white font-bold text-sm tracking-wider uppercase hover:bg-neutral-800 transition-all text-center">
          ${escapeHtml(section.ctaPrimary.text)} →
        </a>` : ''}
        ${section.ctaSecondary ? `
        <a href="${section.ctaSecondary.link}" class="w-full sm:w-auto px-8 py-4 bg-white text-black border-2 border-black font-bold text-sm tracking-wider uppercase hover:bg-neutral-100 transition-all text-center">
          ${escapeHtml(section.ctaSecondary.text)}
        </a>` : ''}
      </div>
    </div>
  </section>`;

    case 'stats':
      return `
  <!-- Stats Section -->
  <section class="py-16 px-6 border-b border-black bg-white">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-black">
        ${(section.items || [])
          .map(
            (item) => `
        <div class="pt-6 md:pt-0 md:px-6 first:px-0 text-center md:text-left">
          <div class="text-4xl sm:text-5xl font-black tracking-tight text-black">${escapeHtml(item.stat || '')}</div>
          <div class="text-sm font-bold tracking-wide uppercase text-black mt-2">${escapeHtml(item.label || '')}</div>
          ${item.description ? `<div class="text-xs text-neutral-600 mt-1">${escapeHtml(item.description)}</div>` : ''}
        </div>`
          )
          .join('\n')}
      </div>
    </div>
  </section>`;

    case 'features':
      return `
  <!-- Features Section -->
  <section id="features" class="py-24 px-6 border-b border-black bg-white">
    <div class="max-w-7xl mx-auto">
      <div class="mb-16">
        ${section.badge ? `<div class="text-xs font-bold tracking-widest uppercase text-black mb-3">[ ${escapeHtml(section.badge)} ]</div>` : ''}
        <h2 class="text-3xl sm:text-5xl font-black tracking-tight uppercase text-black mb-4">${escapeHtml(section.title)}</h2>
        ${section.subtitle ? `<p class="text-base sm:text-lg text-neutral-700 max-w-2xl">${escapeHtml(section.subtitle)}</p>` : ''}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        ${(section.items || [])
          .map(
            (item, index) => `
        <div class="border-2 border-black p-8 hover:bg-neutral-50 transition-colors flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-6">
              <span class="text-xs font-mono font-bold tracking-widest text-black">0${index + 1} //</span>
              ${item.badge ? `<span class="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 border border-black">${escapeHtml(item.badge)}</span>` : ''}
            </div>
            <h3 class="text-xl font-bold tracking-tight uppercase text-black mb-3">${escapeHtml(item.title)}</h3>
            <p class="text-sm text-neutral-700 leading-relaxed">${escapeHtml(item.description || '')}</p>
          </div>
        </div>`
          )
          .join('\n')}
      </div>
    </div>
  </section>`;

    case 'testimonials':
      return `
  <!-- Testimonials Section -->
  <section id="testimonials" class="py-24 px-6 border-b border-black bg-white">
    <div class="max-w-7xl mx-auto">
      <div class="mb-16">
        ${section.badge ? `<div class="text-xs font-bold tracking-widest uppercase text-black mb-3">[ ${escapeHtml(section.badge)} ]</div>` : ''}
        <h2 class="text-3xl sm:text-5xl font-black tracking-tight uppercase text-black mb-4">${escapeHtml(section.title)}</h2>
        ${section.subtitle ? `<p class="text-base sm:text-lg text-neutral-700 max-w-2xl">${escapeHtml(section.subtitle)}</p>` : ''}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        ${(section.items || [])
          .map(
            (item) => `
        <div class="border-2 border-black p-8 flex flex-col justify-between">
          <p class="text-base font-normal leading-relaxed text-black mb-8 italic">${escapeHtml(item.description || '')}</p>
          <div class="border-t border-black pt-4 flex items-center gap-4">
            <div class="w-10 h-10 border border-black bg-black text-white flex items-center justify-center font-bold text-xs">
              ${escapeHtml(item.avatar || item.author?.substring(0, 2) || 'EX')}
            </div>
            <div>
              <div class="font-bold text-sm uppercase text-black">${escapeHtml(item.author || '')}</div>
              <div class="text-xs text-neutral-600">${escapeHtml(item.role || '')}</div>
            </div>
          </div>
        </div>`
          )
          .join('\n')}
      </div>
    </div>
  </section>`;

    case 'pricing':
      return `
  <!-- Pricing Section -->
  <section id="pricing" class="py-24 px-6 border-b border-black bg-white">
    <div class="max-w-7xl mx-auto">
      <div class="text-center max-w-3xl mx-auto mb-16">
        ${section.badge ? `<div class="inline-block border border-black px-3 py-1 text-xs font-bold tracking-widest uppercase mb-4">${escapeHtml(section.badge)}</div>` : ''}
        <h2 class="text-3xl sm:text-5xl font-black tracking-tight uppercase text-black mb-4">${escapeHtml(section.title)}</h2>
        ${section.subtitle ? `<p class="text-base sm:text-lg text-neutral-700">${escapeHtml(section.subtitle)}</p>` : ''}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        ${(section.items || [])
          .map(
            (item) => `
        <div class="border-2 border-black p-8 flex flex-col justify-between ${item.badge === 'MOST POPULAR' ? 'bg-neutral-50 shadow-md' : 'bg-white'}">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-lg font-black uppercase text-black">${escapeHtml(item.title)}</span>
              ${item.badge ? `<span class="text-[10px] font-bold tracking-widest px-2 py-0.5 bg-black text-white uppercase">${escapeHtml(item.badge)}</span>` : ''}
            </div>
            <div class="mb-4">
              <span class="text-4xl font-black text-black">${escapeHtml(item.price || '$0')}</span>
              <span class="text-xs text-neutral-600">${escapeHtml(item.period || '')}</span>
            </div>
            <p class="text-xs text-neutral-600 mb-6">${escapeHtml(item.description || '')}</p>
            <div class="border-t border-black pt-6 mb-8">
              <ul class="space-y-3">
                ${(item.features || [])
                  .map(
                    (f) => `
                <li class="flex items-start gap-2 text-xs font-medium text-black">
                  <span class="font-bold">✓</span>
                  <span>${escapeHtml(f)}</span>
                </li>`
                  )
                  .join('\n')}
              </ul>
            </div>
          </div>
          <a href="#contact" class="w-full py-3.5 text-center text-xs font-bold uppercase tracking-wider ${item.badge === 'MOST POPULAR' ? 'bg-black text-white hover:bg-neutral-800' : 'border-2 border-black text-black hover:bg-black hover:text-white'} transition-all">
            Get Started
          </a>
        </div>`
          )
          .join('\n')}
      </div>
    </div>
  </section>`;

    case 'faq':
      return `
  <!-- FAQ Section -->
  <section id="faq" class="py-24 px-6 border-b border-black bg-white">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-16">
        ${section.badge ? `<div class="text-xs font-bold tracking-widest uppercase text-black mb-3">[ ${escapeHtml(section.badge)} ]</div>` : ''}
        <h2 class="text-3xl sm:text-5xl font-black tracking-tight uppercase text-black mb-4">${escapeHtml(section.title)}</h2>
        ${section.subtitle ? `<p class="text-base text-neutral-700">${escapeHtml(section.subtitle)}</p>` : ''}
      </div>
      <div class="divide-y-2 divide-black border-y-2 border-black">
        ${(section.items || [])
          .map(
            (item) => `
        <div class="py-6">
          <h3 class="text-lg font-bold uppercase tracking-tight text-black mb-3">${escapeHtml(item.question || item.title || '')}</h3>
          <p class="text-sm text-neutral-700 leading-relaxed font-normal">${escapeHtml(item.answer || item.description || '')}</p>
        </div>`
          )
          .join('\n')}
      </div>
    </div>
  </section>`;

    case 'cta':
      return `
  <!-- CTA Section -->
  <section class="py-24 md:py-32 px-6 border-b border-black bg-black text-white">
    <div class="max-w-4xl mx-auto text-center">
      ${section.badge ? `<div class="inline-block border border-white px-3 py-1 text-xs font-bold tracking-widest uppercase mb-6 text-white">${escapeHtml(section.badge)}</div>` : ''}
      <h2 class="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase text-white mb-6 leading-tight">${escapeHtml(section.title)}</h2>
      ${section.subtitle ? `<p class="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto mb-10">${escapeHtml(section.subtitle)}</p>` : ''}
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        ${section.ctaPrimary ? `<a href="${section.ctaPrimary.link}" class="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all">${escapeHtml(section.ctaPrimary.text)}</a>` : ''}
        ${section.ctaSecondary ? `<a href="${section.ctaSecondary.link}" class="w-full sm:w-auto px-8 py-4 border border-white text-white font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-all">${escapeHtml(section.ctaSecondary.text)}</a>` : ''}
      </div>
    </div>
  </section>`;

    case 'footer':
      return `
  <!-- Footer -->
  <footer class="py-16 px-6 bg-white text-black">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-12">
      <div>
        <div class="text-2xl font-black uppercase tracking-tighter mb-4">${escapeHtml(section.title)}</div>
        <p class="text-xs text-neutral-600 max-w-sm leading-relaxed">${escapeHtml(section.subtitle || '')}</p>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
        ${(section.items || [])
          .map(
            (col) => `
        <div>
          <div class="font-bold uppercase tracking-wider mb-3 text-black">${escapeHtml(col.title)}</div>
          <div class="text-neutral-600 space-y-2">
            ${(col.description || '')
              .split(',')
              .map((link) => `<div class="hover:underline cursor-pointer">${escapeHtml(link.trim())}</div>`)
              .join('\n            ')}
          </div>
        </div>`
          )
          .join('\n')}
      </div>
    </div>
  </footer>`;

    case 'auth':
      return `
  <!-- Auth / Login Section -->
  <section class="py-16 md:py-24 px-6 bg-white border-b-2 border-black flex items-center justify-center min-h-[700px]">
    <div class="max-w-md w-full mx-auto border-2 border-black bg-white p-8 sm:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div class="flex items-center justify-between mb-8">
        <div class="w-12 h-12 border-2 border-black bg-black text-white flex items-center justify-center font-bold">●</div>
        ${section.badge ? `<span class="text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 border border-black">${escapeHtml(section.badge)}</span>` : ''}
      </div>
      <h2 class="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mb-2">${escapeHtml(section.title)}</h2>
      <p class="text-xs text-neutral-600 mb-8">${escapeHtml(section.subtitle || '')}</p>
      <form class="space-y-5" onsubmit="event.preventDefault(); alert('Session authenticated successfully');">
        ${(section.authFields || [
          { id: '1', label: 'Username', type: 'text', placeholder: 'Enter username' },
          { id: '2', label: 'Password', type: 'password', placeholder: '••••••••••••' }
        ]).map(f => `
        <div>
          <label class="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1.5">${escapeHtml(f.label)}</label>
          <input type="${f.type}" required placeholder="${escapeHtml(f.placeholder)}" class="w-full px-4 py-3 border-2 border-black text-sm bg-white text-black outline-none focus:ring-2 focus:ring-black font-mono" />
        </div>`).join('\n')}
        <div class="flex items-center justify-between pt-1 text-xs">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" class="w-4 h-4 border-2 border-black accent-black" />
            <span>Remember this device</span>
          </label>
          <a href="#" class="text-neutral-600 hover:text-black hover:underline">Forgot password?</a>
        </div>
        <button type="submit" class="w-full py-4 bg-black text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all shadow-sm">
          ${escapeHtml(section.ctaPrimary?.text || 'Sign In')} →
        </button>
      </form>
    </div>
  </section>`;

    case 'dashboard':
      return `
  <!-- Dashboard Section -->
  <section class="py-16 md:py-24 px-6 bg-white border-b-2 border-black">
    <div class="max-w-7xl mx-auto space-y-8">
      <div class="border-b-2 border-black pb-6">
        ${section.badge ? `<span class="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border border-black mb-2 inline-block">${escapeHtml(section.badge)}</span>` : ''}
        <h2 class="text-3xl font-black uppercase tracking-tight text-black">${escapeHtml(section.title)}</h2>
        <p class="text-xs text-neutral-600 mt-1">${escapeHtml(section.subtitle || '')}</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${(section.items || []).map(c => `
        <div class="border-2 border-black p-6 bg-white">
          <div class="text-[11px] font-mono font-bold uppercase text-neutral-600 mb-2">${escapeHtml(c.label || '')}</div>
          <div class="text-3xl font-black tracking-tight text-black mb-1">${escapeHtml(c.stat || '')}</div>
          <div class="text-[11px] font-mono text-neutral-700">${escapeHtml(c.description || '')}</div>
        </div>`).join('\n')}
      </div>
    </div>
  </section>`;

    case 'gallery':
      return `
  <!-- Gallery / Portfolio Section -->
  <section class="py-24 px-6 border-b-2 border-black bg-white">
    <div class="max-w-7xl mx-auto">
      <div class="mb-12">
        ${section.badge ? `<div class="text-xs font-mono font-bold uppercase tracking-widest text-black mb-3">[ ${escapeHtml(section.badge)} ]</div>` : ''}
        <h2 class="text-3xl sm:text-5xl font-black tracking-tight uppercase text-black">${escapeHtml(section.title)}</h2>
        <p class="text-base text-neutral-700 mt-2 max-w-xl">${escapeHtml(section.subtitle || '')}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${(section.items || []).map((item, idx) => `
        <div class="border-2 border-black p-6 bg-white flex flex-col justify-between">
          <div>
            <div class="w-full h-44 border-2 border-black bg-neutral-100 mb-6 flex items-center justify-center font-mono text-xs font-bold">
              // PREVIEW [0${idx + 1}]
            </div>
            <h3 class="text-lg font-bold uppercase tracking-tight text-black mb-2">${escapeHtml(item.title)}</h3>
            <p class="text-xs text-neutral-700">${escapeHtml(item.description || '')}</p>
          </div>
        </div>`).join('\n')}
      </div>
    </div>
  </section>`;

    case 'blog':
      return `
  <!-- Blog Section -->
  <section class="py-24 px-6 border-b-2 border-black bg-white">
    <div class="max-w-7xl mx-auto">
      <div class="mb-16">
        ${section.badge ? `<div class="text-xs font-mono font-bold uppercase tracking-widest text-black mb-3">[ ${escapeHtml(section.badge)} ]</div>` : ''}
        <h2 class="text-3xl sm:text-5xl font-black tracking-tight uppercase text-black mb-4">${escapeHtml(section.title)}</h2>
        <p class="text-base text-neutral-700 max-w-2xl">${escapeHtml(section.subtitle || '')}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${(section.items || []).map((art) => `
        <div class="border-2 border-black p-8 bg-white flex flex-col justify-between">
          <div>
            <h3 class="text-xl font-bold uppercase tracking-tight text-black mb-3">${escapeHtml(art.title)}</h3>
            <p class="text-sm text-neutral-700">${escapeHtml(art.description || '')}</p>
          </div>
        </div>`).join('\n')}
      </div>
    </div>
  </section>`;

    default:
      return `<!-- Section ${section.type} -->`;
  }
}

export function generateReactComponentCode(project: WebsiteProject): string {
  return `'use client';

import React, { useState } from 'react';

export default function ${project.title.replace(/[^a-zA-Z0-9]/g, '')}Website() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Generated by AI Agent Studio for: ${escapeHtml(project.prompt)} */}
      
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-black">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-black tracking-tighter uppercase text-black">
              ${escapeHtml(project.title)}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 border border-black">
              LIVE
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-tight">
            <a href="#features" className="hover:underline underline-offset-4">Features</a>
            <a href="#testimonials" className="hover:underline underline-offset-4">Testimonials</a>
            <a href="#pricing" className="hover:underline underline-offset-4">Pricing</a>
            <a href="#faq" className="hover:underline underline-offset-4">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="#pricing" className="px-5 py-2.5 text-xs uppercase font-bold tracking-wider bg-black text-white hover:bg-neutral-800 transition-all">
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <main>
        {/* Hero */}
        <section className="py-24 md:py-36 px-6 border-b border-black bg-white text-center">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 border border-black text-xs font-bold tracking-widest uppercase">
              ● PROVEN ARCHITECTURE
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] uppercase mb-8">
              ${escapeHtml(project.sections.find(s => s.type === 'hero')?.title || project.title)}
            </h1>
            <p className="text-lg sm:text-xl text-neutral-700 max-w-3xl mx-auto mb-12">
              ${escapeHtml(project.sections.find(s => s.type === 'hero')?.subtitle || project.description)}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#pricing" className="w-full sm:w-auto px-8 py-4 bg-black text-white font-bold text-sm tracking-wider uppercase hover:bg-neutral-800">
                Get Started Now →
              </a>
            </div>
          </div>
        </section>

        {/* Dynamic Section Mapping */}
        {/* Full JSON Schema & sections are reactive and editable in AI Agent Studio */}
      </main>
    </div>
  );
}
`;
}
