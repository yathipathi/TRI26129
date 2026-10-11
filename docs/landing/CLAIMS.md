# SiteForge Public Landing Page Claims & Verification Audit (`CLAIMS.md`)

This document verifies every marketing claim made on the SiteForge public landing page against actual codebase implementations, test suites, and empirical verification artifacts.

---

## Verified Claims Matrix

| # | Marketing Claim | Status | Codebase Evidence & File Path | Empirical Verification / Test |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Web Research Engine** | **Yes** | `src/lib/search.ts`, `src/lib/rag.ts` | Primary Tavily API free search with DuckDuckGo fallback scraper; grounds generated specs. |
| **2** | **Validated Structured Spec** | **Yes** | `src/lib/zod-schema.ts`, `src/types/index.ts` | Strict Zod validation on `SiteSpec` & `PageSpec` before rendering; prevents malformed ASTs. |
| **3** | **Fixed Multi-Page Renderer** | **Yes** | `src/lib/code-generator.ts`, `src/lib/section-registry.ts` | Compiles `index.html`, `menu.html`, `about.html`, `contact.html` with Tailwind & responsive JS. |
| **4** | **Automated Playwright Crawl Verification** | **Yes** | `src/lib/verifier.ts` | Crawls links, buttons, CTAs, forms, and contrast; outputs pass/fail report & screenshot diffs. |
| **5** | **Granular Section Editing & Locking** | **Yes** | `src/app/projects/[id]/edit/page.tsx`, `src/lib/db.ts` | Point-and-click Inspector; `isLocked` locks sections; `pinnedFields` auto-pins manual hand edits. |
| **6** | **SHA-256 Zero-Collateral Hash Proof** | **Yes** | `src/lib/verifier.ts` | Computes SHA-256 section hashes before/after edit; asserts non-target sections remain byte-identical. |
| **7** | **Grounded Evidence & Source Citations** | **Yes** | `src/app/projects/[id]/sources/page.tsx`, `src/lib/rag.ts` | Links claim fields to uploaded PDFs/notes; flags deleted sources as "Source removed - review". |
| **8** | **5-Step Human Approval Gate before Export** | **Yes** | `src/components/validation/HumanValidationModal.tsx` | Gates 1-click ZIP export until evidence flags, broken links, and audit items pass review. |
| **9** | **Knowledge Library for Students** | **Yes** | `src/lib/ingestion-pipeline.ts`, `src/app/api/sources/route.ts` | File ingestion (PDF, DOCX, TXT, MD); chunks text, extracts key terms, and generates citations. |
| **10** | **Multi-Language Support (EN, TE, HI)** | **Yes** | `src/app/projects/[id]/edit/page.tsx`, `src/components/sections/DynamicSectionRenderer.tsx` | Instant site translation engine for English, Telugu (తెలుగు), and Hindi (हिन्दी). |
| **11** | **No Lock-in 1-Click ZIP Export** | **Yes** | `src/app/api/download/[siteId]/route.ts` | Exports clean, offline-ready HTML, CSS, JS, and JSON `spec.json` package. |
| **12** | **Project History & Version Rollback** | **Yes** | `src/lib/db.ts`, `src/app/projects/[id]/preview/page.tsx` | 1.5s debounced autosave, version timeline comparison, field diffs, and 1-click restore. |
| **13** | **Security Scanner & Escaping** | **Yes** | `src/lib/security-scanner.ts` | Strips script tags, unsafe handlers (`onerror`), blocks `javascript:` schemes, enforces CSP. |

---

## Forbidden Terms & Honest Safeguards
* **Forbidden Terms Filtered**: Never uses terms like "100%", "unhackable", "perfect", "bulletproof", "#1", or invented stats.
* **Exact Check Reporting**: Every check reports exact items run (e.g. "Playwright 375px/1280px link crawl verified").
* **Roadmap Disclosures**: Clearly states current limitations (e.g., component library constraints, external API rate limits).
