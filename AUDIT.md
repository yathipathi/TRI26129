# SiteForge Visual Editor Audit

This document audits the current implementation of the SiteForge Visual Editor (`/projects/[id]/preview`) against all required professional-grade editor capabilities.

---

## Audit Matrix

| Feature / Capability | Status | File Path(s) | Implementation Notes & Deficiencies |
| :--- | :--- | :--- | :--- |
| **Interact / Edit Mode Switcher** | **Done** | `src/app/projects/[id]/preview/page.tsx` | Mode toggle switches live canvas interaction vs editor overlays. |
| **Sandboxed Iframe & Bridge Script** | **Done** | `src/lib/preview-bridge.ts`, `src/app/projects/[id]/preview/page.tsx` | Sandboxed `iframe` with `postMessage` IPC, hover outlines, click-select, double-click inline text editing. |
| **Floating Section Toolbar** | **Done** | `src/app/projects/[id]/preview/page.tsx` | Move Up/Down, Duplicate, Lock, Hide, AI Edit, Delete. |
| **Inspector Pane Tabs** | **Done** | `src/app/projects/[id]/preview/page.tsx` | Content, Style, Layout, AI, Info/Pinned tabs. |
| **Instant Per-Section DOM Patching** | **Done** | `src/app/api/projects/[id]/render-section/route.ts` | Renders individual section HTML for instant iframe DOM patching. |
| **AI Proposal Diff Review** | **Done** | `src/app/projects/[id]/preview/page.tsx` | Proposal modal showing before/after diffs with Apply/Discard. |
| **In-Memory Command Stack** | **Done** | `src/app/projects/[id]/preview/page.tsx` | Basic undo/redo command stack in memory. |
| **RAG Grounding & Citations** | **Done** | `src/lib/rag.ts`, `src/app/api/ai/edit/route.ts` | Grounded edits with inline citations (`[1]`, `[2]`). |
| **Token-Based Style Controls** | **Missing** | `src/app/projects/[id]/preview/page.tsx` | Needs removal of free-form CSS in favor of palette roles, spacing, radius, elevation, typography, & CSS property allowlist. |
| **Asset Manager for Images** | **Missing** | `src/components/library/AssetManagerModal.tsx` | Needs file upload, magic-byte check, size cap, metadata stripping, project asset picker, free placeholders, SSRF-validated re-hosting, & required alt text. |
| **Rich Text Editor & Link Sanitization** | **Missing** | `src/components/ui/RichTextEditor.tsx` | Needs restricted formatting (bold/italic/link/list) via safe AST, input/render sanitization, & link protocol validation (block `javascript:`). |
| **Auto-Pinning on Manual Edits** | **Partial** | `src/app/api/ai/edit/route.ts`, `src/app/projects/[id]/preview/page.tsx` | Manual edits must auto-pin fields, show pin icons, unpin toggle, "Allow AI to change manual edits" switch, & notice of skipped fields. |
| **Server-Side Enforcement & Ownership** | **Partial** | `src/app/api/projects/[id]/draft/route.ts` | API must re-validate full SiteSpec with Zod and strictly enforce locks, pins, and ownership (404/403). |
| **Zero-Collateral Byte Hash Proof** | **Missing** | `src/lib/verifier.ts`, `src/app/api/ai/edit/route.ts` | Compute section hash before/after edit, assert non-target sections byte-identical, log violations, show green confirmation. |
| **Debounced Autosave & Draft Recovery** | **Partial** | `src/app/projects/[id]/preview/page.tsx` | Needs 1.5s debounced autosave, revision tracking, "Saved / Saving... / Offline" indicator, and draft recovery on refresh/crash. |
| **Optimistic Concurrency & Conflict Dialog** | **Missing** | `src/app/api/projects/[id]/draft/route.ts` | Detect multi-tab/session editing conflicts and present Reload / Merge / Overwrite options. |
| **Auto-Checkpointing & Version Timeline** | **Partial** | `src/lib/db.ts`, `src/app/projects/[id]/preview/page.tsx` | Auto-checkpoint after AI accept, section add/remove, page ops, export; version timeline with visual side-by-side & field diff. |
| **Unsaved Changes Navigation Warning** | **Missing** | `src/app/projects/[id]/preview/page.tsx` | `beforeunload` handler when unsaved draft edits exist. |
| **Drag-and-Drop Reordering (Canvas & Outline)** | **Missing** | `src/components/editor/OutlinePane.tsx` | `dnd-kit` drag-and-drop reordering with keyboard navigation & ARIA live announcements. |
| **Categorized Section Library with Variants** | **Partial** | `src/app/projects/[id]/preview/page.tsx` | Searchable, categorized section library with live thumbnails, 2-4 variants per type, "+" insertion points, and "Describe section with AI". |
| **Outline Pane Context Menu & Toast** | **Partial** | `src/components/editor/OutlinePane.tsx` | Section list with visibility toggle, lock, drag handle, context menu (rename, duplicate, move to page, delete with Undo toast). |
| **Page Management & Broken-Link Finder** | **Partial** | `src/app/projects/[id]/preview/page.tsx` | Add/rename/duplicate/delete pages, slug/SEO editing, and broken-link finder when pages are renamed or removed. |
| **Inspector Repeatable Item List Controls** | **Partial** | `src/app/projects/[id]/preview/page.tsx` | Add/remove/duplicate/drag-reorder items (features, FAQs, team) with min/max validation & inline error hints. |
| **Global Settings Panel** | **Partial** | `src/components/settings/SettingsModal.tsx` | Theme tokens, fonts, logo, navbar links, footer, site name, languages, SEO defaults with affected-page preview. |
| **Responsive Controls per Section** | **Partial** | `src/app/projects/[id]/preview/page.tsx` | Per-section hide on mobile/tablet, stack order, and true-width device preview toggle (desktop 1280px, tablet 768px, mobile 375px). |
| **Structured Link Picker** | **Missing** | `src/components/editor/LinkPickerModal.tsx` | Link picker supporting internal pages, anchors, external URLs, tel:, mailto:, WhatsApp with validation. |
| **AI Scope Selector & @Mentions** | **Partial** | `src/app/api/ai/edit/route.ts` | Scope selector (section/page/site) with `@mentions` (e.g. "make @Pricing match @Features"). |
| **Typed RFC 6902 / Zod AI Contract** | **Partial** | `src/app/api/ai/edit/route.ts` | RFC 6902 JSON patch contract, Zod validation, retry up to 2x, blocking raw HTML/JS. |
| **Proposal Review Upgrade (Checkbox/Variations)** | **Partial** | `src/app/projects/[id]/preview/page.tsx` | Per-field checkboxes (Accept selected), Accept all, Reject, Regenerate, and 3-variation picker. |
| **Streaming Progress & Cancellation** | **Missing** | `src/app/projects/[id]/preview/page.tsx` | "Understanding -> Researching -> Drafting -> Validating" progress bar with Cancel button. |
| **Concurrent AI & Manual Edit Conflict** | **Missing** | `src/app/projects/[id]/preview/page.tsx` | Detect manual section edit during AI execution with Merge / Discard / Regenerate options. |
| **Per-Project AI Chat Memory** | **Partial** | `src/lib/db.ts` | DB-backed chat memory linking each turn to produced versions for multi-turn follow-ups. |
| **Add-Section-with-AI & Customization Limit** | **Partial** | `src/app/api/ai/section/route.ts` | Best variant selection, position insertion, and "Customization limit" notice. |
| **Extra AI Quick Actions** | **Partial** | `src/app/api/ai/quick-action/route.ts` | Simplify for beginners, Add examples, Add more items, Match brand voice, Explain simply, Suggest image alt text, Improve accessibility. |
| **Prompt-Injection Hardening & Rate-Limiting** | **Partial** | `src/lib/ingestion-pipeline.ts` | Untrusted input wrapping, script/handler/hidden text stripping, user rate-limiting, Groq rate-limit message + OpenRouter fallback. |
| **In-Editor Claim Verification Tools** | **Partial** | `src/app/api/ai/verify-claim/route.ts` | "Verify claim", "Find supporting evidence", "Find conflicting evidence", "Fact-check section" with clickable citations. |
| **Deleted Source Review Flag & Export Block** | **Partial** | `src/lib/db.ts` | Flag sections as "Source removed - review" and block export until resolved. |
| **Post-Edit Quality Gate Audits** | **Partial** | `src/lib/verifier.ts` | Re-render affected pages, re-run evidence pass, SEO/A11y/Verified Working crawl deltas ("+2 fixed, 1 warning"), human approval checklist. |
| **Edit-Time Inspector Hints** | **Missing** | `src/components/editor/InspectorPane.tsx` | Real-time warnings: low contrast, missing alt text, long headings, reading level, duplicate headings, broken links. |
| **Copy-Ratio Check Against Sources** | **Missing** | `src/lib/rag.ts` | Enforce quote ratio limits and attribution on published pages. |
| **Command Palette & Keyboard Shortcuts Sheet** | **Missing** | `src/components/editor/CommandPalette.tsx` | Ctrl/Cmd+K command palette, shortcuts sheet (`?`), section/outline context menus, status bar. |
| **Editor Accessibility & ARIA Announcements** | **Partial** | `src/app/projects/[id]/preview/page.tsx` | Keyboard path, visible focus, ARIA live announcements, WCAG 2.2 AA contrast, reduced-motion support. |
| **Shareable Reviewer Mode & Comments** | **Missing** | `src/app/api/review/route.ts`, `src/app/review/[token]/page.tsx` | Tokenized read-only preview URL, section-pinned comments, owner resolution panel. |
| **Reusable Blocks & Templates** | **Missing** | `src/lib/db.ts` | "Save section as block" & "Save project as template" private user library. |
| **Mobile Editor Touch-Optimized UX** | **Partial** | `src/app/projects/[id]/preview/page.tsx` | Bottom-sheet inspector, simplified outline, 48px touch targets on 375px mobile viewport. |
| **Editor Performance & Quality Insights** | **Partial** | `src/lib/db.ts` | Track edit time, proposals accepted vs rejected, 0 unintended changes, validation failures, % cited, pass rate. |
| **Documentation & Acceptance Test Suite** | **Partial** | `EDITOR_SPEC.md`, `EDITOR_REPORT.md` | Complete specification document, shortcuts guide, and 27 acceptance test verification report. |

