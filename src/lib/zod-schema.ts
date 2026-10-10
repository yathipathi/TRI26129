import { z } from 'zod';

export const CTAButtonSchema = z.object({
  text: z.string().min(1, 'CTA text cannot be empty'),
  link: z.string().default('#'),
  variant: z.enum(['primary', 'secondary', 'outline']).optional().default('primary'),
});

export const SectionItemSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  badge: z.string().optional(),
  price: z.string().optional(),
  period: z.string().optional(),
  features: z.array(z.string()).optional(),
  author: z.string().optional(),
  role: z.string().optional(),
  avatar: z.string().optional(),
  stat: z.string().optional(),
  label: z.string().optional(),
  question: z.string().optional(),
  answer: z.string().optional(),
  image: z.string().optional(),
  category: z.string().optional(),
  date: z.string().optional(),
  status: z.string().optional(),
  front: z.string().optional(),
  back: z.string().optional(),
  options: z.array(z.string()).optional(),
  correctIndex: z.number().optional(),
  explanation: z.string().optional(),
  sourceId: z.string().optional(),
  pageRef: z.union([z.string(), z.number()]).optional(),
});

export const AuthFieldSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Auth field label is required'),
  type: z.string().default('text'),
  placeholder: z.string().default(''),
  required: z.boolean().optional().default(true),
});

export const SectionTypeSchema = z.enum([
  'navbar',
  'hero',
  'auth',
  'dashboard',
  'features',
  'stats',
  'testimonials',
  'pricing',
  'faq',
  'cta',
  'contact',
  'gallery',
  'blog',
  'team',
  'footer',
  'about',
  'timeline',
  'services-grid',
  'menu-grid',
  'products-grid',
  'product-detail',
  'cart',
  'checkout',
  'order-confirmation',
  'booking',
  'tabs',
  'modal',
  'newsletter',
  'login',
  'signup',
  'not-found',
  'summary',
  'key-points',
  'glossary',
  'flashcards',
  'quiz',
  'compare-table',
  'concept-map',
  'bibliography',
  'faq-sources',
  'toc-reading-time',
]);

export const SectionCitationSchema = z.object({
  id: z.string().optional(),
  projectId: z.string().optional(),
  versionId: z.number().optional(),
  sectionId: z.string(),
  fieldPath: z.string(),
  sourceId: z.string(),
  chunkId: z.string().optional(),
  snippet: z.string(),
  pageRef: z.union([z.string(), z.number()]).optional(),
  confidence: z.enum(['high', 'medium', 'low']).default('high'),
  verifiedStatus: z.enum(['supported', 'partially_supported', 'not_supported', 'source_removed']).default('supported'),
});

export const SectionSchema = z.object({
  id: z.string(),
  type: SectionTypeSchema,
  title: z.string().min(1, 'Section title is required'),
  subtitle: z.string().optional(),
  badge: z.string().optional(),
  layout: z.string().optional(),
  ctaPrimary: CTAButtonSchema.optional(),
  ctaSecondary: CTAButtonSchema.optional(),
  items: z.array(SectionItemSchema).optional(),
  authFields: z.array(AuthFieldSchema).optional(),
  extraDetails: z.record(z.string(), z.any()).optional(),
  customCss: z.string().optional(),
  isLocked: z.boolean().optional(),
  isHidden: z.boolean().optional(),
  pinnedFields: z.array(z.string()).optional(),
  citations: z.array(SectionCitationSchema).optional(),
});

export const WebsitePageSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  sections: z.array(SectionSchema),
});

export const WebsiteProjectSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Project title is required'),
  description: z.string().default(''),
  prompt: z.string().default(''),
  industry: z.string().default('General Enterprise'),
  tone: z.string().default('Modern & Minimalist'),
  pages: z.array(WebsitePageSchema).optional(),
  activePageSlug: z.string().optional(),
  sections: z.array(SectionSchema).min(1, 'Project must contain at least one section'),
  fileTree: z.record(z.string(), z.string()).optional(),
  dbSchema: z.string().optional(),
  apiRoutes: z.array(z.string()).optional(),
  status: z.enum(['draft', 'verified', 'exported']).optional().default('draft'),
  currentVersion: z.number().optional().default(1),
});

export const AIOperationSchema = z.object({
  type: z.enum(['add_section', 'update_props', 'remove_section', 'move_section', 'update_theme', 'update_page']),
  targetScope: z.enum(['section', 'page', 'site']),
  targetSectionId: z.string().optional(),
  targetPageSlug: z.string().optional(),
  position: z.union([z.enum(['above', 'below', 'end']), z.number()]).optional(),
  newSection: SectionSchema.optional(),
  propPatches: z.record(z.string(), z.any()).optional(),
  citationAdds: z.array(SectionCitationSchema).optional(),
  changelog: z.string().min(1),
  whyExplanation: z.string().optional(),
});

import { PlannedFile, ProjectPlan } from '@/types';
export type { PlannedFile, ProjectPlan };

export function validateProjectPlan(data: any): ProjectPlan {
  if (data && typeof data === 'object' && Array.isArray(data.files)) {
    return data as ProjectPlan;
  }
  return {
    projectName: 'SiteForge Architecture',
    architecture: 'Modular Next.js / Tailwind Structure',
    files: [{ filepath: 'src/app/page.tsx', purpose: 'Main landing page' }],
  };
}

export function validateWebsiteProjectSchema(data: any) {
  const result = WebsiteProjectSchema.safeParse(data);
  if (result.success) {
    return { valid: true, data: result.data };
  }
  return { valid: false, errors: result.error.issues };
}
