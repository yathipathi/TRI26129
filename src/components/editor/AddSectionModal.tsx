'use client';

import React, { useState } from 'react';
import { Section, SectionType } from '@/types';
import { X, Layout, Layers, Quote, CreditCard, HelpCircle, ArrowRight, Mail, BarChart3, Lock, Activity, Image as ImageIcon, BookOpen, ExternalLink, Search, Sparkles } from 'lucide-react';
import { generateId } from '@/lib/ai-generator';

interface AddSectionModalProps {
  isOpen: boolean;
  insertIndex: number;
  onClose: () => void;
  onAddSection: (newSection: Section, insertIndex: number) => void;
}

const sectionTemplates: {
  type: SectionType;
  category: 'business' | 'portfolio' | 'ecommerce' | 'telemetry' | 'auth';
  title: string;
  badgeTag: string;
  desc: string;
  icon: React.ElementType;
  build: () => Section;
}[] = [
  {
    type: 'dashboard',
    category: 'telemetry',
    title: 'India vs Pakistan Development Growth (Pie Chart)',
    badgeTag: 'HOSTINGER TELEMETRY',
    desc: 'Interactive regional pie chart featuring India (Orange #F97316) & Pakistan (Green #16A34A) with GDP, IT exports, and clean energy telemetry.',
    icon: Activity,
    build: () => ({
      id: generateId('sec-dash'),
      type: 'dashboard',
      title: 'India & Pakistan Development Growth Telemetry',
      subtitle: 'Comparative macroeconomic telemetry featuring vibrant Orange (India) and Green (Pakistan) pie chart analytics.',
      badge: 'PIE CHART TELEMETRY',
      items: [
        { id: generateId(), stat: '7.2% CAGR', label: 'India GDP Growth 🇮🇳 (Orange)', description: '$4.1T Nominal Output' },
        { id: generateId(), stat: '2.8% CAGR', label: 'Pakistan GDP Growth 🇵🇰 (Green)', description: '$380B Nominal Output' },
        { id: generateId(), stat: '$245.0B', label: 'India Tech Exports 🇮🇳 (Orange)', description: '+18.4% Tech Expansion' },
        { id: generateId(), stat: '$3.2B', label: 'Pakistan Tech Exports 🇵🇰 (Green)', description: '+12.1% Freelance IT' },
      ],
    }),
  },
  {
    type: 'hero',
    category: 'business',
    title: 'Hostinger Modern Business & SaaS Hero',
    badgeTag: 'HOSTINGER HERO',
    desc: 'High-impact SaaS hero section with primary/secondary callouts, badge status, and clear spatial hierarchy.',
    icon: Layout,
    build: () => ({
      id: generateId('sec-hero'),
      type: 'hero',
      title: 'Architecting the Future of High-Velocity Web Apps',
      subtitle: 'Engineered for relentless performance, uncompromising reliability, and zero latency at global scale.',
      badge: 'PRO TEMPLATE',
      ctaPrimary: { text: 'Get Started Now', link: '/pricing' },
      ctaSecondary: { text: 'Explore Features', link: '/features' },
    }),
  },
  {
    type: 'features',
    category: 'business',
    title: 'Hostinger 3-Column Features Grid',
    badgeTag: 'CAPABILITIES GRID',
    desc: 'Structured 3-column feature grid with badges, icons, and crisp typography.',
    icon: Layers,
    build: () => ({
      id: generateId('sec-feat'),
      type: 'features',
      title: 'Engineered for Scale & Reliability',
      subtitle: 'Every architectural primitive required to deploy and scale modern web applications.',
      badge: 'CORE FEATURES',
      items: [
        { id: generateId(), title: 'Sub-Millisecond Engine', description: 'Deterministic low-latency computation across 40+ global edge nodes.', badge: 'SPEED' },
        { id: generateId(), title: 'Cryptographic Integrity', description: 'Immutable state verification and automated SOC2 posture auditing.', badge: 'SECURITY' },
        { id: generateId(), title: 'Universal Data Adapters', description: 'Seamless connectivity with PostgreSQL, Supabase, Redis, and REST APIs.', badge: 'CONNECT' },
      ],
    }),
  },
  {
    type: 'pricing',
    category: 'ecommerce',
    title: 'Hostinger Subscription & Tier Matrix',
    badgeTag: 'TIERS MATRIX',
    desc: 'Transparent pricing matrix with Starter, Pro, and Enterprise tiers plus feature checklists.',
    icon: CreditCard,
    build: () => ({
      id: generateId('sec-price'),
      type: 'pricing',
      title: 'Transparent, Predictable Infrastructure Pricing',
      subtitle: 'Choose the optimal tier tailored to your team and throughput requirements.',
      badge: 'PRICING TIERS',
      items: [
        { id: generateId(), title: 'Starter Tier', price: '$0', period: '/ month', description: 'For rapid prototyping and individual projects.', features: ['Core system access', 'Community support', '1 Active workspace'] },
        { id: generateId(), title: 'Pro Scale', price: '$49', period: '/ month', badge: 'MOST POPULAR', description: 'For high-velocity startups and teams.', features: ['Unlimited generations', 'Priority edge routing', '5 Team seats', 'Slack SLA'] },
        { id: generateId(), title: 'Enterprise VPC', price: '$199', period: '/ month', badge: 'DEDICATED', description: 'For mission-critical enterprise workloads.', features: ['Isolated VPC cluster', '99.999% SLA uptime', '24/7 Dedicated phone support'] },
      ],
    }),
  },
  {
    type: 'gallery',
    category: 'portfolio',
    title: 'Hostinger Portfolio & Works Gallery',
    badgeTag: 'CREATIVE GALLERY',
    desc: 'Curated gallery index for showcases, architectural projects, case studies, and photography.',
    icon: ImageIcon,
    build: () => ({
      id: generateId('sec-gal'),
      type: 'gallery',
      title: 'Selected Projects & Case Studies',
      subtitle: 'A curated selection of architectural commissions, digital products, and brand systems.',
      badge: 'PORTFOLIO INDEX',
    }),
  },
  {
    type: 'auth',
    category: 'auth',
    title: 'Hostinger Encrypted Auth Portal',
    badgeTag: 'SECURE ENCLAVE',
    desc: 'Full-featured login & authentication card with username, password, and session security.',
    icon: Lock,
    build: () => ({
      id: generateId('sec-auth'),
      type: 'auth',
      title: 'Sign In to Your Account',
      subtitle: 'Enter your credentials to access your secure edge workspace.',
      badge: 'SECURE PORTAL',
      authFields: [
        { id: generateId(), label: 'Username or Work Email', type: 'text', placeholder: 'user@company.com' },
        { id: generateId(), label: 'Password', type: 'password', placeholder: '••••••••••••' },
      ],
      ctaPrimary: { text: 'Authenticate Session', link: '/dashboard' },
    }),
  },
  {
    type: 'testimonials',
    category: 'business',
    title: 'Hostinger Social Proof & Testimonials',
    badgeTag: 'CREDIBILITY',
    desc: 'Customer quotes, author names, company roles, and credibility badges.',
    icon: Quote,
    build: () => ({
      id: generateId('sec-test'),
      type: 'testimonials',
      title: 'Trusted by Industry Leaders',
      subtitle: 'Hear directly from architects, founders, and CTOs using our engine.',
      badge: 'ENDORSEMENTS',
      items: [
        { id: generateId(), description: '"This platform reduced our deployment cycle by 80%. An indispensable asset for high-velocity teams."', author: 'Sarah Jenkins', role: 'CTO at HyperGrid' },
        { id: generateId(), description: '"The minimalist monochrome styling and raw compilation speed make building a true pleasure."', author: 'David Zhang', role: 'Staff Engineer at NovaCore' },
      ],
    }),
  },
  {
    type: 'faq',
    category: 'business',
    title: 'Hostinger FAQ Accordion',
    badgeTag: 'KNOWLEDGE BASE',
    desc: 'Collapsible Q&A list addressing common user inquiries, integrations, and deployment.',
    icon: HelpCircle,
    build: () => ({
      id: generateId('sec-faq'),
      type: 'faq',
      title: 'Frequently Asked Questions',
      subtitle: 'Answers to key questions regarding deployment, code export, and hosting.',
      badge: 'HELP DESK',
      items: [
        { id: generateId(), question: 'How do I export the full-stack code?', answer: 'Click the Export button in the canvas header to download standalone HTML or React/Next.js component trees.' },
        { id: generateId(), question: 'Can I connect custom domain names?', answer: 'Yes, 1-click Netlify Edge and Vercel Edge deployment support custom domains with automated SSL.' },
      ],
    }),
  },
  {
    type: 'contact',
    category: 'business',
    title: 'Hostinger Enterprise Contact Desk',
    badgeTag: 'LEAD INTAKE',
    desc: 'Direct enterprise lead intake form with response SLA commitments.',
    icon: Mail,
    build: () => ({
      id: generateId('sec-contact'),
      type: 'contact',
      title: 'Initiate an Enterprise Inquiry',
      subtitle: 'Speak directly with a systems architect regarding custom VPC setups and SLAs.',
      badge: 'DIRECT INTAKE',
    }),
  },
  {
    type: 'blog',
    category: 'portfolio',
    title: 'Hostinger Dispatches & Blog Grid',
    badgeTag: 'PUBLICATIONS',
    desc: 'Article feed with publish dates, author tags, and reading time metrics.',
    icon: BookOpen,
    build: () => ({
      id: generateId('sec-blog'),
      type: 'blog',
      title: 'Recent Dispatches & Research',
      subtitle: 'Technical essays on high-throughput compilers and spatial design.',
      badge: 'BLOG FEED',
    }),
  },
  {
    type: 'stats',
    category: 'business',
    title: 'Hostinger KPI & Metric Counter',
    badgeTag: 'METRICS BAR',
    desc: 'Numeric proof points and performance stats in high contrast.',
    icon: BarChart3,
    build: () => ({
      id: generateId('sec-stats'),
      type: 'stats',
      title: 'Metrics that Drive Conviction',
      subtitle: 'Proven performance benchmarks across global infrastructure.',
      items: [
        { id: generateId(), stat: '99.999%', label: 'Uptime SLA' },
        { id: generateId(), stat: '10M+', label: 'Daily Requests' },
        { id: generateId(), stat: '< 8ms', label: 'Median Latency' },
        { id: generateId(), stat: '100%', label: 'Deterministic' },
      ],
    }),
  },
  {
    type: 'cta',
    category: 'business',
    title: 'Hostinger Call To Action Banner',
    badgeTag: 'CONVERSION',
    desc: 'Full-bleed high-contrast banner designed for maximum conversion velocity.',
    icon: ArrowRight,
    build: () => ({
      id: generateId('sec-cta'),
      type: 'cta',
      title: 'Ready to Experience Peak Velocity?',
      subtitle: 'Start building production-grade digital experiences in seconds.',
      badge: 'GET STARTED',
      ctaPrimary: { text: 'Create Free Account', link: '/pricing' },
    }),
  },
];

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  isOpen,
  insertIndex,
  onClose,
  onAddSection,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredTemplates = sectionTemplates.filter((t) => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.badgeTag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-2 border-black max-w-4xl w-full max-h-[92vh] flex flex-col shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
        {/* Modal Top Header Bar */}
        <div className="p-6 border-b-2 border-black bg-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border border-black bg-black text-white">
                HOSTINGER DESIGN CATALOG
              </span>
              <span className="text-[10px] font-mono text-neutral-600 font-bold">
                INSERT AT #{insertIndex + 1}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <span>Section Template Library</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.hostinger.com/templates/website"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-black text-xs font-mono font-bold uppercase text-black hover:bg-neutral-100 transition-colors"
            >
              <span>Hostinger Catalog</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="p-4 border-b-2 border-black bg-neutral-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-mono">
            {[
              { id: 'all', label: 'All Templates' },
              { id: 'telemetry', label: 'India/Pak Telemetry' },
              { id: 'business', label: 'Business & SaaS' },
              { id: 'ecommerce', label: 'E-Commerce' },
              { id: 'portfolio', label: 'Portfolio' },
              { id: 'auth', label: 'Auth Enclave' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 border border-black text-[11px] font-bold uppercase whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Hostinger templates..."
              className="pl-9 pr-3 py-1.5 border border-black bg-white text-xs font-mono text-black placeholder:text-neutral-400 outline-none focus:ring-1 focus:ring-black w-full sm:w-64"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const IconComp = template.icon;
            const isTelemetry = template.category === 'telemetry';

            return (
              <button
                key={template.title}
                onClick={() => {
                  onAddSection(template.build(), insertIndex);
                  onClose();
                }}
                className={`p-5 border-2 border-black bg-white hover:bg-neutral-50 text-left transition-all hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] group flex flex-col justify-between relative ${
                  isTelemetry ? 'ring-2 ring-orange-500' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 border-2 border-black bg-black text-white flex items-center justify-center group-hover:bg-neutral-800 transition-colors">
                      <IconComp className="w-4 h-4 text-white" />
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 border border-black ${
                        isTelemetry ? 'bg-orange-100 text-orange-900 border-orange-500' : 'bg-neutral-100 text-black'
                      }`}
                    >
                      {template.badgeTag}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm uppercase tracking-tight text-black mb-1.5 group-hover:underline decoration-2">
                    {template.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                    {template.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between text-[10px] font-mono font-bold text-neutral-500 uppercase group-hover:text-black">
                  <span>Click to Insert</span>
                  <span>→</span>
                </div>
              </button>
            );
          })}

          {filteredTemplates.length === 0 && (
            <div className="col-span-full text-center py-12 border-2 border-dashed border-neutral-300">
              <p className="text-sm font-mono text-neutral-500 mb-2">No templates found matching "{searchQuery}"</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 border border-black text-xs font-mono font-bold uppercase bg-black text-white hover:bg-neutral-800"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
