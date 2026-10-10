import { SectionType, SectionSpec } from '@/types';

export interface SectionTemplateRegistryItem {
  type: SectionType;
  name: string;
  category: 'Hero & Intro' | 'Content & Features' | 'Commerce & Services' | 'Social Proof & Media' | 'Forms & Contact' | 'Utility';
  description: string;
  variants: { id: string; name: string; thumbnailSvg: string }[];
  defaultProps: Record<string, any>;
  schemaFields: {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'rich-text' | 'number' | 'toggle' | 'select' | 'color' | 'image' | 'link' | 'repeatable';
    options?: string[];
    repeatableFields?: { key: string; label: string; type: string }[];
  }[];
}

export const SECTION_REGISTRY: SectionTemplateRegistryItem[] = [
  {
    type: 'hero',
    name: 'Hero Banner',
    category: 'Hero & Intro',
    description: 'High-impact headline banner with badge, subtitle, and primary/secondary CTA buttons.',
    variants: [
      { id: 'minimal-brutalist', name: 'Monochrome Brutalist', thumbnailSvg: '<rect width="100" height="60" fill="#000"/><text x="10" y="30" fill="#fff" font-size="10">HERO</text>' },
      { id: 'split-media', name: 'Split Image & Headline', thumbnailSvg: '<rect width="50" height="60" fill="#f3f4f6"/><rect x="50" width="50" height="60" fill="#000"/>' },
      { id: 'centered-badge', name: 'Centered Badge Glow', thumbnailSvg: '<rect width="100" height="60" fill="#fff" stroke="#000"/><circle cx="50" cy="20" r="4" fill="#f97316"/>' },
    ],
    defaultProps: {
      title: 'Built for Velocity & Maximum Impact',
      subtitle: 'Experience sub-millisecond responsiveness, modular components, and deterministic design.',
      badge: 'PROVEN ARCHITECTURE',
      ctaPrimaryText: 'Get Started Now',
      ctaPrimaryLink: 'contact.html',
      ctaSecondaryText: 'Learn More',
      ctaSecondaryLink: 'about.html',
    },
    schemaFields: [
      { key: 'badge', label: 'Badge Text', type: 'text' },
      { key: 'title', label: 'Headline Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle Description', type: 'textarea' },
      { key: 'ctaPrimaryText', label: 'Primary CTA Text', type: 'text' },
      { key: 'ctaPrimaryLink', label: 'Primary CTA Link', type: 'link' },
      { key: 'ctaSecondaryText', label: 'Secondary CTA Text', type: 'text' },
      { key: 'ctaSecondaryLink', label: 'Secondary CTA Link', type: 'link' },
    ],
  },
  {
    type: 'features',
    name: 'Features & Capabilities',
    category: 'Content & Features',
    description: 'Grid of key features, value propositions, or architectural highlights.',
    variants: [
      { id: 'grid-cards', name: 'Bordered Grid Cards', thumbnailSvg: '<rect width="30" height="40" fill="#eee"/><rect x="35" width="30" height="40" fill="#eee"/><rect x="70" width="30" height="40" fill="#eee"/>' },
      { id: 'numbered-list', name: 'Numbered Step List', thumbnailSvg: '<text x="10" y="20" font-size="8">01</text><text x="10" y="40" font-size="8">02</text>' },
    ],
    defaultProps: {
      title: 'Core Capabilities',
      subtitle: 'Engineered specifically for high-converting user flows.',
      badge: 'FEATURES',
      items: [
        { title: 'Sub-Millisecond Speed', description: 'Optimized static compilation with zero runtime overhead.' },
        { title: 'Evidence-Backed Copy', description: 'Every claim is automatically researched and verified against web sources.' },
        { title: 'Zero Collateral Edits', description: 'Byte-isolated patches guarantee unedited sections remain untouched.' },
      ],
    },
    schemaFields: [
      { key: 'badge', label: 'Badge Label', type: 'text' },
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
      {
        key: 'items',
        label: 'Feature Items List',
        type: 'repeatable',
        repeatableFields: [
          { key: 'title', label: 'Feature Title', type: 'text' },
          { key: 'description', label: 'Feature Description', type: 'textarea' },
        ],
      },
    ],
  },
  {
    type: 'pricing',
    name: 'Pricing Plans',
    category: 'Commerce & Services',
    description: '3-tier pricing breakdown with monthly/yearly toggle, feature checkmarks, and CTA buttons.',
    variants: [
      { id: '3-tier-popular', name: '3-Tier Most Popular Highlight', thumbnailSvg: '<rect width="30" height="50" fill="#fff" stroke="#000"/><rect x="35" width="30" height="55" fill="#000"/><rect x="70" width="30" height="50" fill="#fff" stroke="#000"/>' },
      { id: 'horizontal-table', name: 'Comparison Table', thumbnailSvg: '<rect width="100" height="20" fill="#eee"/><rect y="25" width="100" height="20" fill="#fff"/>' },
    ],
    defaultProps: {
      title: 'Simple, Transparent Pricing',
      subtitle: 'Choose the plan tailored to your operating scale.',
      badge: 'PRICING',
      items: [
        { title: 'Starter Tier', price: '$29', period: '/month', description: 'Essential features for small teams.', features: ['1 Verified Site', 'Standard Verification Crawler', 'Basic Export'] },
        { title: 'Professional', price: '$79', period: '/month', badge: 'MOST POPULAR', description: 'Advanced features for scaling operations.', features: ['10 Verified Sites', 'Full Playwright Crawler', 'Priority Research AI', 'Instant ZIP Export'] },
        { title: 'Enterprise', price: '$199', period: '/month', description: 'Unlimited scale for large organizations.', features: ['Unlimited Projects', 'Dedicated API Limits', 'Custom Domain SSL', 'SOC2 Compliance'] },
      ],
    },
    schemaFields: [
      { key: 'badge', label: 'Badge Label', type: 'text' },
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
      {
        key: 'items',
        label: 'Pricing Plans',
        type: 'repeatable',
        repeatableFields: [
          { key: 'title', label: 'Plan Name', type: 'text' },
          { key: 'price', label: 'Price (e.g. $49)', type: 'text' },
          { key: 'period', label: 'Period (e.g. /month)', type: 'text' },
          { key: 'badge', label: 'Popular Badge', type: 'text' },
          { key: 'description', label: 'Short Description', type: 'textarea' },
        ],
      },
    ],
  },
  {
    type: 'testimonials',
    name: 'Testimonial Slider',
    category: 'Social Proof & Media',
    description: 'Quotes, client avatars, role titles, and star ratings.',
    variants: [
      { id: 'quote-cards', name: 'Card Grid Testimonials', thumbnailSvg: '<rect width="45" height="40" fill="#eee"/><rect x="50" width="45" height="40" fill="#eee"/>' },
    ],
    defaultProps: {
      title: 'Trusted by Industry Leaders',
      subtitle: 'See what our partners say about SiteForge.',
      badge: 'TESTIMONIALS',
      items: [
        { quote: 'SiteForge eliminated our deployment lag completely. Verified working sites in minutes.', author: 'Elena Rostova', role: 'VP of Product, Nexa' },
        { quote: 'The evidence-backed claims feature gives our clients immediate confidence.', author: 'Marcus Vance', role: 'Managing Partner' },
      ],
    },
    schemaFields: [
      { key: 'badge', label: 'Badge Label', type: 'text' },
      { key: 'title', label: 'Section Title', type: 'text' },
      {
        key: 'items',
        label: 'Testimonials List',
        type: 'repeatable',
        repeatableFields: [
          { key: 'quote', label: 'Testimonial Quote', type: 'textarea' },
          { key: 'author', label: 'Author Name', type: 'text' },
          { key: 'role', label: 'Role / Company', type: 'text' },
        ],
      },
    ],
  },
  {
    type: 'faq',
    name: 'FAQ Accordion',
    category: 'Content & Features',
    description: 'Frequently asked questions with expandable accordion items.',
    variants: [
      { id: 'accordion-bordered', name: 'Bordered Accordion', thumbnailSvg: '<line x1="0" y1="15" x2="100" y2="15" stroke="#000"/><line x1="0" y1="30" x2="100" y2="30" stroke="#000"/>' },
    ],
    defaultProps: {
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about our services.',
      badge: 'FAQ',
      items: [
        { question: 'How does the Playwright crawler verification work?', answer: 'Our headless agent crawls every link, form, button, and modal before export to guarantee zero broken elements.' },
        { question: 'Can I export the site code completely standalone?', answer: 'Yes! SiteForge exports clean static HTML/CSS/JS without any vendor lock-in.' },
      ],
    },
    schemaFields: [
      { key: 'badge', label: 'Badge Label', type: 'text' },
      { key: 'title', label: 'Section Title', type: 'text' },
      {
        key: 'items',
        label: 'FAQ Items',
        type: 'repeatable',
        repeatableFields: [
          { key: 'question', label: 'Question Title', type: 'text' },
          { key: 'answer', label: 'Answer Content', type: 'textarea' },
        ],
      },
    ],
  },
  {
    type: 'contact',
    name: 'Contact & Inquiry Form',
    category: 'Forms & Contact',
    description: 'Interactive contact form with input validation and direct submission logging.',
    variants: [
      { id: 'boxed-card', name: 'High-Contrast Boxed Form', thumbnailSvg: '<rect width="60" height="50" fill="#fff" stroke="#000" x="20" y="5"/>' },
    ],
    defaultProps: {
      title: 'Get In Touch',
      subtitle: 'Our technical team responds within 4 business hours.',
      badge: 'CONTACT US',
      ctaText: 'Send Direct Message',
    },
    schemaFields: [
      { key: 'badge', label: 'Badge Label', type: 'text' },
      { key: 'title', label: 'Form Title', type: 'text' },
      { key: 'subtitle', label: 'Form Subtitle', type: 'textarea' },
      { key: 'ctaText', label: 'Button Submit Text', type: 'text' },
    ],
  },
];

export function getRegistryItem(type: SectionType): SectionTemplateRegistryItem | undefined {
  return SECTION_REGISTRY.find((r) => r.type === type);
}
