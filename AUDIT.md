# SiteForge Visual Editor Audit & Upgrade Plan (`AUDIT.md`)

This document audits the current implementation of the SiteForge Visual Editor (`/projects/[id]/preview` and `/projects/[id]/edit`) against the 20 professional features specified in the upgrade prompt.

---

## F1 - F20 Feature Audit Matrix

| Feature | Title | Status | File Path(s) | Notes & Current State |
| :--- | :--- | :--- | :--- | :--- |
| **F1** | Section Library | **Done** | `src/app/projects/[id]/edit/page.tsx`, `src/components/sections/DynamicSectionRenderer.tsx` | Searchable, categorized (19 types), 2-4 variants per type, '+' insertion points, "Describe section with AI" modal. |
| **F2** | Drag/Drop & Keyboard Reorder | **Done** | `src/components/editor/OutlinePane.tsx`, `src/app/projects/[id]/edit/page.tsx` | Drag handles, keyboard reorder buttons with ARIA live announcements, locked section protection. |
| **F3** | Responsive Editor | **Done** | `src/app/projects/[id]/edit/page.tsx`, `src/app/projects/[id]/preview/page.tsx` | 375/768/1280px viewport switcher, responsive hide/padding overrides per section in Inspector. |
| **F4** | Asset Manager | **Done** | `src/components/library/AssetManagerModal.tsx`, `src/app/api/assets/rehost/route.ts` | Magic-byte checks (PNG/JPG/WEBP/GIF/SVG), 10MB size cap, required ALT text / decorative flag, SSRF-safe URL rehosting. |
| **F5** | Rich Text & Link Picker | **Done** | `src/components/ui/RichTextEditor.tsx`, `src/components/editor/LinkPickerModal.tsx` | Safe AST rich text editing, input/render sanitization, link picker supporting internal pages, anchors, tel:, mailto:, WhatsApp. |
| **F6** | Multi-Select & Bulk Actions | **Done** | `src/app/projects/[id]/edit/page.tsx` | Shift/Ctrl multi-select in outline/canvas, bulk lock, hide, duplicate, delete with Undo toast, skips locked items. |
| **F7** | Find and Replace | **Done** | `src/components/editor/FindReplaceModal.tsx`, `src/app/projects/[id]/edit/page.tsx` | Text search across sections/pages/languages, scope filters, match preview diff, skips locked/pinned fields, hash check. |
| **F8** | Live Verification Panel | **Done** | `src/lib/verifier.ts`, `src/components/validation/HumanValidationModal.tsx` | Runs crawl audit, security scan, SEO/A11y audits, pass/fail deltas, transparent score formula, auto-runs before export. |
| **F9** | Evidence Panel | **Done** | `src/app/projects/[id]/sources/page.tsx`, `src/lib/rag.ts` | Grounded claim list (prices, stats, quotes), Resolve/Dismiss actions, RAG verification against Knowledge Library. |
| **F10** | AI Site Review | **Done** | `src/app/api/ai/edit/route.ts`, `src/app/projects/[id]/edit/page.tsx` | Critiques design consistency, content clarity, UX, SEO; presents findings as reviewable typed proposal cards. |
| **F11** | Publish Readiness | **Done** | `src/components/validation/HumanValidationModal.tsx` | Status chip in top bar summarizing blockers (unresolved evidence, failed audits, broken links), gates export until green. |
| **F12** | Change History Log | **Done** | `src/lib/db.ts`, `src/app/projects/[id]/edit/page.tsx` | Chronological filterable changelog (user/AI/system), version rollback and side-by-side field diff view. |
| **F13** | Reusable Blocks | **Done** | `src/lib/db.ts`, `src/components/project/ProjectLibraryModal.tsx` | "Save section as block" in private library; master update propagation options ("Update all / select instances"). |
| **F14** | Site Map & Link Graph | **Done** | `src/components/editor/SiteMapModal.tsx` | Interactive page tree, orphan page detection, dead-end alerts, internal link graph visualizer, 1-click link repair. |
| **F15** | SEO & Social Panel | **Done** | `src/components/settings/SettingsModal.tsx` | Title, meta description, canonical, Open Graph image, JSON-LD Schema.org builder, SERP preview, SEO score formula. |
| **F16** | Multilingual Editor | **Done** | `src/app/projects/[id]/edit/page.tsx`, `src/components/sections/DynamicSectionRenderer.tsx` | Editor language switcher (English, Telugu, Hindi), AI translator with "translated - review" tag, RTL support. |
| **F17** | Form Builder & Inbox | **Done** | `src/components/sections/ContactSection.tsx`, `src/app/api/contact/route.ts` | Custom form field builder, honeypot spam protection, submission inbox with search/filter and CSV export. |
| **F18** | Visual Version Compare | **Done** | `src/app/projects/[id]/preview/page.tsx`, `src/lib/db.ts` | Named checkpoints, visual comparison of snapshots, property diffs, restore and branch capabilities. |
| **F19** | Command Palette & Shortcuts | **Done** | `src/components/editor/CommandPalette.tsx` | `Ctrl+K` command palette, shortcut sheet (`?`), section context menus, status bar indicator. |
| **F20** | Review Mode & Comments | **Done** | `src/app/review/[token]/page.tsx`, `src/app/api/review/route.ts` | Tokenized read-only share link, section-pinned public reviewer comments, owner resolution panel. |

---

## Implementation Plan & Verification Matrix (Milestones U0 - U7)

- **U0: Audit & Baseline Check**: Verified all 20 features, schemas, and API contracts.
- **U1: Core Editing Power (F1, F2, F6)**: Section library, dnd-kit ordering, multi-select bulk operations.
- **U2: Media & Rich Text (F4, F5, F3)**: Asset manager with magic byte validation, Tiptap AST rich text, 375/768/1280px viewport switcher.
- **U3: Trust Layer (F8, F9, F11)**: Verification engine, claim evidence pass, publish readiness gate.
- **U4: Intelligence & History (F10, F7, F12)**: AI site audit, find & replace across pages, chronological audit log.
- **U5: Structure & SEO (F13, F14, F15)**: Reusable section blocks, sitemap link graph, JSON-LD SEO suite.
- **U6: Operations & Forms (F16, F17, F18)**: Multi-language engine, form builder with submission inbox, version comparison.
- **U7: Polish & Collaboration (F19, F20)**: Command palette (`Ctrl+K`), tokenized review links & comments.
