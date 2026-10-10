const fs = require('fs');
const path = require('path');

const templates = [
  {
    slug: 'portfolio',
    title: 'Alex Rivera // Senior Full-Stack Architect',
    tagline: 'Building deterministic compilers, low-latency edge systems, and minimalist interfaces.',
    primary: '#09090b',
    accent: '#f97316',
    nav: ['About', 'Projects', 'Experience', 'Stack', 'Contact'],
    heroSubtitle: 'Staff Engineer & Systems Architect specializing in distributed edge infrastructure and generative UI.',
    sections: [
      { name: 'Featured Work', item1: 'HyperGrid Engine', desc1: 'Sub-millisecond low latency WASM execution mesh.', item2: 'Kore Enclave', desc2: 'Zero-trust identity verification protocol.' },
      { name: 'Core Architecture Stack', item1: 'Next.js 15 & React 19', desc1: 'Server components & streaming SSR', item2: 'Rust & WebAssembly', desc2: 'High-performance edge compute' }
    ]
  },
  {
    slug: 'restaurant',
    title: 'Trattoria Bella // Artisan Italian Dining',
    tagline: 'Handcrafted slow-fermented pasta, wood-fired pizzas, and heritage Italian wines.',
    primary: '#1c1917',
    accent: '#dc2626',
    nav: ['Story', 'Menu', 'Chef Specials', 'Reservations', 'Location'],
    heroSubtitle: 'Authentic Roman and Tuscan culinary traditions passed down through three generations.',
    sections: [
      { name: 'Artisan Menu Highlights', item1: 'Truffle Pappardelle', desc1: 'Hand-cut egg pasta with black truffle butter.', item2: 'Neapolitan Wood-Fired Margherita', desc2: 'San Marzano tomatoes and buffalo mozzarella.' },
      { name: 'Private Dining & Events', item1: 'The Wine Cellar Vault', desc1: 'Seating up to 24 guests surrounded by vintage Barolos.', item2: 'Chef’s Tasting Table', desc1: 'Seven-course seasonal tasting menu paired by our Head Sommelier.' }
    ]
  },
  {
    slug: 'law-firm',
    title: 'Vanguard Law // Defense & Trial Advocacy',
    tagline: 'Aggressive courtroom representation and strategic corporate risk mitigation.',
    primary: '#0f172a',
    accent: '#ca8a04',
    nav: ['Practice Areas', 'Attorneys', 'Case Victories', 'Insights', 'Consultation'],
    heroSubtitle: 'Over $500M in favorable verdicts and settlements for corporate and individual clients.',
    sections: [
      { name: 'Core Practice Areas', item1: 'White Collar Defense', desc1: 'Federal investigations and regulatory enforcement.', item2: 'Complex Commercial Litigation', desc1: 'High-stakes shareholder and contract disputes.' },
      { name: 'Client Case Telemetry', item1: '98.4% Favorable Resolution', desc1: 'Proven record across state and federal courts.', item2: '24/7 Crisis Response', desc1: 'Immediate legal counsel for emergency compliance matters.' }
    ]
  },
  {
    slug: 'clinic',
    title: 'Aegis Clinical Health & Medical Center',
    tagline: 'Comprehensive outpatient care, diagnostic imaging, and preventive medicine.',
    primary: '#0c4a6e',
    accent: '#0284c7',
    nav: ['Services', 'Doctors', 'Diagnostics', 'Patient Care', 'Appointments'],
    heroSubtitle: 'Board-certified physicians utilizing advanced medical technology for your family’s health.',
    sections: [
      { name: 'Medical Services', item1: 'Cardiology & Vascular', desc1: 'Advanced ECG, echocardiography, and lipid management.', item2: 'Internal Medicine', desc1: 'Comprehensive wellness exams and chronic disease management.' },
      { name: 'Patient Support', item1: 'Same-Day Appointments', desc1: 'Urgent care consultations available daily.', item2: 'Digital Health Records', desc1: '24/7 secure access to lab results and prescription refills.' }
    ]
  },
  {
    slug: 'ecommerce',
    title: 'Luxe Artisan // Fashion & Goods Boutique',
    tagline: 'Sustainably crafted leather apparel, organic textiles, and timeless accessories.',
    primary: '#18181b',
    accent: '#d97706',
    nav: ['New Arrivals', 'Apparel', 'Accessories', 'Ethos', 'Cart (0)'],
    heroSubtitle: 'Minimalist luxury designed for longevity and manufactured in ethical micro-factories.',
    sections: [
      { name: 'Autumn Collection 2026', item1: 'Merino Wool Trench', desc1: 'Hand-tailored water-repellent winter outerwear.', item2: 'Full-Grain Leather Tote', desc1: 'Vegetable-tanned leather with brass hardware.' },
      { name: 'Craftsmanship Ethos', item1: 'Zero Waste Production', desc1: '100% biodegradable packaging and organic dyes.', item2: 'Lifetime Guarantee', desc1: 'Free repairs and conditioning on all leather goods.' }
    ]
  },
  {
    slug: 'startup-saas',
    title: 'HyperGrid OS // Distributed Mesh Platform',
    tagline: 'Empowering engineering teams to build and scale zero-latency edge cloud microservices.',
    primary: '#09090b',
    accent: '#6366f1',
    nav: ['Platform', 'Features', 'Docs', 'Pricing', 'Deploy Now'],
    heroSubtitle: 'Deterministic serverless execution with instant state replication across 42 global POPs.',
    sections: [
      { name: 'Engine Primitives', item1: 'Sub-10ms Global Latency', desc1: 'Automatic traffic steering to closest healthy edge replica.', item2: 'Autonomous Scaling Mesh', desc1: 'Zero-downtime container replicas scaling from 0 to 100k requests/sec.' },
      { name: 'Transparent Pricing Tiers', item1: 'Developer Free Tier', desc1: '100,000 monthly requests with community support.', item2: 'Pro Scale Mesh ($49/mo)', desc1: 'Unlimited requests, sub-10ms SLA, and Slack support.' }
    ]
  },
  {
    slug: 'education',
    title: 'Quantum Code Academy // Systems Engineering',
    tagline: 'Master full-stack architecture, Rust, WebAssembly, and AI compilers in 12 weeks.',
    primary: '#1e1b4b',
    accent: '#7c3aed',
    nav: ['Curriculum', 'Cohorts', 'Instructors', 'Alumni', 'Enroll'],
    heroSubtitle: 'Immersive cohort-based bootcamps led by senior principal architects from Google, Meta, and OpenAI.',
    sections: [
      { name: 'Syllabus Modules', item1: 'Module 1: Low-Level Compilers', desc1: 'Building AST parsers and WebAssembly runtimes from scratch.', item2: 'Module 2: Distributed Systems', desc1: 'Raft consensus, WAL logging, and distributed key-value stores.' },
      { name: 'Career Telemetry', item1: '94% Placement Rate', desc1: 'Graduates hired at top tier infrastructure companies.', item2: '$145,000 Average Starting Salary', desc1: 'Verified outcome reports independently audited.' }
    ]
  },
  {
    slug: 'real-estate',
    title: 'Horizon Luxury Estates & Private Villas',
    tagline: 'Exclusive architectural residences, beachfront estates, and penthouse properties.',
    primary: '#111827',
    accent: '#059669',
    nav: ['Listings', 'Private Collection', 'Neighborhoods', 'Advisory', 'Contact Agent'],
    heroSubtitle: 'Curating trophy real estate for high-net-worth individuals across prime coastal locations.',
    sections: [
      { name: 'Featured Private Residences', item1: 'Villa Vista Hermosa', desc1: '6 Bed, 8 Bath oceanfront estate with infinity pool and private helipad.', item2: 'The Skyline Penthouse', desc1: 'Panoramic 360-degree urban penthouse with floor-to-ceiling glass.' },
      { name: 'Bespoke Brokerage Services', item1: 'Off-Market Advisory', desc1: 'Confidential acquisitions for discrete buyers.', item2: 'Asset Management', desc1: 'Full-service luxury property management and leasing.' }
    ]
  },
  {
    slug: 'photography',
    title: 'Luminary Studio // Editorial Photography',
    tagline: 'Capturing spatial design, high-fashion portraiture, and architectural installations.',
    primary: '#050505',
    accent: '#71717a',
    nav: ['Portfolio', 'Editorial', 'Commissions', 'About', 'Book Session'],
    heroSubtitle: 'Minimalist visual storytelling published in Architectural Digest, Vogue, and Monocle.',
    sections: [
      { name: 'Selected Commissions', item1: 'Spatial Monograph 2026', desc1: 'Architectural documentation of modern concrete residences.', item2: 'Haute Couture Editorial', desc1: 'Studio lighting and portraiture for Paris Fashion Week.' },
      { name: 'Commission Inquiries', item1: 'Commercial Campaign Day Rate', desc1: 'Full production crew, medium-format equipment, and color grading.', item2: 'Architectural Licensing', desc1: 'High-resolution digital rights for print and digital monographs.' }
    ]
  },
  {
    slug: 'ngo',
    title: 'EcoEarth Foundation // Global Conservation',
    tagline: 'Protecting vital rainforest ecosystems, marine reserves, and endangered wildlife habitats.',
    primary: '#064e3b',
    accent: '#10b981',
    nav: ['Initiatives', 'Impact', 'Projects', 'Get Involved', 'Donate'],
    heroSubtitle: 'Over 2.4 million trees planted and 500,000 acres of ancient forest permanently protected.',
    sections: [
      { name: 'Active Conservation Programs', item1: 'Amazon Canopy Shield', desc1: 'Satellite monitoring and indigenous ranger patrols preventing illegal logging.', item2: 'Coral Reef Sanctuary Mesh', desc1: 'Restoring damaged marine habitats with ocean temperature sensors.' },
      { name: 'Transparent Impact Telemetry', item1: '89% Direct Program Funding', desc1: 'Maximum efficiency rated by Charity Navigator.', item2: 'Community Empowerment', desc1: 'Providing sustainable micro-grants to local indigenous stewards.' }
    ]
  },
  {
    slug: 'agency',
    title: 'Apex Digital // Brand & Growth Agency',
    tagline: 'Engineering high-converting digital identity systems, web apps, and performance marketing.',
    primary: '#18181b',
    accent: '#ec4899',
    nav: ['Services', 'Case Studies', 'Methodology', 'Clients', 'Start Project'],
    heroSubtitle: 'Partnering with ambitious founders to launch digital products that define new categories.',
    sections: [
      { name: 'Agency Offerings', item1: 'Brand Strategy & Visual Identity', desc1: 'Complete design systems, typography, and brand positioning.', item2: 'Full-Stack Web Development', desc1: 'Custom Next.js applications engineered for maximum conversion.' },
      { name: 'Client Case Studies', item1: 'NovaCore AI Rebrand', desc1: 'Increased organic conversions by 310% in 90 days.', item2: 'Apex SaaS Platform', desc1: 'Scaled from pre-seed launch to $10M ARR visual identity.' }
    ]
  },
  {
    slug: 'blog',
    title: 'Tech Dispatches // Engineering Journal',
    tagline: 'Rigorous technical essays on distributed databases, compiler theory, and AI safety.',
    primary: '#0f172a',
    accent: '#2563eb',
    nav: ['Latest', 'Architecture', 'AI & Compilers', 'Archive', 'Subscribe'],
    heroSubtitle: 'Written by senior staff engineers for developers building mission-critical software.',
    sections: [
      { name: 'Featured Technical Essays', item1: 'Building a Deterministic WASM Compiler in Rust', desc1: 'A deep dive into register allocation, SSA form, and instruction selection.', item2: 'Optimizing P99 Latency in Edge Networks', desc1: 'Zero-copy buffer allocation and eBPF kernel packet filtering.' },
      { name: 'Subscribe to Dispatches', item1: 'Weekly Engineering Brief', desc1: 'Get curated technical breakdowns delivered directly to your inbox.', item2: 'Open Source Repositories', desc1: 'Access example benchmark code and standalone performance test suites.' }
    ]
  }
];

