export type SectionType = 
  | 'navbar'
  | 'hero'
  | 'auth'
  | 'dashboard'
  | 'features'
  | 'stats'
  | 'testimonials'
  | 'pricing'
  | 'faq'
  | 'cta'
  | 'contact'
  | 'gallery'
  | 'blog'
  | 'team'
  | 'footer'
  | 'about'
  | 'timeline'
  | 'services-grid'
  | 'menu-grid'
  | 'products-grid'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'order-confirmation'
  | 'booking'
  | 'tabs'
  | 'modal'
  | 'newsletter'
  | 'login'
  | 'signup'
  | 'not-found';

export interface CTAButton {
  text: string;
  link: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface ClaimFlag {
  propKey: string;
  claimValue: string;
  reason: string;
  status: 'unverified' | 'verified' | 'dismissed';
}

export interface SourceCitation {
  title: string;
  url: string;
  snippet?: string;
}

export interface SectionSpec {
  id: string;
  type: SectionType;
  title: string;
  subtitle?: string;
  badge?: string;
  variant?: string;
  rationale?: string;
  isLocked?: boolean;
  isHidden?: boolean;
  pinnedFields?: string[];
  props: Record<string, any>;
  style?: {
    paddingY?: string;
    background?: string;
    animation?: string;
  };
  sources?: SourceCitation[];
  flags?: ClaimFlag[];
}

export interface PageSpec {
  slug: string; // 'index.html', 'about.html', 'services.html', 'contact.html', etc.
  title: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  sections: SectionSpec[];
}

export interface ThemeSpec {
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    sans: string;
    mono: string;
  };
  radius: string;
}

export interface SiteSpec {
  meta: {
    siteId: string;
    siteName: string;
    siteType: string;
    goal: string;
    audience: string;
    location?: string;
    tone: string;
    language: string;
    templateSlug?: string;
  };
  theme: ThemeSpec;
  pages: PageSpec[];
  nav: {
    brandName: string;
    links: { label: string; href: string }[];
    ctaPrimary?: CTAButton;
    ctaSecondary?: CTAButton;
  };
  footer: {
    brandName: string;
    copyright: string;
    links: { label: string; href: string }[];
  };
  data: {
    products?: any[];
    menu?: any[];
    services?: any[];
    posts?: any[];
    team?: any[];
    testimonials?: any[];
    faqs?: any[];
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  resetToken?: string;
  resetTokenExp?: number;
  createdAt: number;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  type: string;
  status: 'draft' | 'verified' | 'exported';
  currentVersion: number;
  createdAt: number;
  updatedAt: number;
}

export interface Version {
  id: string;
  projectId: string;
  versionNumber: number;
  spec: SiteSpec;
  label: string;
  createdBy: string;
  createdAt: number;
}

export interface VerificationReport {
  versionId: string;
  totalTested: number;
  passedCount: number;
  failedCount: number;
  pagesTested: string[];
  deadLinks: string[];
  consoleErrors: string[];
  status: 'PASS' | 'FAIL';
  screenshots: string[];
  timestamp: number;
}

export interface SecurityReport {
  versionId: string;
  cspInjected: boolean;
  noInlineEvents: boolean;
  staticOutputChecked: boolean;
  findings: {
    severity: 'HIGH' | 'MED' | 'LOW';
    title: string;
    description: string;
  }[];
  timestamp: number;
}

export interface FormSubmission {
  id: string;
  projectId: string;
  formName: string;
  data: Record<string, any>;
  createdAt: number;
}

export interface EventLog {
  id: string;
  userId: string;
  projectId?: string;
  type: string;
  metadata?: Record<string, any>;
  createdAt: number;
}

// Deprecated legacy types for backwards compatibility
export interface SectionItem {
  id: string;
  title?: string;
  description?: string;
  icon?: string;
  badge?: string;
  price?: string;
  period?: string;
  features?: string[];
  author?: string;
  role?: string;
  avatar?: string;
  stat?: string;
  label?: string;
  question?: string;
  answer?: string;
  image?: string;
  category?: string;
  date?: string;
  status?: string;
}

export interface AuthField {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  required?: boolean;
}

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  subtitle?: string;
  badge?: string;
  layout?: string;
  ctaPrimary?: CTAButton;
  ctaSecondary?: CTAButton;
  items?: SectionItem[];
  authFields?: AuthField[];
  extraDetails?: Record<string, any>;
  customCss?: string;
}

export interface WebsitePage {
  id: string;
  name: string;
  slug: string;
  title: string;
  description?: string;
  sections: Section[];
}

export interface WebsiteProject {
  id: string;
  title: string;
  description: string;
  prompt: string;
  industry: string;
  tone: string;
  pages?: WebsitePage[];
  activePageSlug?: string;
  sections: Section[];
  fileTree?: Record<string, string>;
  customHooks?: any[];
  componentArchitecture?: any;
  dbTables?: any[];
  createdAt: number;
  updatedAt: number;
}

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  steps?: any[];
  suggestedActions?: string[];
}

export type OperationType =
  | 'UPDATE_SECTION_PROPS'
  | 'ADD_SECTION'
  | 'DELETE_SECTION'
  | 'REORDER_SECTIONS'
  | 'DUPLICATE_SECTION'
  | 'TOGGLE_SECTION_LOCK'
  | 'TOGGLE_SECTION_HIDE'
  | 'UPDATE_THEME'
  | 'UPDATE_PAGE_SEO'
  | 'ADD_PAGE'
  | 'DELETE_PAGE'
  | 'REORDER_PAGES';

export interface EditorCommand {
  id: string;
  type: OperationType;
  description: string;
  timestamp: number;
  doState: SiteSpec;
  undoState: SiteSpec;
}

export type AIEditScope = 'section' | 'page' | 'site';

export interface AIProposal {
  id: string;
  scope: AIEditScope;
  targetSectionId?: string;
  prompt: string;
  explanation: string;
  proposedSpec: SiteSpec;
  diffSummary: {
    sectionId: string;
    sectionTitle: string;
    beforeProps: Record<string, any>;
    afterProps: Record<string, any>;
  }[];
  skippedPinnedFields: string[];
}

