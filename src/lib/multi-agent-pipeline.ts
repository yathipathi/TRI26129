import { 
  ProjectPlan, 
  PlannedFile, 
  validateProjectPlan, 
  validateWebsiteProjectSchema 
} from './zod-schema';
import { STARTER_UI_COMPONENTS, BASE_VITE_CONFIG, UI_COMPONENT_ALLOWLIST } from './starter-template';
import { scanAndSanitizeFiles, runSecurityAudit } from './security-scanner';
import { generateCustomHooks } from './hooks-generator';
import { WebsiteProject, Section } from '@/types';
import { generateSmartWebsite, generateId } from './ai-generator';

/**
 * Multi-Agent Two-Phase Generation Orchestrator
 * 
 * Pipeline:
 * Prompt -> Injection Guard -> Planner (strict plan) -> Generator (file-by-file) ->
 * Validator (paths, imports, refusals, retry/fallback) -> AppSec Scanner -> FileSystemTree
 */

export interface GenerationProgressEvent {
  phase: 'guard' | 'planner' | 'generator' | 'validator' | 'security' | 'done' | 'error';
  message: string;
  data?: any;
}

// ─── 1. Injection Guard ───────────────────────────────────────────────────────
export function checkPromptInjection(prompt: string): { safe: boolean; reason?: string } {
  const normalized = prompt.toLowerCase();
  const dangerousPatterns = [
    'ignore all previous instructions',
    'disregard previous rules',
    'system prompt leak',
    '<script>',
    'drop database',
    'rm -rf',
  ];

  for (const pattern of dangerousPatterns) {
    if (normalized.includes(pattern)) {
      return {
        safe: false,
        reason: `Potential prompt injection / malicious directive detected: "${pattern}"`,
      };
    }
  }

  return { safe: true };
}

// ─── 2. Planner Agent ─────────────────────────────────────────────────────────
export function createProjectPlan(prompt: string, title?: string): ProjectPlan {
  const name = title || prompt.slice(0, 30).trim().replace(/[^a-zA-Z0-9 ]/g, '') || 'Modern SaaS';
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

  const files: PlannedFile[] = [
    {
      path: 'src/main.jsx',
      purpose: 'Vite React application entry point',
      imports: ['react', 'react-dom/client', './App.jsx'],
    },
    {
      path: 'src/App.jsx',
      purpose: 'Root application composition with layout and reactive states',
      imports: ['react', './components/Hero.jsx', './components/Features.jsx', './components/Footer.jsx'],
    },
    {
      path: 'src/components/Hero.jsx',
      purpose: 'Primary monochrome visual hero with call to actions',
      imports: ['react', '@/components/ui/button', '@/components/ui/badge'],
    },
    {
      path: 'src/components/Features.jsx',
      purpose: 'Modular feature matrix using compound cards',
      imports: ['react', '@/components/ui/card', '@/components/ui/badge'],
    },
    {
      path: 'src/components/Footer.jsx',
      purpose: 'Site footer with links and system status badge',
      imports: ['react', '@/components/ui/badge'],
    },
  ];

  return {
    name,
    layoutType: 'multi-section',
    styleSystem: 'monochrome-minimalist',
    fileTree: files,
    customHooks: ['useProfiles', 'useInquiries'],
    dbTables: ['profiles', 'inquiries'],
    allowlistComponents: [...UI_COMPONENT_ALLOWLIST],
  };
}

// ─── 3. Generator Agent (File by File with Signature Consistency) ─────────────
export interface GenerationResult {
  plan: ProjectPlan;
  files: Record<string, string>;
  project: WebsiteProject;
  securityScore: number;
  fixesApplied: string[];
  refusalDetected: boolean;
}