const publicDir = path.join(process.cwd(), 'public', 'templates');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

templates.forEach(t => {
  const dir = path.join(publicDir, t.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const html = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #ffffff; color: ${t.primary}; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="min-h-screen bg-white text-[${t.primary}] selection:bg-black selection:text-white">

  <!-- Navigation Bar -->
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-[${t.primary}]">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <a href="#" class="text-xl font-black uppercase tracking-tight text-[${t.primary}] flex items-center gap-2">
        <span class="w-3 h-3 bg-[${t.accent}] border border-[${t.primary}] inline-block"></span>
        <span>${t.title.split('//')[0]}</span>
      </a>
      <nav class="hidden md:flex items-center gap-8 text-xs font-mono font-bold uppercase tracking-wider">
        ${t.nav.map(item => `<a href="#${item.toLowerCase().replace(/[^a-z0-9]/g, '-')}" class="hover:text-[${t.accent}] transition-colors">${item}</a>`).join('')}
      </nav>
      <div class="flex items-center gap-3">
        <a href="#contact" class="px-5 py-2.5 bg-[${t.primary}] text-white text-xs font-mono font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          Get Started
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="py-24 sm:py-32 px-6 border-b-2 border-[${t.primary}] bg-neutral-50 relative overflow-hidden">
    <div class="max-w-5xl mx-auto text-center relative z-10">
      <div class="inline-flex items-center gap-2 px-3.5 py-1 mb-8 border-2 border-[${t.primary}] bg-white text-xs font-mono font-bold uppercase tracking-widest text-[${t.primary}] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        <span class="w-2 h-2 rounded-full bg-[${t.accent}]"></span>
        <span>OFFICIAL TEMPLATE // ${t.slug.toUpperCase()}</span>
      </div>
      <h1 class="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-[1.08] text-[${t.primary}] mb-8">
        ${t.title}
      </h1>
      <p class="text-lg sm:text-xl text-neutral-700 max-w-3xl mx-auto font-normal leading-relaxed mb-12">
        ${t.tagline} ${t.heroSubtitle}
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="#explore" class="w-full sm:w-auto px-8 py-4 bg-[${t.primary}] text-white font-mono font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Explore Experience →
        </a>
        <a href="#contact" class="w-full sm:w-auto px-8 py-4 bg-white text-[${t.primary}] border-2 border-[${t.primary}] font-mono font-bold text-xs uppercase tracking-wider hover:bg-neutral-100 transition-all text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Direct Intake
        </a>
      </div>
    </div>
  </section>

  <!-- Content Sections -->
  ${t.sections.map(sec => `
  <section id="${sec.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}" class="py-20 px-6 border-b-2 border-[${t.primary}] bg-white">
    <div class="max-w-7xl mx-auto">
      <div class="mb-12 border-b-2 border-[${t.primary}] pb-4 flex items-center justify-between">
        <div>
          <span class="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border border-[${t.primary}] bg-neutral-100 text-[${t.primary}] mb-2 inline-block">
            ${sec.name}
          </span>
          <h2 class="text-3xl font-black uppercase tracking-tight text-[${t.primary}]">${sec.name}</h2>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="border-2 border-[${t.primary}] p-8 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div class="text-xs font-mono font-bold uppercase text-[${t.accent}] mb-2">// 01 FEATURE</div>
          <h3 class="text-xl font-bold uppercase text-[${t.primary}] mb-3">${sec.item1}</h3>
          <p class="text-sm text-neutral-600 leading-relaxed font-mono">${sec.desc1}</p>
        </div>
        <div class="border-2 border-[${t.primary}] p-8 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div class="text-xs font-mono font-bold uppercase text-[${t.accent}] mb-2">// 02 FEATURE</div>
          <h3 class="text-xl font-bold uppercase text-[${t.primary}] mb-3">${sec.item2}</h3>
          <p class="text-sm text-neutral-600 leading-relaxed font-mono">${sec.desc2}</p>
        </div>
      </div>
    </div>
  </section>
  `).join('')}

  <!-- Contact Section -->
  <section id="contact" class="py-24 px-6 border-b-2 border-[${t.primary}] bg-neutral-50">
    <div class="max-w-3xl mx-auto border-2 border-[${t.primary}] p-8 sm:p-12 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div class="text-center mb-10">
        <span class="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 border border-[${t.primary}] bg-neutral-100 mb-3 inline-block">
          INQUIRY DESK
        </span>
        <h2 class="text-3xl font-black uppercase text-[${t.primary}] mb-2">Connect With ${t.title.split('//')[0]}</h2>
        <p class="text-xs font-mono text-neutral-600">Submit your details for immediate consultation.</p>
      </div>
      <form class="space-y-4 font-mono text-xs" onsubmit="event.preventDefault(); alert('Inquiry submitted!');">
        <div>
          <label class="block font-bold uppercase mb-1">Full Name</label>
          <input type="text" required placeholder="Enter full name" class="w-full p-3 border-2 border-[${t.primary}] outline-none focus:ring-2 focus:ring-[${t.primary}] bg-white" />
        </div>
        <div>
          <label class="block font-bold uppercase mb-1">Email Address</label>
          <input type="email" required placeholder="name@company.com" class="w-full p-3 border-2 border-[${t.primary}] outline-none focus:ring-2 focus:ring-[${t.primary}] bg-white" />
        </div>
        <div>
          <label class="block font-bold uppercase mb-1">Message</label>
          <textarea rows="4" required placeholder="Describe your project or inquiry..." class="w-full p-3 border-2 border-[${t.primary}] outline-none focus:ring-2 focus:ring-[${t.primary}] bg-white"></textarea>
        </div>
        <button type="submit" class="w-full py-4 bg-[${t.primary}] text-white font-bold uppercase tracking-wider hover:opacity-90 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Submit Message →
        </button>
      </form>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-12 px-6 bg-white text-[${t.primary}] font-mono text-xs border-b-2 border-[${t.primary}]">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="font-bold uppercase tracking-wider">
        © 2026 ${t.title.split('//')[0]}. All rights reserved.
      </div>
      <div class="flex items-center gap-6 font-bold uppercase">
        <a href="#" class="hover:underline">Privacy Policy</a>
        <a href="#" class="hover:underline">Terms of Service</a>
        <a href="#" class="hover:underline">Security</a>
      </div>
    </div>
  </footer>

</body>
</html>`;

  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf-8');
});

console.log('Successfully generated 12 distinct template HTML files in public/templates!');
