# SiteForge Product Requirements & Specification (`SPEC.md`)

## Features & Product Rules

### F1: AUTH GATE
Protected page route access control (/login, /signup, /forgot-password, /reset-password, /auth/callback, static assets permitted). Server-side middleware redirects unauthenticated requests to `/login?next=<path>` (same-origin relative URL validated). Protected `/api` routes return 401 JSON. Logged-in users visiting `/login` or `/signup` redirect to `/dashboard`. Generic login errors (no email enumeration), httpOnly sameSite cookies, rate limits, CSRF protection, password reset. No guest mode.

### F2: HOME = DASHBOARD + PROJECT HISTORY
Signed-in dashboard showing live stats scoped to user (total projects, drafts, verified, exported, versions, form submissions, unverified claims). Searchable/filterable/sortable project history with thumbnails, status badges, version counts, last edited. Actions: open, rename, duplicate, export, trash/restore, delete with confirmation modal. Recent activity feed, insights analytics, skeleton loading states.

### F3: GENERATION PIPELINE (/api/generate)
Guided intake (text + optional voice via Web Speech API, Telugu/Hindi/English) -> search-query planning -> web research (Tavily, DDG fallback) -> optional competitor gap analysis -> SiteSpec JSON generation (zod-validated, retry up to 2x with errors) -> evidence pass (every factual claim gets source URL or unverified flag; never invent testimonials, stats, prices) -> render -> security report -> SEO/accessibility audit -> Verified Working crawl -> approval gate -> preview.

### F4: SITESPEC + FIXED RENDERER
LLM outputs structured SiteSpec JSON. Fixed renderer outputs multi-page static HTML/CSS/JS with fully working components: navbar (mobile menu), hero, features, about, team, stats, timeline, grids with filter/search/sort, product pages, working cart + validated checkout (labeled demo), booking, contact form, pricing toggle, FAQ, tabs, modal, gallery lightbox, testimonials, newsletter, blog pages, login demo, 404, dark/light toggle, language switcher. Student components: summary, glossary, flashcards, quiz, timeline, concept map, bibliography (APA/MLA/IEEE/Harvard), print CSS. Renderer fails build if any link, button, or form has no working target.

### F5: VERIFIED WORKING CRAWLER
Automated headless crawl of every page at 375px and 1280px: loads, no console errors, links resolve, buttons/modals/tabs/accordions/filters work, forms tested with valid and invalid data, cart/booking/quiz/flashcard flows. Detailed report with per-page results and failure screenshots; auto-repair up to 2 loops.

### F6: TEMPLATES
12+ distinct starters with unique URLs (`/templates/[slug]`) surviving refresh. "Use this template" pre-fills the builder.

### F7: VISUAL EDITOR + PREVIEW EDITING (/projects/[id]/preview and /edit)
Interact and Edit modes; sandboxed iframe with postMessage bridge (strict origin + schema checks, bridge script never exported); hover/select, floating toolbar; inline text editing; schema-driven Inspector (Content, Style, Layout, AI, Info); token-based styling only (no raw CSS); asset manager with validated uploads and required alt text; sanitized rich text; section library with live thumbnails and variants; drag-and-drop and keyboard reorder; outline pane; repeatable item lists; page add/rename/delete with broken-link finder; global theme/nav/footer/SEO editing with affected-pages preview; responsive overrides; command stack with undo/redo; debounced autosave with draft recovery; optimistic concurrency with a two-tab conflict dialog; versions with visual and field compare, restore, branch, plain-language changelog; per-section hashes proving unrelated sections stay byte-identical; instant per-section live patching.

### F8: AI EDITING
Scope selector (section / page / site) with @mentions; quick actions (rewrite, shorter, longer, tone, grammar, simplify, translate, SEO, accessibility, alt text, variations); add-section-with-AI; typed operations or RFC 6902 patches, zod-validated, restricted to scope, rejected on locked sections or pinned fields (manual edits auto-pin; unpin allowed); suggestion mode with per-field diff, Accept all/selected, Reject, Regenerate, 3-variation picker; one undoable step per accepted proposal; streaming progress and Cancel with no partial changes; merge/discard/regenerate when user edits target section during AI run; per-project chat memory.

### F9: KNOWLEDGE LIBRARY (Student Speciality)
Per-project and account library; upload PDF, DOCX, TXT, MD, HTML, PPTX, images (OCR), URLs, pasted text; magic-byte file checks; size/quota limits (10-15 MB per file, 20 files per project default); async ingestion (extract -> clean -> chunk with page anchors -> local embeddings -> hybrid vector + BM25 index -> summary, key terms, tags, citation metadata); duplicate detection; delete cascades and flags citing sections "Source removed - review". Strict grounding mode (default): facts only from retrieved chunks, every claim stores source and page anchor; if unsupported respond "Not found in your sources", never invent; optional web research toggle. Citation UI [1][2] with hover snippet and click-through to exact page; "Verify claim" (Supported / Partial / Not supported); find supporting/conflicting evidence; fact-check section. Study generator: summary, flashcards, quiz, glossary, timeline with citations. Quote limits and attribution enforced by copy-ratio check; private by default with RLS.

### F10: DESIGN SYSTEM
Material Design 3 (default) with optional Fluent 2 skin using design language only (no Google/Microsoft logos/proprietary fonts; self-hosted Roboto/Inter). Tokens for color roles (light/dark/system), type scale, shape, elevation, spacing, motion; adaptive layouts; Google-account-style two-step login card; Drive-style dashboard; WCAG 2.2 AA; `/design-system` showcase page.

### F11: EXPORT AND PORTABILITY
ZIP with static site, editable spec.json (re-importable), SEO files (sitemap, robots, JSON-LD), reports, README with free-hosting guides (GitHub Pages, Netlify, Cloudflare Pages). Export blocked until human approval checklist complete. Exports contain no editor bridge, no private files, no external scripts.

### F12: INDIA-FIRST AND MULTILINGUAL
English/Telugu/Hindi string tables, language switcher, INR formatting, WhatsApp/UPI buttons, GST fields where relevant.

### F13: INSIGHTS
Time to make a change, AI proposals accepted vs rejected, unintended section changes (must be 0), claims cited %, unsupported claims flagged/resolved, verification pass rate.
