import { Section, SectionType, WebsiteProject, WebsitePage, AuthField, SectionItem } from '@/types';

// Helper to generate unique IDs
export const generateId = (prefix = 'item') => `${prefix}-${Math.random().toString(36).substring(2, 9)}`;

/**
 * Universal Intelligent AI Website Compiler
 * Handles ANY arbitrary user prompt and compiles tailored layouts, copy, metrics, and components.
 */
/**
 * Universal Intelligent AI Website Compiler
 * Handles ANY arbitrary user prompt and compiles tailored layouts, copy, metrics, and components.
 * Supports incremental conversation commands (Add section, Remove section, Change copy, etc.)
 */
export function generateSmartWebsite(prompt: string, currentProject?: WebsiteProject | null): WebsiteProject {
  const p = prompt.toLowerCase();

  // CHECK FOR CONVERSATIONAL MODIFICATIONS TO EXISTING PROJECT
  if (currentProject && currentProject.sections && currentProject.sections.length > 0) {
    // 1. ADD SECTION COMMANDS
    if (p.startsWith('add ') || p.includes('add a ') || p.includes('add an ') || p.includes('include a ') || p.includes('insert a ')) {
      const updated = JSON.parse(JSON.stringify(currentProject)) as WebsiteProject;
      const footerIndex = updated.sections.findIndex(s => s.type === 'footer');
      const insertAt = footerIndex !== -1 ? footerIndex : updated.sections.length;

      if (p.includes('testimonial') || p.includes('review')) {
        updated.sections.splice(insertAt, 0, {
          id: generateId('sec-test'),
          type: 'testimonials',
          title: 'Trusted by Industry Leaders',
          subtitle: `See what our clients and partners say about working with ${updated.title}.`,
          badge: 'TESTIMONIALS',
          items: [
            { id: generateId(), description: '"The efficiency and precision provided exceeded every expectation. An indispensable partner."', author: 'Sarah Jenkins', role: 'Head of Operations, Nexa', avatar: 'SJ' },
            { id: generateId(), description: '"Clean minimalist execution and deterministic reliability across the board."', author: 'Marcus Vance', role: 'Director of Technology, Apex', avatar: 'MV' },
          ]
        });
        updated.updatedAt = Date.now();
        return updated;
      }

      if (p.includes('contact') || p.includes('form') || p.includes('reach out')) {
        updated.sections.splice(insertAt, 0, {
          id: generateId('sec-contact'),
          type: 'contact',
          title: 'Get In Touch',
          subtitle: `Have a question or custom inquiry? Our team is available 24/7.`,
          badge: 'CONTACT US',
        });
        updated.updatedAt = Date.now();
        return updated;
      }

      if (p.includes('faq') || p.includes('question')) {
        updated.sections.splice(insertAt, 0, {
          id: generateId('sec-faq'),
          type: 'faq',
          title: 'Frequently Asked Questions',
          subtitle: 'Direct answers to the most common inquiries regarding our services.',
          badge: 'FAQ',
          items: [
            { id: generateId(), question: `How do I get started with ${updated.title}?`, answer: 'Select your preferred tier or submit an inquiry through our direct contact form.' },
            { id: generateId(), question: 'Can I cancel or modify my subscription anytime?', answer: 'Yes, all plans include 100% self-service tier management with zero lock-in.' },
          ]
        });
        updated.updatedAt = Date.now();
        return updated;
      }

      if (p.includes('pricing') || p.includes('tier') || p.includes('cost')) {
        updated.sections.splice(insertAt, 0, {
          id: generateId('sec-price'),
          type: 'pricing',
          title: 'Transparent, Predictable Pricing',
          subtitle: 'Choose the optimal package tailored to your exact requirements.',
          badge: 'PRICING',
          items: [
            { id: generateId(), title: 'Starter Tier', price: '$29', period: '/ month', description: 'Essential access for individual builders.', features: ['Core platform access', 'Community support', 'Standard SLA'] },
            { id: generateId(), title: 'Pro Tier', price: '$89', period: '/ month', badge: 'MOST POPULAR', description: 'Advanced throughput for high-velocity teams.', features: ['Unlimited projects', 'Priority support', 'Custom webhooks', 'Dedicated analytics'] },
          ]
        });
        updated.updatedAt = Date.now();
        return updated;
      }

      if (p.includes('team') || p.includes('member')) {
        updated.sections.splice(insertAt, 0, {
          id: generateId('sec-team'),
          type: 'team',
          title: 'Leadership & Architecture Team',
          subtitle: 'The engineering and design minds powering our platform.',
          badge: 'OUR TEAM',
          items: [
            { id: generateId(), author: 'Dr. Elena Rostova', role: 'Chief Technical Officer', description: 'Former Principal Architect at Google DeepMind.' },
            { id: generateId(), author: 'Alexander Wright', role: 'Head of Product Design', description: 'Pioneer in monochrome minimal UI systems.' },
          ]
        });
        updated.updatedAt = Date.now();
        return updated;
      }
    }

    // 2. REMOVE / DELETE SECTION COMMANDS
    if (p.startsWith('remove ') || p.startsWith('delete ') || p.includes('remove the ') || p.includes('delete the ')) {
      const updated = JSON.parse(JSON.stringify(currentProject)) as WebsiteProject;
      if (p.includes('pricing')) updated.sections = updated.sections.filter(s => s.type !== 'pricing');
      if (p.includes('testimonial')) updated.sections = updated.sections.filter(s => s.type !== 'testimonials');
      if (p.includes('faq')) updated.sections = updated.sections.filter(s => s.type !== 'faq');
      if (p.includes('contact')) updated.sections = updated.sections.filter(s => s.type !== 'contact');
      if (p.includes('stats')) updated.sections = updated.sections.filter(s => s.type !== 'stats');
      if (p.includes('features')) updated.sections = updated.sections.filter(s => s.type !== 'features');
      updated.updatedAt = Date.now();
      return updated;
    }

    // 3. RENAME BRAND / TITLE COMMANDS
    const renameMatch = prompt.match(/(?:rename|change name to|call it|brand:?)\s+["']?([A-Za-z0-9\s'&]+?)["']?(?:\.|\,|$)/i);
    if (renameMatch && renameMatch[1]) {
      const newName = renameMatch[1].trim();
      const updated = JSON.parse(JSON.stringify(currentProject)) as WebsiteProject;
      updated.title = newName;
      updated.sections.forEach(s => {
        if (s.type === 'navbar') s.title = newName;
        if (s.type === 'footer') s.title = newName;
      });
      updated.updatedAt = Date.now();
      return updated;
    }

    // 4. SWITCH PAGE COMMANDS
    if (
      p.startsWith('go to ') || 
      p.startsWith('switch to ') || 
      p.startsWith('open ') || 
      p.includes('view page') || 
      p.includes('show page')
    ) {
      if (currentProject.pages && currentProject.pages.length > 0) {
        let targetSlug = '/';
        if (p.includes('pricing') || p.includes('tier')) targetSlug = '/pricing';
        else if (p.includes('feature') || p.includes('spec') || p.includes('capability')) targetSlug = '/features';
        else if (p.includes('dashboard') || p.includes('telemetry') || p.includes('console') || p.includes('analytics')) targetSlug = '/dashboard';
        else if (p.includes('contact') || p.includes('inquiry') || p.includes('support')) targetSlug = '/contact';
        else if (p.includes('home') || p.includes('landing')) targetSlug = '/';

        const matchedPage = currentProject.pages.find(page => page.slug === targetSlug);
        if (matchedPage) {
          const updated = JSON.parse(JSON.stringify(currentProject)) as WebsiteProject;
          updated.activePageSlug = matchedPage.slug;
          updated.sections = matchedPage.sections;
          updated.updatedAt = Date.now();
          return updated;
        }
      }
    }

    // 5. ADD NEW PAGE COMMANDS
    if (p.startsWith('add page') || p.includes('create page') || p.includes('new page')) {
      const pageNameMatch = prompt.match(/(?:page|called|named)\s+["']?([A-Za-z0-9\s]+?)["']?(?:\s+with|\s+that|\.|\,|$)/i);
      const rawPageName = pageNameMatch && pageNameMatch[1] ? pageNameMatch[1].trim() : 'Overview';
      const pageSlug = `/${rawPageName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      const updated = JSON.parse(JSON.stringify(currentProject)) as WebsiteProject;
      if (!updated.pages) updated.pages = [];

      const newPage: WebsitePage = {
        id: generateId('page'),
        name: rawPageName,
        slug: pageSlug,
        title: `${updated.title} // ${rawPageName}`,
        description: `Dedicated ${rawPageName} section for ${updated.title}.`,
        sections: [
          {
            id: generateId('sec-nav'),
            type: 'navbar',
            title: updated.title,
            badge: 'v2.6',
            items: [
              { id: generateId(), title: 'Home', description: '/' },
              { id: generateId(), title: 'Features', description: '/features' },
              { id: generateId(), title: 'Pricing', description: '/pricing' },
              { id: generateId(), title: 'Contact', description: '/contact' },
            ],
            ctaPrimary: { text: 'Get Started', link: '/pricing' },
          },
          {
            id: generateId('sec-hero'),
            type: 'hero',
            title: `${rawPageName} Overview & Capabilities`,
            subtitle: `Detailed specifications and operational workflows for ${rawPageName}.`,
            badge: 'OVERVIEW',
            ctaPrimary: { text: 'Explore Pricing', link: '/pricing' },
            ctaSecondary: { text: 'Contact Us', link: '/contact' },
          },
          {
            id: generateId('sec-foot'),
            type: 'footer',
            title: updated.title,
            subtitle: `© ${new Date().getFullYear()} ${updated.title}. All rights reserved.`,
          },
        ],
      };

      updated.pages.push(newPage);
      updated.activePageSlug = newPage.slug;
      updated.sections = newPage.sections;
      updated.updatedAt = Date.now();
      return updated;
    }
  }

  // Generate full Lovable-grade Multi-Page Project from User Prompt
  return generateMultiPageProject(prompt);
}

// -----------------------------------------------------------------------------------------
// 1. Auth & Login Project Generator
// -----------------------------------------------------------------------------------------

export function generateAuthProject(prompt: string): WebsiteProject {
  const p = prompt.toLowerCase();
  let title = 'Sign In to Your Workspace';
  let subtitle = 'Enter your authenticated credentials to access secure edge clusters and workspaces.';

  if (p.includes('signup') || p.includes('sign up') || p.includes('register')) {
    title = 'Create Your Free Account';
    subtitle = 'Start building and scaling in under 60 seconds with deterministic infrastructure.';
  }

  // Check if user asked for specific fields
  const authFields: AuthField[] = [];
  if (p.includes('username') || p.includes('user')) {
    authFields.push({ id: generateId(), label: 'Username', type: 'text', placeholder: 'e.g. alex_rivera', required: true });
  } else {
    authFields.push({ id: generateId(), label: 'Work Email or Username', type: 'text', placeholder: 'name@company.com', required: true });
  }

  if (p.includes('phone') || p.includes('mobile')) {
    authFields.push({ id: generateId(), label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 000-0000', required: true });
  }

  authFields.push({ id: generateId(), label: 'Password', type: 'password', placeholder: '••••••••••••', required: true });

  const sections: Section[] = [
    {
      id: generateId('sec-nav'),
      type: 'navbar',
      title: 'KORE AUTH',
      badge: 'SECURE ENCLAVE',
      items: [
        { id: generateId(), title: 'Documentation', description: '#docs' },
        { id: generateId(), title: 'Security Architecture', description: '#security' },
        { id: generateId(), title: 'System Status', description: '#status' },
      ],
      ctaPrimary: { text: 'Create Account', link: '#signup' },
      ctaSecondary: { text: 'Help Center', link: '#help' },
    },
    {
      id: generateId('sec-auth'),
      type: 'auth',
      title: title,
      subtitle: subtitle,
      badge: 'ENCRYPTED PORTAL',
      authFields: authFields,
      ctaPrimary: { text: 'Authenticate Session', link: '#dashboard' },
    },
    {
      id: generateId('sec-stats'),
      type: 'stats',
      title: 'Cryptographic Guarantees',
      subtitle: 'Zero-trust architecture trusted by tier-1 security institutions.',
      items: [
        { id: generateId(), stat: '256-Bit', label: 'AES Encryption', description: 'At-rest and in-transit' },
        { id: generateId(), stat: 'SOC 2', label: 'Type II Certified', description: 'Continuous compliance' },
        { id: generateId(), stat: '0.00%', label: 'Breach Record', description: 'Zero single point of failure' },
        { id: generateId(), stat: '< 2ms', label: 'Token Verification', description: 'Global edge cache' },
      ],
    },
    {
      id: generateId('sec-foot'),
      type: 'footer',
      title: 'KORE AUTH SYSTEMS',
      subtitle: `© ${new Date().getFullYear()} Kore Security Inc. All rights reserved.`,
      items: [
        { id: generateId(), title: 'Security', description: 'SOC2 Report, Vulnerability Disclosure, Compliance, Encryption' },
        { id: generateId(), title: 'Legal', description: 'Privacy Policy, Terms of Service, DPA Agreement' },
      ],
    },
  ];

  return {
    id: generateId('proj'),
    title: 'Authentication & Access Portal',
    description: `Login and account verification system for: ${prompt}`,
    prompt,
    industry: 'Security & Identity',
    tone: 'Secure, Precise, Monochrome',
    sections,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// -----------------------------------------------------------------------------------------
// 2. Dashboard Project Generator
// -----------------------------------------------------------------------------------------

export function generateDashboardProject(prompt: string): WebsiteProject {
  const sections: Section[] = [
    {
      id: generateId('sec-nav'),
      type: 'navbar',
      title: 'KERNEL // CONTROL',
      badge: 'LIVE CLUSTER',
      items: [
        { id: generateId(), title: 'Overview', description: '#overview' },
        { id: generateId(), title: 'Deployments', description: '#deployments' },
        { id: generateId(), title: 'Telemetry', description: '#telemetry' },
        { id: generateId(), title: 'Settings', description: '#settings' },
      ],
      ctaPrimary: { text: '+ Deploy Service', link: '#new' },
    },
    {
      id: generateId('sec-dash'),
      type: 'dashboard',
      title: 'Real-Time Telemetry & Operations',
      subtitle: 'Continuous health monitoring, request throughput, and live cluster state.',
      badge: 'MONITORING ACTIVE',
      items: [
        { id: generateId(), stat: '$248,920', label: 'Gross Processed Volume', description: '+21.4% vs 30d trailing' },
        { id: generateId(), stat: '99.999%', label: 'Cluster Uptime SLA', description: 'Zero dropped packets' },
        { id: generateId(), stat: '8.4ms', label: 'P99 Edge Latency', description: 'Across 42 regions' },
        { id: generateId(), stat: '1.4M', label: 'Active Invocations', description: 'Real-time telemetry' },
      ],
    },
    {
      id: generateId('sec-feat'),
      type: 'features',
      title: 'Autonomous System Controls',
      subtitle: 'Granular primitives to inspect, throttle, and scale edge microservices.',
      badge: 'TOOLING',
      items: [
        { id: generateId(), title: 'Auto-Scaling Mesh', description: 'Instant replica scaling triggered by telemetry threshold spikes.', badge: 'INFRA', icon: 'Cpu' },
        { id: generateId(), title: 'Cryptographic Audit Trail', description: 'Immutable log replication synchronized across distributed ledgers.', badge: 'SECURITY', icon: 'Shield' },
        { id: generateId(), title: 'Real-Time Edge Routing', description: 'Zero-latency traffic redirection to closest healthy point of presence.', badge: 'NETWORK', icon: 'Zap' },
      ],
    },
    {
      id: generateId('sec-foot'),
      type: 'footer',
      title: 'KERNEL OS DASHBOARD',
      subtitle: `© ${new Date().getFullYear()} Kernel Telemetry Systems. Precision operations.`,
      items: [
        { id: generateId(), title: 'Telemetry', description: 'Live Metrics, Node Health, Logs, Edge Topology' },
        { id: generateId(), title: 'Infrastructure', description: 'Clusters, VPC Peering, Edge Cache, IAM' },
      ],
    },
  ];

  return {
    id: generateId('proj'),
    title: 'Operations Dashboard & Control Center',
    description: `Real-time management dashboard generated for: ${prompt}`,
    prompt,
    industry: 'Cloud Infrastructure & DevOps',
    tone: 'High-Density, Precise, Monochrome',
    sections,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// -----------------------------------------------------------------------------------------
// 3. Portfolio & Creative Project Generator
// -----------------------------------------------------------------------------------------

export function generatePortfolioProject(prompt: string): WebsiteProject {
  const sections: Section[] = [
    {
      id: generateId('sec-nav'),
      type: 'navbar',
      title: 'ATELIER // MONO',
      badge: 'ARCHIVE 2026',
      items: [
        { id: generateId(), title: 'Selected Works', description: '#portfolio' },
        { id: generateId(), title: 'Philosophy', description: '#philosophy' },
        { id: generateId(), title: 'Testimonials', description: '#testimonials' },
        { id: generateId(), title: 'Contact', description: '#contact' },
      ],
      ctaPrimary: { text: 'Inquire Work', link: '#contact' },
    },
    {
      id: generateId('sec-hero'),
      type: 'hero',
      title: 'Spatial Architecture & Digital Artifacts',
      subtitle: 'A high-precision creative studio crafting enduring digital experiences, brand systems, and physical computing interfaces.',
      badge: 'DISCIPLINE // FORM & FUNCTION',
      ctaPrimary: { text: 'Explore Archive', link: '#portfolio' },
      ctaSecondary: { text: 'Read Monograph', link: '#philosophy' },
    },
    {
      id: generateId('sec-gal'),
      type: 'gallery',
      title: 'Selected Projects & Case Studies',
      subtitle: 'A curated selection of architectural commissions, identity systems, and computational artifacts.',
      badge: 'INDEX 01-06',
    },
    {
      id: generateId('sec-test'),
      type: 'testimonials',
      title: 'Client Conviction',
      subtitle: 'Reflections from founders, architects, and institutions we collaborate with.',
      badge: 'ENDORSEMENTS',
      items: [
        { id: generateId(), description: '"Their uncompromising aesthetic and mathematical clarity elevated our brand into an industry benchmark."', author: 'Stefan Holt', role: 'Founder, Modernist Works', avatar: 'SH' },
        { id: generateId(), description: '"The most disciplined design and engineering partner we have ever engaged."', author: 'Claire Dupont', role: 'Creative Director, Atelier 9', avatar: 'CD' },
      ],
    },
    {
      id: generateId('sec-contact'),
      type: 'contact',
      title: 'Initiate a Commission',
      subtitle: 'We accept a limited number of architectural and digital projects each quarter.',
      badge: 'COMMISSIONS OPEN',
    },
    {
      id: generateId('sec-foot'),
      type: 'footer',
      title: 'ATELIER MONO',
      subtitle: `© ${new Date().getFullYear()} Atelier Mono Studio. Zurich • Tokyo • New York.`,
      items: [
        { id: generateId(), title: 'Archive', description: 'Works 2024-2026, Exhibitions, Monographs, Publications' },
        { id: generateId(), title: 'Inquiries', description: 'Commissions, Press, Lectures, Colophon' },
      ],
    },
  ];

  return {
    id: generateId('proj'),
    title: 'Atelier Mono // Portfolio & Archive',
    description: `Curated portfolio and design showcase for: ${prompt}`,
    prompt,
    industry: 'Design & Architecture',
    tone: 'Editorial, Minimalist, High-Fashion',
    sections,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// -----------------------------------------------------------------------------------------
// 4. Pricing Project Generator
// -----------------------------------------------------------------------------------------

export function generatePricingProject(prompt: string): WebsiteProject {
  const sections: Section[] = [
    {
      id: generateId('sec-nav'),
      type: 'navbar',
      title: 'PRICING ENGINE',
      badge: 'TRANSPARENT',
      items: [
        { id: generateId(), title: 'Tiers', description: '#pricing' },
        { id: generateId(), title: 'Feature Matrix', description: '#features' },
        { id: generateId(), title: 'FAQ', description: '#faq' },
      ],
      ctaPrimary: { text: 'Start Free Trial', link: '#pricing' },
    },
    {
      id: generateId('sec-hero'),
      type: 'hero',
      title: 'Simple, Predictable Infrastructure Pricing',
      subtitle: 'No opaque usage calculators or surprise invoices. Pay only for what you execute at transparent rates.',
      badge: 'HONEST PRICING',
      ctaPrimary: { text: 'View All Plans', link: '#pricing' },
      ctaSecondary: { text: 'Calculate Savings', link: '#calc' },
    },
    {
      id: generateId('sec-price'),
      type: 'pricing',
      title: 'Choose Your Scale',
      subtitle: 'Upgrade or downgrade anytime. 14-day free trial on all paid plans.',
      badge: 'TIERS',
      items: [
        { id: generateId(), title: 'Developer', price: '$0', period: '/ month', description: 'For hobbyists and individual projects.', features: ['10k monthly requests', 'Community forum', '1 Node cluster'] },
        { id: generateId(), title: 'Team Pro', price: '$49', period: '/ month billed annually', badge: 'MOST POPULAR', description: 'For growing velocity startups.', features: ['Unlimited requests', 'Sub-10ms global edge', '5 Team seats', 'Slack & Email SLA'] },
        { id: generateId(), title: 'Enterprise', price: '$299', period: '/ month custom VPC', badge: 'DEDICATED', description: 'For mission-critical enterprise workloads.', features: ['Dedicated isolated VPC', '99.999% SLA guarantee', 'Custom SOC2 audit', '24/7 Phone support'] },
      ],
    },
    {
      id: generateId('sec-faq'),
      type: 'faq',
      title: 'Billing & Account FAQ',
      subtitle: 'Common questions regarding contracts, payment methods, and cancellations.',
      badge: 'BILLING FAQ',
      items: [
        { id: generateId(), question: 'Can I cancel or switch tiers anytime?', answer: 'Yes, cancellations take effect at the end of the billing period with zero cancellation penalties.' },
        { id: generateId(), question: 'Do you offer annual discounts?', answer: 'Yes, choosing annual billing provides an automatic 20% discount on all plans.' },
      ],
    },
    {
      id: generateId('sec-cta'),
      type: 'cta',
      title: 'Ready to experience peak velocity?',
      subtitle: 'Join over 10,000 developers building on our deterministic cloud engine.',
      badge: 'GET STARTED',
      ctaPrimary: { text: 'Create Free Account', link: '#pricing' },
    },
    {
      id: generateId('sec-foot'),
      type: 'footer',
      title: 'PRICING ENGINE',
      subtitle: `© ${new Date().getFullYear()} Deterministic Scale Systems Inc.`,
      items: [
        { id: generateId(), title: 'Billing', description: 'Invoices, Receipts, VAT Exemption, Enterprise Agreements' },
      ],
    },
  ];

  return {
    id: generateId('proj'),
    title: 'Pricing & Tiers Portal',
    description: `Transparent pricing and tier calculator for: ${prompt}`,
    prompt,
    industry: 'SaaS & Billing',
    tone: 'Clear, Trustworthy, Monochrome',
    sections,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// -----------------------------------------------------------------------------------------
// 5. Blog Project Generator
// -----------------------------------------------------------------------------------------

export function generateBlogProject(prompt: string): WebsiteProject {
  const sections: Section[] = [
    {
      id: generateId('sec-nav'),
      type: 'navbar',
      title: 'DISPATCHES',
      badge: 'LOGS 2026',
      items: [
        { id: generateId(), title: 'Latest', description: '#blog' },
        { id: generateId(), title: 'Architecture', description: '#blog' },
        { id: generateId(), title: 'Engineering', description: '#blog' },
      ],
      ctaPrimary: { text: 'Subscribe', link: '#newsletter' },
    },
    {
      id: generateId('sec-hero'),
      type: 'hero',
      title: 'Engineering Notes & Architectural Dispatches',
      subtitle: 'Essays, research benchmarks, and system post-mortems from the core engineering team.',
      badge: 'TECHNICAL DISPATCHES',
      ctaPrimary: { text: 'Read Latest Dispatches', link: '#blog' },
    },
    {
      id: generateId('sec-blog'),
      type: 'blog',
      title: 'Recent Engineering Publications',
      subtitle: 'Deep dives into deterministic execution, memory virtualization, and typography.',
      badge: 'PUBLICATIONS',
    },
    {
      id: generateId('sec-cta'),
      type: 'cta',
      title: 'Receive Dispatches Directly',
      subtitle: 'Join 24,000 engineers receiving our bi-weekly architecture teardowns in their inbox.',
      badge: 'NEWSLETTER',
      ctaPrimary: { text: 'Join Distribution List', link: '#subscribe' },
    },
    {
      id: generateId('sec-foot'),
      type: 'footer',
      title: 'DISPATCHES JOURNAL',
      subtitle: `© ${new Date().getFullYear()} Dispatches Publication. All rights reserved.`,
      items: [
        { id: generateId(), title: 'Topics', description: 'Compilers, Distributed Systems, Type Theory, UI Ergonomics' },
      ],
    },
  ];

  return {
    id: generateId('proj'),
    title: 'Dispatches // Engineering Publication',
    description: `Blog and articles publication for: ${prompt}`,
    prompt,
    industry: 'Publishing & Research',
    tone: 'Intellectual, Editorial, Monochrome',
    sections,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// -----------------------------------------------------------------------------------------
// 6. Contact Project Generator
// -----------------------------------------------------------------------------------------

export function generateContactProject(prompt: string): WebsiteProject {
  const sections: Section[] = [
    {
      id: generateId('sec-nav'),
      type: 'navbar',
      title: 'ENTERPRISE DESK',
      badge: 'DIRECT INTAKE',
      items: [
        { id: generateId(), title: 'Contact', description: '#contact' },
        { id: generateId(), title: 'Offices', description: '#offices' },
        { id: generateId(), title: 'Status', description: '#status' },
      ],
      ctaPrimary: { text: 'Schedule Demo', link: '#contact' },
    },
    {
      id: generateId('sec-hero'),
      type: 'hero',
      title: 'Connect with Our Systems Engineering Team',
      subtitle: 'Speak directly with principal engineers regarding custom VPC deployments, SLAs, and integration pipelines.',
      badge: 'INBOUND INTAKE',
      ctaPrimary: { text: 'Submit Inquiry Below', link: '#contact' },
    },
    {
      id: generateId('sec-contact'),
      type: 'contact',
      title: 'Direct Enterprise Inquiry',
      subtitle: 'Our technical solutions architect will review and respond within 4 business hours.',
      badge: 'RESPONSE GUARANTEE',
    },
    {
      id: generateId('sec-stats'),
      type: 'stats',
      title: 'Support SLA Benchmarks',
      subtitle: 'Dedicated tier-1 engineering coverage 24 hours a day, 365 days a year.',
      items: [
        { id: generateId(), stat: '< 15min', label: 'Average Response Time', description: 'Critical incident queue' },
        { id: generateId(), stat: '100%', label: 'In-House Engineers', description: 'Zero outsourced support' },
        { id: generateId(), stat: '24/7/365', label: 'Global Coverage', description: 'Follow-the-sun rotation' },
        { id: generateId(), stat: '99.8%', label: 'CSAT Rating', description: 'Verified enterprise feedback' },
      ],
    },
    {
      id: generateId('sec-foot'),
      type: 'footer',
      title: 'ENTERPRISE INTAKE',
      subtitle: `© ${new Date().getFullYear()} Enterprise Systems Group.`,
      items: [
        { id: generateId(), title: 'Intake', description: 'Sales, Security Assessments, Partnership, Careers' },
      ],
    },
  ];

  return {
    id: generateId('proj'),
    title: 'Enterprise Contact & Intake Portal',
    description: `Contact and booking page for: ${prompt}`,
    prompt,
    industry: 'Enterprise Solutions',
    tone: 'Authoritative, Responsive, Monochrome',
    sections,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// -----------------------------------------------------------------------------------------
// 7. Universal Dynamic Generator for Any Business or Prompt
// -----------------------------------------------------------------------------------------

interface DomainKnowledge {
  brand: string;
  industry: string;
  heroBadge: string;
  heroHeadline: string;
  heroSubtitle: string;
  stats: { stat: string; label: string; desc: string }[];
  features: { title: string; desc: string; badge: string; icon: string }[];
  testimonials: { quote: string; author: string; role: string; avatar: string }[];
  pricing: { tier: string; price: string; period: string; badge?: string; desc: string; features: string[] }[];
  faqs: { q: string; a: string }[];
  ctaHeadline: string;
  ctaSubtitle: string;
}

function extractDomainKnowledge(prompt: string): DomainKnowledge {
  const p = prompt.toLowerCase();

  // Extract custom brand name if specified e.g. "named Golden Crust", "called Nova", "for Nexus"
  let extractedBrand = '';
  const namedMatch = prompt.match(/(?:named|called|brand:?)\s+["']?([A-Za-z0-9\s'&]+?)["']?(?:\s+with|\s+that|\s+and|\.|\,|$)/i);
  if (namedMatch && namedMatch[1] && namedMatch[1].trim().length > 1) {
    extractedBrand = namedMatch[1].trim();
  } else {
    const forMatch = prompt.match(/(?:for)\s+(?:a|an)?\s*(?:website|startup|company|platform|app|studio|service|business)?\s*(?:named|called)?\s*([A-Za-z0-9\s'&]+?)(?:\s+with|\s+that|\s+and|\.|\,|$)/i);
    if (forMatch && forMatch[1] && forMatch[1].trim().length > 1) {
      extractedBrand = forMatch[1].trim().replace(/^(a|an|the)\s+/i, '');
    }
  }

  // 0. INDIA VS PAKISTAN DEVELOPMENT GROWTH DASHBOARD / PIE CHART
  if (
    p.includes('india') || 
    p.includes('pakistan') || 
    p.includes('development growth') || 
    (p.includes('pie chart') && (p.includes('growth') || p.includes('dashboard') || p.includes('development') || p.includes('india') || p.includes('pakistan')))
  ) {
    return {
      brand: 'INDIA vs PAKISTAN // GROWTH DASHBOARD',
      industry: 'Macro-Economic & Regional Development Analytics',
      heroBadge: 'PIE CHART TELEMETRY // ORANGE (INDIA) & GREEN (PAKISTAN)',
      heroHeadline: 'India & Pakistan Development Growth Telemetry',
      heroSubtitle: 'Comparative analysis of GDP growth rate, IT exports, renewable energy transition, FDI inflows, and human development indices between India (Orange) and Pakistan (Green).',
      stats: [
        { stat: '7.2% CAGR', label: 'India GDP Growth (Orange)', desc: 'Leading major global economy 2026' },
        { stat: '2.8% CAGR', label: 'Pakistan GDP Growth (Green)', desc: 'Macroeconomic stabilization phase' },
        { stat: '$245 Billion', label: 'India Tech Exports (Orange)', desc: 'IT services & AI hardware hub' },
        { stat: '$3.2 Billion', label: 'Pakistan Tech Exports (Green)', desc: 'Rapidly growing IT talent pool' },
      ],
      features: [
        { title: 'Regional Tech Growth Share (Pie Chart)', desc: 'India holds 82.4% (Vibrant Orange) of regional tech export revenue vs Pakistan at 17.6% (Vibrant Green) in comparative pie chart breakdown.', badge: 'PIE CHART', icon: 'PieChart' },
        { title: 'Digital Public Infrastructure (UPI)', desc: 'India (Orange) processes over 13 Billion instant digital payments monthly powered by UPI and Aadhaar.', badge: 'FINTECH', icon: 'Zap' },
        { title: 'Special Economic Zones & Logistics', desc: 'Pakistan (Green) expands CPEC maritime freight corridors and Gwadar port infrastructure.', badge: 'LOGISTICS', icon: 'Cpu' },
        { title: 'Renewable Energy Capacity', desc: 'India (Orange) operates 190 GW solar/wind capacity vs Pakistan (Green) expanding to 14 GW hydro & solar capacity.', badge: 'ENERGY', icon: 'RefreshCw' },
        { title: 'Foreign Direct Investment (FDI)', desc: 'Annual FDI inflows: India (Orange) $71B vs Pakistan (Green) $2.1B across manufacturing and clean energy.', badge: 'CAPITAL', icon: 'Shield' },
        { title: 'Demographic Dividend & Talent Pool', desc: 'India (Orange) STEM graduates (1.5M/yr) alongside Pakistan (Green) youth workforce demographic.', badge: 'TALENT', icon: 'Sparkles' },
      ],
      testimonials: [
        { quote: '"The color-coded pie chart dashboard clearly distinguishes India\'s structural expansion (Orange) and Pakistan\'s IT sector growth (Green)."', author: 'Dr. Aris Thorne', role: 'Senior Economist, Global Development Institute', avatar: 'AT' },
        { quote: '"The high-contrast Orange (India) and Green (Pakistan) telemetry renders complex macroeconomic comparisons instantly digestible."', author: 'Maya Lin', role: 'Managing Director, Asia Growth Fund', avatar: 'ML' },
      ],
      pricing: [
        { tier: 'Public Data Pass', price: '$0', period: '/ open research', badge: 'PUBLIC ACCESS', desc: 'Free access to public economic indicators and raw CSV telemetry.', features: ['Public GDP & trade metrics', 'Exportable SVG pie chart', 'Quarterly data sync'] },
        { tier: 'Pro Macro Analyst', price: '$149', period: '/ month', badge: 'MOST POPULAR', desc: 'Full API streams, interactive India (Orange) vs Pakistan (Green) pie charts & projections.', features: ['Live REST API telemetry', 'Custom sector pie chart builder', 'Sector-by-sector CAGR models', 'Analyst export format'] },
        { tier: 'Institutional VPC', price: '$499', period: '/ month dedicated', badge: 'ENTERPRISE', desc: 'Dedicated isolated VPC telemetry pipeline for central banks and funds.', features: ['Dedicated isolated VPC endpoint', 'Custom PostgreSQL DDL migration', '99.999% SLA uptime', 'Direct analyst briefings'] },
      ],
      faqs: [
        { q: 'How are India and Pakistan displayed on the development growth pie chart?', a: 'India is displayed in vibrant Orange (#F97316) and Pakistan is displayed in vibrant Green (#16A34A) across all pie charts, progress bars, and legend indicators.' },
        { q: 'What metrics are included in the development growth comparison?', a: 'Metrics include GDP growth rate, IT exports, renewable energy capacity, FDI inflows, literacy rate, and digital transaction volume.' },
      ],
      ctaHeadline: 'Access full India & Pakistan development telemetry.',
      ctaSubtitle: 'Filter indicators by sector, build custom pie charts, or download complete data reports.',
    };
  }

  // 1. BAKERY / CAFE / RESTAURANT / FOOD
  if (p.includes('bakery') || p.includes('cake') || p.includes('pastry') || p.includes('bread') || p.includes('restaurant') || p.includes('food') || p.includes('coffee') || p.includes('roaster')) {
    const brand = extractedBrand || (p.includes('coffee') ? 'KURO ROASTERS' : 'GOLDEN CRUST');
    return {
      brand,
      industry: 'Artisanal Culinary & Baking',
      heroBadge: 'HANDCRAFTED DAILY // ORGANIC FLOURS',
      heroHeadline: `Artisan Bakes & Pure Flavors Crafted Without Compromise`,
      heroSubtitle: `Experience slow-fermented sourdoughs, delicate flaky viennoiserie, and handcrafted specialty roasts. Baked fresh every morning with 100% locally sourced organic grains.`,
      stats: [
        { stat: '4:00 AM', label: 'Daily First Bake', desc: 'Warm loaves every morning' },
        { stat: '100%', label: 'Organic Grains', desc: 'Stone-milled flour sources' },
        { stat: '36 Hrs', label: 'Slow Fermentation', desc: 'Superior flavor & digestibility' },
        { stat: '4.95 ★', label: 'Customer Rating', desc: 'Over 2,400+ local reviews' },
      ],
      features: [
        { title: 'Natural Wild Sourdough', desc: 'Cultivated from our 8-year wild starter, naturally fermented for complex crust and airy crumb.', badge: 'SIGNATURE', icon: 'Sparkles' },
        { title: 'Laminated Viennoiserie', desc: 'Pure European butter layered into hundreds of delicate, shatteringly crisp layers.', badge: 'PASTRY', icon: 'Layers' },
        { title: 'Stone-Ground Milling', desc: 'Single-origin heirloom wheats milled in-house to preserve vital nutrients and deep aromas.', badge: 'PROCESS', icon: 'Cpu' },
        { title: 'Custom Celebration Cakes', desc: 'Bespoke architectural layer cakes designed for weddings, galas, and private celebrations.', badge: 'EVENTS', icon: 'Shield' },
        { title: 'Micro-Batch Coffee Roasts', desc: 'Ethically traded single-origin beans roasted specifically to pair with our daily pastries.', badge: 'ROASTERY', icon: 'Zap' },
        { title: 'Daily Seasonal Menus', desc: 'Rotating seasonal specials highlighting local farm fruit, botanicals, and artisan cheeses.', badge: 'SEASONAL', icon: 'RefreshCw' },
      ],
      testimonials: [
        { quote: '"The best sourdough in the entire city. The crust has that deep caramelized crunch and the crumb is pure perfection."', author: 'Sophie Laurent', role: 'Executive Pastry Chef', avatar: 'SL' },
        { quote: '"Their morning croissants and single-origin pour-over are a non-negotiable part of my morning ritual."', author: 'Liam Sterling', role: 'Food Critic, Culinary Gazette', avatar: 'LS' },
      ],
      pricing: [
        { tier: 'Morning Box', price: '$24', period: '/ box', badge: 'DAILY FAVORITE', desc: 'Curated box of 6 warm morning pastries & sourdough loaf.', features: ['2 Classic Croissants', '2 Seasonal Fruit Danishes', '1 Country Sourdough Loaf', 'Single-Origin Brew Bag'] },
        { tier: 'Weekly Bread Club', price: '$45', period: '/ month subscription', badge: 'MOST POPULAR', desc: 'Freshly baked artisanal loaf & specialty pastry delivered every Saturday.', features: ['2 Specialty Loaves per week', 'Priority weekend reservations', 'Seasonal holiday treats included', '15% in-store discount'] },
        { tier: 'Catering & Events', price: '$180', period: '/ platter', badge: 'BESPOKE', desc: 'Full-service pastry & sandwich platters for corporate events & weddings.', features: ['Assorted sweet & savory platters', 'Barista station support', 'Custom branded packaging', 'Dedicated delivery coordinator'] },
      ],
      faqs: [
        { q: 'Do you offer gluten-sensitive or vegan options?', a: 'Yes! We bake dedicated gluten-sensitive sourdough loaves and dairy-free vegan pastries every Tuesday and Saturday morning.' },
        { q: 'Can I place pre-orders for same-day pickup?', a: 'Pre-orders open at 7:00 AM daily through our online order system for pickup until 4:00 PM.' },
      ],
      ctaHeadline: 'Taste the difference of true craftsmanship.',
      ctaSubtitle: 'Visit our bakery or reserve your fresh weekly bread subscription today.',
    };
  }

  // 2. FITNESS / GYM / TRAINER / HEALTH / WELLNESS
  if (p.includes('fitness') || p.includes('gym') || p.includes('trainer') || p.includes('workout') || p.includes('health') || p.includes('doctor') || p.includes('clinic') || p.includes('medical')) {
    const brand = extractedBrand || (p.includes('doctor') || p.includes('clinic') ? 'AEGLE CLINICAL HEALTH' : 'KINETIC PERFORMANCE');
    return {
      brand,
      industry: 'Human Performance & Longevity',
      heroBadge: 'SCIENTIFIC PROTOCOLS // BIO-METRIC SCALE',
      heroHeadline: `Peak Human Performance Engineered Through Precision Science`,
      heroSubtitle: `Transform your strength, metabolic health, and mental endurance with tailored biomarker training and structured periodization protocols.`,
      stats: [
        { stat: '100%', label: 'Individualized Protocol', desc: 'Biomarker-guided training' },
        { stat: '12 Weeks', label: 'Average Peak Cycle', desc: 'Measurable body recomposition' },
        { stat: '2,800+', label: 'Athletes Trained', desc: 'From executives to olympians' },
        { stat: '< 0.5%', label: 'Injury Rate', desc: 'Biomechanical movement screen' },
      ],
      features: [
        { title: 'Biomechanical Movement Audit', desc: 'High-speed optical motion capture analysis to eliminate movement asymmetries and prevent strain.', badge: 'ASSESSMENT', icon: 'Activity' },
        { title: 'Hypertrophy & Strength Periodization', desc: 'Progressive overload regimes optimized around your personal recovery metrics and metabolic profile.', badge: 'STRENGTH', icon: 'Zap' },
        { title: 'Metabolic Conditioning (VO2 Max)', desc: 'Zone-2 cardio and anaerobic threshold intervals calibrated using medical-grade metabolic carts.', badge: 'CARDIO', icon: 'RefreshCw' },
        { title: 'Nutritional Macro Architecture', desc: 'Custom nutrient timing, supplementation protocols, and bio-available meal plans.', badge: 'NUTRITION', icon: 'Layers' },
        { title: 'Continuous HRV Telemetry', desc: 'Wearable integration tracking central nervous system recovery and sleep cycle architecture.', badge: 'RECOVERY', icon: 'Cpu' },
        { title: 'Dedicated 1-on-1 Coaching', desc: 'Direct daily messaging, weekly video form reviews, and proactive program adjustments.', badge: 'COACHING', icon: 'Shield' },
      ],
      testimonials: [
        { quote: '"In 16 weeks, I dropped 14% body fat while adding 40kg to my deadlift. The data-driven programming is unmatched."', author: 'David Vance', role: 'Venture Partner & Triathlete', avatar: 'DV' },
        { quote: '"The focus on structural balance and recovery allowed me to train harder than ever without joint inflammation."', author: 'Rachel Thorne', role: 'Competitive Cross-Athlete', avatar: 'RT' },
      ],
      pricing: [
        { tier: 'Core Program', price: '$79', period: '/ month', desc: 'Self-guided periodized training blocks & nutrition calculator.', features: ['Custom 4-day workout split', 'Video exercise library access', 'Macro nutrition calculator', 'Community training forum'] },
        { tier: '1-on-1 Performance', price: '$199', period: '/ month', badge: 'MOST POPULAR', desc: 'Full custom programming with weekly coaching check-ins and video form reviews.', features: ['100% Bespoke training protocol', 'Weekly 1-on-1 video call', 'Bi-weekly program optimization', 'Daily WhatsApp coach access', 'Wearable data syncing'] },
        { tier: 'Executive VIP Longevity', price: '$499', period: '/ month', badge: 'ELITE', desc: 'Comprehensive concierge health, biomarker bloodwork analysis, and private sessions.', features: ['Quarterly bloodwork biomarker review', 'Private 1-on-1 personal training', 'Full custom meal delivery plan', '24/7 Priority coach hotline'] },
      ],
      faqs: [
        { q: 'Is this suitable for complete beginners?', a: 'Yes. Every protocol begins with a comprehensive foundation assessment to ensure safe, scalable progression regardless of starting fitness level.' },
        { q: 'What equipment do I need access to?', a: 'Programs can be fully customized for commercial gym access, home garage gyms with barbells/dumbbells, or bodyweight travel routines.' },
      ],
      ctaHeadline: 'Claim your highest state of physical capacity.',
      ctaSubtitle: 'Book your preliminary assessment and begin your transformation today.',
    };
  }

  // 3. EVENT / HACKATHON / CONFERENCE / WEB3
  if (p.includes('hackathon') || p.includes('event') || p.includes('conference') || p.includes('summit') || p.includes('meetup')) {
    const brand = extractedBrand || 'SYNAPSE HACKATHON 2026';
    return {
      brand,
      industry: 'Hackathon & Technology Summit',
      heroBadge: '48 HOURS // $100,000 PRIZE POOL',
      heroHeadline: `Build Autonomous AI & Scalable Systems in 48 Hours`,
      heroSubtitle: `Join 1,000+ elite engineers, designers, and founders competing to build the next generation of autonomous intelligent software.`,
      stats: [
        { stat: '$100K', label: 'Total Prize Pool', desc: 'Cash grants & cloud credits' },
        { stat: '48 Hrs', label: 'Continuous Building', desc: 'Mentorship & demo day' },
        { stat: '1,200+', label: 'Hackers & Builders', desc: 'Global developer network' },
        { stat: '30+', label: 'Top Tier VC Judges', desc: 'Direct seed check funding' },
      ],
      features: [
        { title: 'Autonomous AI Agents Track', desc: 'Build multi-agent workflows, code generation engines, and self-healing tools.', badge: 'TRACK 01', icon: 'Cpu' },
        { title: 'Distributed Systems & Infra Track', desc: 'Sub-millisecond edge computation, distributed databases, and security enclaves.', badge: 'TRACK 02', icon: 'Zap' },
        { title: 'Generative UI & Canvas Tools', desc: 'Next-generation interfaces, instant spatial layouts, and collaborative visual canvases.', badge: 'TRACK 03', icon: 'Layers' },
        { title: 'World-Class Mentor Network', desc: 'Hands-on technical debugging sessions with senior staff architects from top tech companies.', badge: 'MENTORSHIP', icon: 'Shield' },
        { title: 'Direct Seed Capital & Grants', desc: 'Fast-tracked investor intros and instant angel funding for winning project teams.', badge: 'FUNDING', icon: 'Activity' },
        { title: 'Hardware & Cloud Credits', desc: 'Unlimited compute GPUs, API keys, and enterprise developer tools provided to all hackers.', badge: 'RESOURCES', icon: 'RefreshCw' },
      ],
      testimonials: [
        { quote: '"We built our prototype at Synapse, won 1st place, and closed our $2M pre-seed round 3 weeks later."', author: 'Karan Patel', role: 'Co-Founder at NeuralGrid', avatar: 'KP' },
        { quote: '"The highest concentration of engineering talent of any hackathon we have attended globally."', author: 'Maya Chen', role: 'Partner, Frontier Ventures', avatar: 'MC' },
      ],
      pricing: [
        { tier: 'Hacker Pass', price: '$0', period: '/ free admission', badge: 'APPLICATION REQUIRED', desc: 'For accepted engineers, designers, and students.', features: ['48-Hour Venue & Food access', 'GPU & API cloud credits', 'Keynote & workshop access', 'Team formation matching'] },
        { tier: 'Sponsor & Recruiter', price: '$2,500', period: '/ corporate booth', badge: 'SPONSORSHIP', desc: 'Direct access to top 1,000 builder resumes and keynote stage pitch.', features: ['Dedicated recruiting booth', 'Custom API track sponsor', 'Judge panel seat', 'Direct resume book access'] },
        { tier: 'Investor VIP Pass', price: '$500', period: '/ pass', badge: 'VENTURE', desc: 'Access to Demo Day presentations and private founder networking lounge.', features: ['VIP Demo Day front-row seat', 'Private founder meeting room', 'Curated pitch deck digest'] },
      ],
      faqs: [
        { q: 'Who is eligible to participate?', a: 'Developers, designers, researchers, and students from all backgrounds are welcome to apply individually or in teams of up to 4.' },
        { q: 'What is the intellectual property policy?', a: 'You and your team retain 100% ownership of everything you build during the hackathon.' },
      ],
      ctaHeadline: 'Ready to build the future in 48 hours?',
      ctaSubtitle: 'Applications close October 25th. Secure your hacker pass today.',
    };
  }

  // 4. GENERAL / CUSTOM ENTERPRISE / PRODUCT
  const brand = extractedBrand || (wordsFromName(prompt) || 'MONOLITH OS');
  return {
    brand: brand.toUpperCase(),
    industry: `${capitalizeWords(prompt.split(' ').slice(0, 3).join(' '))} Industry`,
    heroBadge: 'PRECISION ARCHITECTURE // MONOCHROME MINIMAL',
    heroHeadline: `Engineered for Absolute Clarity, Velocity & Scale`,
    heroSubtitle: `Experience frictionless execution with ${brand}. Built from the ground up for modern teams seeking uncompromising reliability, speed, and clean minimalist design.`,
    stats: [
      { stat: '99.99%', label: 'Reliability Metric', desc: 'Engineered without failure points' },
      { stat: '< 10ms', label: 'Execution Latency', desc: 'Global edge distribution' },
      { stat: '10x', label: 'Velocity Multiplier', desc: 'Measured performance boost' },
      { stat: '24/7', label: 'Continuous Active SLA', desc: 'Mission-critical availability' },
    ],
    features: [
      { title: 'Deterministic Execution Engine', desc: 'Eliminate friction and non-deterministic behavior with strictly typed constraints.', badge: 'ARCHITECTURE', icon: 'Cpu' },
      { title: 'Zero-Latency Edge Network', desc: 'Instant state persistence synced across all nodes with end-to-end cryptographic proof.', badge: 'SPEED', icon: 'Zap' },
      { title: 'Auditable Event Streams', desc: 'Full observability into every telemetry point, transaction, and payload.', badge: 'SECURITY', icon: 'Shield' },
      { title: 'Modular Plug-and-Play Integrations', desc: 'Seamless connection with Postgres, Supabase, Redis, Mongo, and enterprise REST APIs.', badge: 'INTEGRATION', icon: 'Layers' },
      { title: 'Autonomous Self-Healing Loops', desc: 'Proactive error detection and auto-recovery mechanisms that keep systems operational 24/7.', badge: 'AUTOMATION', icon: 'RefreshCw' },
      { title: 'Granular Access Governance', desc: 'Role-based access control, cryptographic key rotation, and automated SOC2 posture.', badge: 'COMPLIANCE', icon: 'Lock' },
    ],
    testimonials: [
      { quote: `"${brand} transformed how our organization operates. We deployed in minutes and saw an 80% gain in efficiency."`, author: 'Marcus Vance', role: 'VP of Engineering, HyperScale Labs', avatar: 'MV' },
      { quote: `"The high-contrast monochrome design and flawless responsiveness make working in ${brand} a pure joy."`, author: 'Elena Rostova', role: 'Chief Product Officer, Synapse', avatar: 'ER' },
    ],
    pricing: [
      { tier: 'Starter', price: '$0', period: '/ month', badge: 'COMMUNITY', desc: 'For rapid prototyping and individual projects.', features: ['Core system access', 'Full visual editor & code export', 'Community support'] },
      { tier: 'Pro', price: '$49', period: '/ month', badge: 'MOST POPULAR', desc: 'For fast-growing teams requiring dedicated throughput.', features: ['Unlimited generations', 'Priority edge routing', '5 Team seats', 'Email & Slack SLA'] },
      { tier: 'Enterprise', price: '$249', period: '/ month', badge: 'DEDICATED', desc: 'Maximum security, custom SLAs, and dedicated VPC.', features: ['Dedicated cluster isolation', '99.999% SLA agreement', 'Custom AI model fine-tuning', 'SSO & Custom RBAC'] },
    ],
    faqs: [
      { q: `How fast can I get started with ${brand}?`, a: 'You can generate, edit, and publish your complete experience in under 60 seconds with our instant compiler.' },
      { q: 'Can I export clean code and host it anywhere?', a: 'Yes, 100%. You can download standalone production HTML or copy Next.js/Tailwind components with zero vendor lock-in.' },
    ],
    ctaHeadline: 'Ready to build without compromise?',
    ctaSubtitle: `Join thousands of teams crafting high-performance digital experiences with ${brand} today.`,
  };
}

function wordsFromName(prompt: string): string {
  const words = prompt.split(/\s+/).filter(w => w.length > 2 && !['create', 'build', 'make', 'page', 'site', 'website', 'the', 'for', 'with', 'and'].includes(w.toLowerCase()));
  if (words.length >= 2) {
    return `${words[0].charAt(0).toUpperCase() + words[0].slice(1)} ${words[1].charAt(0).toUpperCase() + words[1].slice(1)}`;
  } else if (words.length === 1) {
    return `${words[0].charAt(0).toUpperCase() + words[0].slice(1)} OS`;
  }
  return 'MONOLITH';
}

function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

export function generateUniversalWebsite(prompt: string): WebsiteProject {
  const k = extractDomainKnowledge(prompt);

  const sections: Section[] = [
    {
      id: generateId('sec-nav'),
      type: 'navbar',
      title: k.brand,
      badge: 'v2.4',
      items: [
        { id: generateId(), title: 'Features', description: '#features' },
        { id: generateId(), title: 'Metrics', description: '#stats' },
        { id: generateId(), title: 'Testimonials', description: '#testimonials' },
        { id: generateId(), title: 'Pricing', description: '#pricing' },
        { id: generateId(), title: 'FAQ', description: '#faq' },
      ],
      ctaPrimary: { text: 'Get Started', link: '#pricing' },
      ctaSecondary: { text: 'Contact Us', link: '#contact' },
    },
    {
      id: generateId('sec-hero'),
      type: 'hero',
      title: k.heroHeadline,
      subtitle: k.heroSubtitle,
      badge: k.heroBadge,
      ctaPrimary: { text: 'Explore Now', link: '#pricing' },
      ctaSecondary: { text: 'Learn More', link: '#features' },
    },
    {
      id: generateId('sec-stats'),
      type: 'stats',
      title: 'Metrics that drive conviction',
      subtitle: 'Engineered for uncompromising reliability and real-world results.',
      items: k.stats.map(s => ({ id: generateId(), stat: s.stat, label: s.label, description: s.desc })),
    },
    {
      id: generateId('sec-feat'),
      type: 'features',
      title: 'Core Capabilities & Offerings',
      subtitle: 'Everything you need to experience effortless execution and superior quality.',
      badge: 'OFFERINGS',
      items: k.features.map(f => ({ id: generateId(), title: f.title, description: f.desc, badge: f.badge, icon: f.icon })),
    },
    {
      id: generateId('sec-test'),
      type: 'testimonials',
      title: 'Trusted by Leaders & Patrons',
      subtitle: 'Hear directly from the individuals and teams who rely on our services.',
      badge: 'TESTIMONIALS',
      items: k.testimonials.map(t => ({ id: generateId(), description: t.quote, author: t.author, role: t.role, avatar: t.avatar })),
    },
    {
      id: generateId('sec-price'),
      type: 'pricing',
      title: 'Clear, Transparent Options',
      subtitle: 'Choose the ideal plan or package tailored to your exact needs.',
      badge: 'PACKAGES',
      items: k.pricing.map(p => ({ id: generateId(), title: p.tier, price: p.price, period: p.period, badge: p.badge, description: p.desc, features: p.features })),
    },
    {
      id: generateId('sec-faq'),
      type: 'faq',
      title: 'Frequently Asked Questions',
      subtitle: 'Answers to the most common questions regarding our process and offerings.',
      badge: 'FAQ',
      items: k.faqs.map(f => ({ id: generateId(), question: f.q, answer: f.a })),
    },
    {
      id: generateId('sec-contact'),
      type: 'contact',
      title: 'Get In Touch',
      subtitle: 'Have a special inquiry or question? Send us a message directly.',
      badge: 'DIRECT CONTACT',
    },
    {
      id: generateId('sec-cta'),
      type: 'cta',
      title: k.ctaHeadline,
      subtitle: k.ctaSubtitle,
      badge: 'GET STARTED TODAY',
      ctaPrimary: { text: 'Get Started Now', link: '#pricing' },
      ctaSecondary: { text: 'Contact Our Team', link: '#contact' },
    },
    {
      id: generateId('sec-foot'),
      type: 'footer',
      title: k.brand,
      subtitle: `© ${new Date().getFullYear()} ${k.brand}, Inc. All rights reserved. Precision monochrome design.`,
      items: [
        { id: generateId(), title: 'Offerings', description: 'Menu, Services, Pricing, Documentation' },
        { id: generateId(), title: 'Company', description: 'About, Careers, Press, Colophon' },
        { id: generateId(), title: 'Legal', description: 'Privacy Policy, Terms of Service, Security' },
      ],
    },
  ];

  return {
    id: generateId('proj'),
    title: k.brand,
    description: `AI-generated website for: ${prompt}`,
    prompt,
    industry: k.industry,
    tone: 'Minimalist, Authoritative, High-Precision',
    sections,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// -----------------------------------------------------------------------------------------
// Lovable-Grade Deep Multi-Page Project Generator
// -----------------------------------------------------------------------------------------

export function generateMultiPageProject(prompt: string): WebsiteProject {
  const k = extractDomainKnowledge(prompt);

  // Common unified navigation links across all pages
  const navItems = [
    { id: generateId('nav-feat'), title: 'Features', description: '/features' },
    { id: generateId('nav-price'), title: 'Pricing', description: '/pricing' },
    { id: generateId('nav-dash'), title: 'Dashboard', description: '/dashboard' },
    { id: generateId('nav-contact'), title: 'Contact', description: '/contact' },
  ];

  const createNavbar = (activeSlug: string = '/'): Section => ({
    id: generateId('sec-nav'),
    type: 'navbar',
    title: k.brand,
    badge: 'v2.6 EDGE',
    items: navItems,
    ctaPrimary: { text: 'Get Started', link: '/pricing' },
    ctaSecondary: { text: 'Console', link: '/dashboard' },
  });

  const createFooter = (): Section => ({
    id: generateId('sec-foot'),
    type: 'footer',
    title: k.brand,
    subtitle: `© ${new Date().getFullYear()} ${k.brand}, Inc. All rights reserved. Precision monochrome minimal architecture.`,
    items: [
      { id: generateId(), title: 'Platform', description: 'Features, Pricing, Dashboard, Changelog' },
      { id: generateId(), title: 'Resources', description: 'Documentation, System Status, API Reference' },
      { id: generateId(), title: 'Company', description: 'Contact, Enterprise SLAs, Security Posture' },
    ],
  });

  // PAGE 1: HOME (/)
  const homeSections: Section[] = [
    createNavbar('/'),
    {
      id: generateId('sec-hero'),
      type: 'hero',
      title: k.heroHeadline,
      subtitle: k.heroSubtitle,
      badge: k.heroBadge,
      ctaPrimary: { text: 'Get Started Free', link: '/pricing' },
      ctaSecondary: { text: 'Explore Capabilities', link: '/features' },
    },
    {
      id: generateId('sec-stats'),
      type: 'stats',
      title: 'Metrics that drive conviction',
      subtitle: `Demonstrated architectural velocity and proven telemetry measured across ${k.brand} workloads.`,
      items: k.stats.map(s => ({ id: generateId(), stat: s.stat, label: s.label, description: s.desc })),
    },
    {
      id: generateId('sec-feat'),
      type: 'features',
      title: 'Core Capabilities & Value Drivers',
      subtitle: 'Engineered from the ground up for teams demanding deterministic reliability and seamless operations.',
      badge: 'CAPABILITIES',
      items: k.features.map(f => ({ id: generateId(), title: f.title, description: f.desc, badge: f.badge, icon: f.icon })),
    },
    {
      id: generateId('sec-test'),
      type: 'testimonials',
      title: 'Trusted by Industry Operators',
      subtitle: `Hear directly from the engineering leaders, founders, and directors building on ${k.brand}.`,
      badge: 'VERIFIED REVIEWS',
      items: k.testimonials.map(t => ({ id: generateId(), description: t.quote, author: t.author, role: t.role, avatar: t.avatar })),
    },
    {
      id: generateId('sec-cta'),
      type: 'cta',
      title: k.ctaHeadline,
      subtitle: k.ctaSubtitle,
      badge: 'PRODUCTION READY',
      ctaPrimary: { text: 'Start In Minutes', link: '/pricing' },
      ctaSecondary: { text: 'Talk to Solutions Team', link: '/contact' },
    },
    createFooter(),
  ];

  // PAGE 2: FEATURES (/features)
  const featuresSections: Section[] = [
    createNavbar('/features'),
    {
      id: generateId('sec-hero-feat'),
      type: 'hero',
      title: `${k.brand} Architectural Primitives & Deep Dives`,
      subtitle: `Explore the granular technical specifications, fault-tolerant pipelines, and automated integrations powering ${k.brand}.`,
      badge: 'SYSTEM SPECIFICATIONS',
      ctaPrimary: { text: 'Compare Pricing Plans', link: '/pricing' },
      ctaSecondary: { text: 'Open Live Console', link: '/dashboard' },
    },
    {
      id: generateId('sec-feat-grid'),
      type: 'features',
      title: 'Comprehensive Capability Matrix',
      subtitle: 'Every module is strictly typed, audited, and isolated for maximum resilience under peak demand.',
      badge: 'MODULE BREAKDOWN',
      items: k.features.map(f => ({ id: generateId(), title: f.title, description: `${f.desc} Includes zero-downtime rolling deploys, declarative configurations, and end-to-end telemetry hooks.`, badge: f.badge, icon: f.icon })),
    },
    {
      id: generateId('sec-stats-feat'),
      type: 'stats',
      title: 'System Throughput & Benchmark Guarantees',
      subtitle: 'Rigorous empirical benchmarks conducted under heavy continuous traffic.',
      items: [
        { id: generateId(), stat: '< 1.2ms', label: 'Average Pipeline Latency', description: 'Global edge runtime' },
        { id: generateId(), stat: '100%', label: 'Type Safe Contracts', description: 'Zod & OpenAPI validated' },
        { id: generateId(), stat: '99.99%', label: 'SLA Availability', description: 'Multi-region redundancy' },
        { id: generateId(), stat: '0.00%', label: 'State Inconsistency', description: 'Cryptographic log proofs' },
      ],
    },
    {
      id: generateId('sec-cta-feat'),
      type: 'cta',
      title: 'Deploy to Production with Complete Confidence',
      subtitle: 'Ready to experience unmatched velocity? Choose your plan or talk directly with our systems engineers.',
      badge: 'NEXT STEP',
      ctaPrimary: { text: 'Select a Plan', link: '/pricing' },
      ctaSecondary: { text: 'Request Architecture Review', link: '/contact' },
    },
    createFooter(),
  ];

  // PAGE 3: PRICING (/pricing)
  const pricingSections: Section[] = [
    createNavbar('/pricing'),
    {
      id: generateId('sec-hero-price'),
      type: 'hero',
      title: 'Transparent, Predictable Investment',
      subtitle: `No unpredictable overage surprises. Choose a clear plan built around your operational scale with ${k.brand}.`,
      badge: 'TIERS & PACKAGES',
      ctaPrimary: { text: 'Select Your Tier Below', link: '#pricing' },
      ctaSecondary: { text: 'Custom Enterprise SLAs', link: '/contact' },
    },
    {
      id: generateId('sec-pricing-grid'),
      type: 'pricing',
      title: 'Subscription Tiers & Access Levels',
      subtitle: 'All plans include core architectural access, instant compiler runs, and full code ownership.',
      badge: 'PACKAGES',
      items: k.pricing.map(p => ({
        id: generateId(),
        title: p.tier,
        price: p.price,
        period: p.period,
        badge: p.badge,
        description: p.desc,
        features: p.features,
      })),
    },
    {
      id: generateId('sec-faq-price'),
      type: 'faq',
      title: 'Frequently Asked Questions',
      subtitle: `Direct answers to the most common questions regarding billing, team seats, and security compliance.`,
      badge: 'CLARIFICATIONS',
      items: k.faqs.map(f => ({ id: generateId(), question: f.q, answer: f.a })),
    },
    {
      id: generateId('sec-cta-price'),
      type: 'cta',
      title: 'Require Dedicated High-Availability Infrastructure?',
      subtitle: 'Our enterprise solutions engineering team can structure custom multi-region VPC deployments tailored to your compliance posture.',
      badge: 'ENTERPRISE DESK',
      ctaPrimary: { text: 'Contact Solutions Team', link: '/contact' },
      ctaSecondary: { text: 'Review Live Console', link: '/dashboard' },
    },
    createFooter(),
  ];

  // PAGE 4: DASHBOARD (/dashboard)
  const dashboardSections: Section[] = [
    createNavbar('/dashboard'),
    {
      id: generateId('sec-hero-dash'),
      type: 'hero',
      title: `${k.brand} Operational Console & Telemetry Hub`,
      subtitle: 'Monitor active cluster telemetry, live pipeline executions, and connected data sources in real time.',
      badge: 'LIVE WORKSPACE',
      ctaPrimary: { text: 'Inspect System Metrics', link: '#stats' },
      ctaSecondary: { text: 'Upgrade Workspace Tier', link: '/pricing' },
    },
    {
      id: generateId('sec-dash-main'),
      type: 'dashboard',
      title: 'Telemetry Telemetry & Stream Ingestion',
      subtitle: 'Real-time telemetry feeds connected via WebSocket subscriptions and PostgreSQL persistence.',
      badge: 'MONITORING',
    },
    {
      id: generateId('sec-stats-dash'),
      type: 'stats',
      title: 'Operational Vitals & Health Metrics',
      subtitle: 'Synchronized telemetry updated continuously across all global edge nodes.',
      items: [
        { id: generateId(), stat: 'ACTIVE', label: 'Cluster Health', description: 'Zero degraded clusters' },
        { id: generateId(), stat: '48.2K', label: 'Operations / Sec', description: 'Peak throughput capacity' },
        { id: generateId(), stat: '14ms', label: 'P99 Response Time', description: 'Global average latency' },
        { id: generateId(), stat: '100%', label: 'Database Replication', description: 'Supabase Postgres synced' },
      ],
    },
    {
      id: generateId('sec-cta-dash'),
      type: 'cta',
      title: 'Scale Cluster Capacity on Demand',
      subtitle: 'Expand throughput limits, provision isolated compute clusters, and enable automated backup failovers.',
      badge: 'SCALE UP',
      ctaPrimary: { text: 'Upgrade Platform Tier', link: '/pricing' },
      ctaSecondary: { text: 'Contact Support Engineer', link: '/contact' },
    },
    createFooter(),
  ];

  // PAGE 5: CONTACT (/contact)
  const contactSections: Section[] = [
    createNavbar('/contact'),
    {
      id: generateId('sec-hero-contact'),
      type: 'hero',
      title: `Connect with the ${k.brand} Engineering Team`,
      subtitle: 'Speak directly with our technical solutions architects regarding enterprise onboarding, custom integrations, or SLAs.',
      badge: 'DIRECT INBOUND',
      ctaPrimary: { text: 'Complete Intake Form Below', link: '#contact' },
      ctaSecondary: { text: 'View Pricing Options', link: '/pricing' },
    },
    {
      id: generateId('sec-contact-main'),
      type: 'contact',
      title: 'Direct Enterprise Intake Form',
      subtitle: 'Provide your technical requirements and an assigned solutions architect will review and reply within 4 business hours.',
      badge: 'ENTERPRISE DESK',
    },
    {
      id: generateId('sec-stats-contact'),
      type: 'stats',
      title: 'SLA Commitments & Direct Support Posture',
      subtitle: 'Contractually guaranteed response windows and dedicated senior engineering escalation paths.',
      items: [
        { id: generateId(), stat: '< 15min', label: 'Priority SLA Response', description: 'Severity-1 urgent incidents' },
        { id: generateId(), stat: '1-on-1', label: 'Dedicated Architect', description: 'Direct Slack / Teams bridge' },
        { id: generateId(), stat: '24/7/365', label: 'SRE Coverage', description: 'Continuous active monitoring' },
        { id: generateId(), stat: 'SOC 2', label: 'Type II Audited', description: 'Continuous compliance posture' },
      ],
    },
    createFooter(),
  ];

  const pages: WebsitePage[] = [
    {
      id: generateId('page-home'),
      name: 'Home',
      slug: '/',
      title: `${k.brand} — ${k.heroHeadline}`,
      description: k.heroSubtitle,
      sections: homeSections,
    },
    {
      id: generateId('page-feat'),
      name: 'Features',
      slug: '/features',
      title: `${k.brand} // Architectural Capabilities`,
      description: 'Comprehensive breakdown of platform features and system primitives.',
      sections: featuresSections,
    },
    {
      id: generateId('page-price'),
      name: 'Pricing',
      slug: '/pricing',
      title: `${k.brand} // Transparent Pricing`,
      description: 'Predictable subscription packages with zero vendor lock-in.',
      sections: pricingSections,
    },
    {
      id: generateId('page-dash'),
      name: 'Dashboard',
      slug: '/dashboard',
      title: `${k.brand} // Live Operational Console`,
      description: 'Real-time telemetry, active workloads, and streaming metrics.',
      sections: dashboardSections,
    },
    {
      id: generateId('page-contact'),
      name: 'Contact',
      slug: '/contact',
      title: `${k.brand} // Enterprise Inbound`,
      description: 'Connect directly with our solutions engineering team.',
      sections: contactSections,
    },
  ];

  return {
    id: generateId('proj'),
    title: k.brand,
    description: `Full-stack multi-page website compiled for: ${prompt}`,
    prompt,
    industry: k.industry,
    tone: 'Monochrome Minimalist, High-Precision SaaS',
    pages,
    activePageSlug: '/',
    sections: homeSections,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// -----------------------------------------------------------------------------------------
// Section Level AI Rewriter
// -----------------------------------------------------------------------------------------

export function regenerateSectionContent(
  section: Section,
  instruction: string,
  projectContext?: { title: string; prompt: string }
): Section {
  const instr = instruction.toLowerCase();
  const updated = JSON.parse(JSON.stringify(section)) as Section;

  if (instr.includes('bold') || instr.includes('punchy') || instr.includes('aggressive')) {
    updated.title = `${updated.title.replace(/\.$/, '')} — Built Without Compromise.`;
    if (updated.subtitle) {
      updated.subtitle = `Accelerate beyond conventional limits. Built for relentless execution and zero friction.`;
    }
  } else if (instr.includes('shorter') || instr.includes('concise')) {
    updated.title = updated.title.split(' ').slice(0, 5).join(' ');
    if (updated.subtitle) {
      updated.subtitle = updated.subtitle.split('. ')[0] + '.';
    }
  } else if (instr.includes('modern') || instr.includes('minimal')) {
    updated.badge = 'VERSION 3.0 // MINIMAL ARCHITECTURE';
  }

  if (section.type === 'pricing' && (instr.includes('annual') || instr.includes('discount') || instr.includes('tier'))) {
    if (updated.items && updated.items.length >= 3) {
      updated.items[0].price = '$0';
      updated.items[1].price = '$39';
      updated.items[1].badge = 'BEST VALUE (20% OFF)';
      updated.items[2].price = '$199';
    }
  }

  if (section.type === 'features' && instr.includes('add')) {
    updated.items = [
      ...(updated.items || []),
      {
        id: generateId(),
        title: 'Real-Time Telemetry & Synchronization',
        description: 'Instant live metrics streaming directly with sub-millisecond precision.',
        badge: 'NEW',
        icon: 'Activity',
      },
    ];
  }

  return updated;
}
