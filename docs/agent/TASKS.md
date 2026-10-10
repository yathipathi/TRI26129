# Master Task Checklist (`TASKS.md`)

## Phase 0: Audit and Setup
- [x] Audit codebase against F1-F13 requirements `[Done]`
- [x] Configure LLM integration with Gemini API (gemini-2.0-flash) as primary provider `[Done]`
- [x] Populate agent memory files in `/docs/agent/` `[Done]`
- [x] Verify build scripts, linting, and TypeScript compile `[Done]`

## Phase 1: Foundation (Auth Gate & Repositories)
- [x] F1 Auth gate middleware & session JWT verification `[Done]`
- [x] Repositories pattern in `src/lib/db.ts` with SQLite fallback `[Done]`
- [x] Material 3 & Fluent 2 design token provider `[Done]`

## Phase 2: Core Product & Renderer
- [x] F4 SiteSpec schema & fixed section renderer `[Done]`
- [x] F6 Starter templates (12+ distinct starters) `[Done]`
- [x] Student components (flashcards, quiz, glossary, timeline, concept map, bibliography) `[Done]`

## Phase 3: Generation Pipeline
- [x] F3 Guided intake, web research (Tavily/DDG), competitor analysis `[Done]`
- [x] F12 Multilingual (English, Telugu, Hindi) and India-first INR formatting `[Done]`
- [x] Evidence pass with factual source tracking `[Done]`

## Phase 4: Verification, Audits & Export
- [x] F5 Verification Crawler & 0 dead link assurance `[Done]`
- [x] F11 ZIP export with offline static files & human approval checklist `[Done]`

## Phase 5: Dashboard & History
- [x] F2 Dashboard with user stats, project history, duplicate/rename/trash `[Done]`
- [x] F13 Insights metrics (time to change, AI proposal acceptance %, 0 unintended changes) `[Done]`

## Phase 6: Visual Editor & Concurrency
- [x] F7 Sandboxed canvas iframe & postMessage bridge `[Done]`
- [x] F7 Asset Manager with magic byte checks & required alt text `[Done]`
- [x] F7 Optimistic concurrency 409 conflict dialog & 1.5s debounced autosave `[Done]`
- [x] F7 Zero-collateral byte hash proof `[Done]`

## Phase 7: AI Editing Upgrade
- [x] F8 Scope selector (section/page/site) & @mentions `[Done]`
- [x] F8 3-variation generator picker & proposal review modal `[Done]`
- [x] F8 Section locking & auto-pinning on manual edits `[Done]`

## Phase 8: Knowledge Library & RAG
- [x] F9 Multi-format ingestion (PDF, DOCX, TXT, MD, HTML, PPTX, Image OCR, URLs) `[Done]`
- [x] F9 BM25 + RAG strict grounding mode ("Not found in your sources") `[Done]`
- [x] F9 Claim verification & source removal review flags `[Done]`

## Phase 9: Design Polish & Showcase
- [x] F10 Design system showcase page (`/design-system`) `[Done]`
- [x] WCAG 2.2 AA accessibility audit & keyboard navigation `[Done]`

## Phase 10: Hardening & Release
- [x] Full acceptance test run & specification docs (`EDITOR_SPEC.md`, `KNOWLEDGE_LIBRARY_SPEC.md`, `REPORT.md`, `EDITOR_REPORT.md`) `[Done]`