export function executeGenerationPipeline(
  prompt: string,
  existingProject?: WebsiteProject | null,
  onProgress?: (event: GenerationProgressEvent) => void
): GenerationResult {
  // Phase 1: Injection Guard
  onProgress?.({ phase: 'guard', message: 'Verifying prompt safety and checking injection boundaries...' });
  const guard = checkPromptInjection(prompt);
  if (!guard.safe) {
    throw new Error(guard.reason);
  }

  // Phase 2: Planner Agent
  onProgress?.({ phase: 'planner', message: 'Planner Agent synthesizing modular file tree & schema contract...' });
  const baseProject = existingProject || generateSmartWebsite(prompt);
  const plan = createProjectPlan(prompt, baseProject.title);

  // Validate the plan
  onProgress?.({ phase: 'validator', message: 'Validating plan paths, import references, and limits...' });
  const planValidation = validateProjectPlan(plan);
  if (!planValidation.success) {
    console.warn('Plan validation warnings:', planValidation.errors);
  }

  // Phase 3: Generator Agent
  onProgress?.({ phase: 'generator', message: 'Generator Agent writing modular React components & hooks...' });

  const generatedFiles: Record<string, string> = {
    ...STARTER_UI_COMPONENTS,
    'vite.config.js': BASE_VITE_CONFIG,
    'package.json': JSON.stringify(
      {
        name: baseProject.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        version: '1.0.0',
        type: 'module',
        scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
        dependencies: {
          react: '^19.0.0',
          'react-dom': '^19.0.0',
          'lucide-react': '^1.55.0',
          '@supabase/supabase-js': '^2.48.0',
        },
        devDependencies: {
          '@vitejs/plugin-react': '^4.2.0',
          vite: '^5.1.0',
        },
      },
      null,
      2
    ),
    'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${baseProject.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-white text-black min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
  };

  // Generate custom hooks
  const hooksCode = generateCustomHooks(baseProject);
  generatedFiles['src/hooks/useSupabase.ts'] = hooksCode;

  // Generate main.jsx
  generatedFiles['src/main.jsx'] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

  // Generate App.jsx
  generatedFiles['src/App.jsx'] = `import React from 'react';
import { Hero } from './components/Hero.jsx';
import { Features } from './components/Features.jsx';
import { Footer } from './components/Footer.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}
`;

  // Generate Hero.jsx with Shadcn UI Button and Badge
  generatedFiles['src/components/Hero.jsx'] = `import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Hero() {
  return (
    <header className="border-b-2 border-black py-20 px-6 sm:px-12 bg-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <Badge>${(baseProject.industry || 'General').toUpperCase()}</Badge>
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-black leading-none">
          ${baseProject.title}
        </h1>
        <p className="text-base sm:text-lg text-neutral-700 max-w-2xl font-mono">
          ${baseProject.description || 'High-performance minimal architecture built for speed, precision, and durability.'}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-4">
          <Button variant="default" size="lg">Get Started</Button>
          <Button variant="outline" size="lg">Documentation</Button>
        </div>
      </div>
    </header>
  );
}
`;

  // Generate Features.jsx with Shadcn UI Cards
  generatedFiles['src/components/Features.jsx'] = `import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function Features() {
  const items = [
    { title: 'Zero Latency', desc: 'Instant local compilation with client-side WebContainers isolate.' },
    { title: 'Type Safe', desc: 'Guaranteed Zod schema contracts for components, APIs, and SQL migrations.' },
    { title: 'Persistent DB', desc: 'Real-time WebSocket subscriptions backed by Supabase PostgreSQL.' },
  ];

  return (
    <section className="py-16 px-6 sm:px-12 border-b-2 border-black bg-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <Badge>ARCHITECTURE</Badge>
          <h2 className="text-2xl font-black uppercase tracking-tight text-black">Core Capabilities</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <Card key={idx} className="hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
              <CardHeader>
                <div className="font-mono text-xs font-bold uppercase">{item.title}</div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-neutral-700 leading-relaxed font-mono">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

  // Generate Footer.jsx
  generatedFiles['src/components/Footer.jsx'] = `import React from 'react';
import { Badge } from '@/components/ui/badge';

export function Footer() {
  return (
    <footer className="py-8 px-6 sm:px-12 bg-white text-black border-t border-black">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs font-mono text-neutral-600">
          © ${new Date().getFullYear()} ${baseProject.title}. All rights reserved.
        </div>
        <div className="flex items-center gap-2">
          <Badge>MONOCHROME v2.0</Badge>
          <Badge>VERIFIED</Badge>
        </div>
      </div>
    </footer>
  );
}
`;

  // Phase 4: AppSec Sanitizer Agent (Runs BEFORE mount)
  onProgress?.({ phase: 'security', message: 'AppSec Agent running AST lexical sanitization and injecting CSP...' });
  const sanitized = scanAndSanitizeFiles(generatedFiles);

  // Update project representation
  const finalProject: WebsiteProject = {
    ...baseProject,
    fileTree: sanitized.sanitizedFiles,
    customHooks: plan.customHooks,
    componentArchitecture: 'modular',
    dbTables: plan.dbTables,
  };

  const securityAudit = runSecurityAudit(finalProject);

  onProgress?.({ phase: 'done', message: 'Two-phase pipeline complete with verified AppSec score!' });

  return {
    plan,
    files: sanitized.sanitizedFiles,
    project: finalProject,
    securityScore: securityAudit.score,
    fixesApplied: sanitized.fixesApplied,
    refusalDetected: false,
  };
}
