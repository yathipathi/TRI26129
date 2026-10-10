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
  | 'not-found'
  /* Student & Knowledge Components */
  | 'summary'
  | 'key-points'
  | 'glossary'
  | 'flashcards'
  | 'quiz'
  | 'compare-table'
  | 'concept-map'
  | 'bibliography'
  | 'faq-sources'
  | 'toc-reading-time';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  resetToken?: string;
  resetTokenExpiry?: number;
  createdAt: number;
}

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
  url?: string;
  sourceId?: string;
  chunkId?: string;
  pageRef?: string | number;
  snippet?: string;
  confidence?: 'high' | 'medium' | 'low';
}

export interface SectionCitation {
  id?: string;
  projectId?: string;
  versionId?: number;
  sectionId: string;
  fieldPath: string;
  sourceId: string;
  chunkId?: string;
  snippet: string;
  pageRef?: string | number;
  confidence: 'high' | 'medium' | 'low';
  verifiedStatus: 'supported' | 'partially_supported' | 'not_supported' | 'source_removed';
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
  citations?: SectionCitation[];
  flags?: ClaimFlag[];
}

export interface PageSpec {
  slug: string;
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
    id: string;
    name: string;
    siteName?: string;
    siteType?: string;
    description: string;
    version: number;
    createdAt: number;
    updatedAt: number;
    groundingStrict?: boolean;
    webResearchAllowed?: boolean;
  };
  theme: ThemeSpec;
  pages: PageSpec[];
}

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
  front?: string;
  back?: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  sourceId?: string;
  pageRef?: string | number;
}

export type LegacySectionItem = SectionItem;

export interface AuthField {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
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
  isLocked?: boolean;
  isHidden?: boolean;
  pinnedFields?: string[];
  sources?: SourceCitation[];
  citations?: SectionCitation[];
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
  prompt?: string;
  industry?: string;
  tone?: string;
  pages?: WebsitePage[];
  activePageSlug?: string;
  sections: Section[];
  fileTree?: Record<string, string>;
  dbSchema?: string;
  apiRoutes?: string[];
  customHooks?: Record<string, string>;
  componentArchitecture?: any;
  dbTables?: any;
  status?: 'draft' | 'verified' | 'exported';
  currentVersion?: number;
  siteName?: string;
  siteType?: string;
  createdAt?: number;
  updatedAt?: number;
  userId?: string;
  isDeleted?: boolean;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  type: string;
  status: 'draft' | 'verified' | 'exported';
  currentVersion: number;
  siteSpec: SiteSpec | WebsiteProject;
  fileTree?: Record<string, string>;
  createdAt: number;
  updatedAt: number;
  isDeleted?: boolean;
  deletedAt?: number;
}

export interface Version {
  id: string;
  projectId: string;
  versionNumber: number;
  label: string;
  siteSpec: SiteSpec | WebsiteProject;
  spec?: SiteSpec | WebsiteProject;
  changelog?: string;
  createdAt: number;
}

export interface VerificationReport {
  projectId: string;
  versionId?: number | string;
  status: 'PASS' | 'FAIL';
  passedCount: number;
  failedCount: number;
  totalTested: number;
  pagesTested: string[];
  deadLinks: string[];
  consoleErrors: string[];
  screenshots?: any[];
  timestamp?: number;
  createdAt: number;
}

export interface SecurityReport {
  projectId: string;
  status: 'SAFE' | 'WARNING';
  checkedRules: string[];
  vulnerabilities: string[];
  createdAt: number;
}

export interface FormSubmission {
  id: string;
  projectId: string;
  formType: string;
  name?: string;
  email?: string;
  message?: string;
  data: Record<string, any>;
  createdAt: number;
}

export interface EventLog {
  id: string;
  userId: string;
  projectId?: string;
  type: string;
  metadata?: any;
  createdAt: number;
}

export interface EditorCommand {
  id: string;
  type?: string;
  description: string;
  timestamp: number;
  prevSpec?: any;
  nextSpec?: any;
  undoState?: any;
  doState?: any;
}

export interface AIProposal {
  id: string;
  scope: 'section' | 'page' | 'site';
  instruction: string;
  prompt?: string;
  targetSectionId?: string;
  diffs?: any[];
  diffSummary?: any[];
  proposedSpec: any;
  changelog: string;
  explanation?: string;
  whyExplanation?: string;
  skippedPinnedFields?: string[];
}

export type AIEditScope = 'section' | 'page' | 'site';

export interface ChatMessage {
  id: string;
  sender?: any;
  role?: any;
  text?: string;
  content?: string;
  timestamp: number;
  proposal?: AIProposal;
  steps?: any[];
  suggestedActions?: any[];
}

export interface PlannedFile {
  path?: string;
  filepath?: string;
  purpose?: string;
  description?: string;
  imports?: string[];
}

export interface ProjectPlan {
  name?: string;
  projectName?: string;
  architecture?: string;
  layoutType?: string;
  styleSystem?: string;
  files?: PlannedFile[];
  fileTree?: any;
  allowlistComponents?: any;
  success?: boolean;
  errors?: string[];
  customHooks?: any;
  dbTables?: any;
}

/* Knowledge Library Types */
export type SourceFileType = 'pdf' | 'docx' | 'txt' | 'md' | 'html' | 'pptx' | 'image' | 'url' | 'text';

export interface UserQuota {
  userId: string;
  filesUsed: number;
  bytesUsed: number;
  maxFiles: number;
  maxBytes: number;
}

export interface SourceItem {
  id: string;
  userId: string;
  projectId?: string | null;
  title: string;
  description?: string;
  chunkCount?: number;
  authors?: string[];
  year?: number | string;
  type: SourceFileType;
  language?: string;
  url?: string;
  filePath?: string;
  hash: string;
  status: 'processing' | 'ready' | 'error' | 'source_removed';
  publicFlag?: boolean;
  citationJson?: {
    apa?: string;
    mla?: string;
    ieee?: string;
    harvard?: string;
  };
  summary?: string;
  keyTerms?: string[];
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  usedInSections?: string[];
}

export interface SourceChunk {
  id: string;
  sourceId: string;
  idx: number;
  text: string;
  content?: string;
  pageRef?: string | number;
  pageAnchor?: string;
  embedding?: number[];
  tokenCount: number;
}

export interface IngestionJob {
  id: string;
  sourceId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  createdAt: number;
}

export type AIOperationType = 
  | 'add_section'
  | 'update_props'
  | 'remove_section'
  | 'move_section'
  | 'update_theme'
  | 'update_page';

export interface AIOperation {
  type: AIOperationType;
  targetScope: 'section' | 'page' | 'site';
  targetSectionId?: string;
  targetPageSlug?: string;
  position?: 'above' | 'below' | 'end' | number;
  newSection?: SectionSpec | Section;
  propPatches?: Record<string, any>;
  citationAdds?: SectionCitation[];
  changelog: string;
  whyExplanation?: string;
}