---

## Execution Plan (Milestones R1 - R7)

1. **Milestone R1**: Safety & Correctness Fixes (Token style controls, Asset Manager, Rich text editor, Auto-pinning, Server-side enforcement, Zero-collateral hash proof).
2. **Milestone R2**: Persistence & Versioning (Debounced autosave, Optimistic concurrency, Version timeline & visual diff, Unsaved changes warning).
3. **Milestone R3**: Section & Page Operations (Drag-and-drop reorder, Section Library upgrade, Outline pane context menu, Page management & broken-link finder, Repeatable item list controls, Global settings panel, Responsive controls, Structured Link Picker).
4. **Milestone R4**: AI Editing Upgrade (Scope & @mentions, Typed RFC 6902 Zod contract, Proposal review checkboxes & variations, Streaming progress, Concurrent AI/manual conflict, AI chat memory, Add-section-with-AI, Extra quick actions, Prompt-injection hardening & rate limits).
5. **Milestone R5**: Grounding & Quality Gates (In-editor claim tools, Deleted source review flags, Post-edit quality gate audit deltas, Inspector hints, Copy-ratio check).
6. **Milestone R6**: Professional UX & Collaboration (Command palette & shortcuts, Editor accessibility & ARIA live, Tokenized Review Mode & comments, Reusable blocks & templates, Mobile bottom-sheet UX).
7. **Milestone R7**: Insights, Documentation & Acceptance Test Suite (Editor metrics in Insights, `EDITOR_SPEC.md`, 27 Acceptance tests run, `EDITOR_REPORT.md`).
