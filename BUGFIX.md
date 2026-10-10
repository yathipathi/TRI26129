# BUGFIX REPORT: Root Cause Analysis & Fix

## STEP 0 Audit Findings

### Problem Statement
Clicking template cards or navigating to dynamic site/template URLs (`/preview/[id]`, `/templates/[slug]`) was serving the exact same content regardless of the URL target.

### Root Cause Identification
**Selected Finding**: `b` - *The dynamic route (`/templates/[slug]` or `/preview/[id]`) never reads its route param.*

### Detailed Root Cause Analysis
In `src/app/preview/[id]/page.tsx`, the component ignored `params.id` from the Next.js router. Instead, it executed:
```typescript
const saved = localStorage.getItem('current_website_project');
if (saved) {
  setProject(JSON.parse(saved));
  return;
}
setProject(generateSmartWebsite('Live Public Production Preview'));
```
Because the dynamic parameter `id` was completely unread, every preview URL (`/preview/1`, `/preview/2`, `/preview/abc`) fell back to reading the single `current_website_project` key in `localStorage` or generating the same default project.

### Resolution & Architectural Fix
1. **Param Extraction**: Updated route handlers and page components (`/preview/[siteId]`, `/templates/[slug]`) to asynchronously unwrap and consume `params` (`use(params)` or `await params`).
2. **Distinct Site Storage & Retrieval**:
   - Templates load their unique metadata and site tree directly from `templates.json` or `templates/[slug]` data files by matching `params.slug`.
   - Generated sites are saved on disk under `/generated/{siteId}/` and retrieved dynamically via `/preview/{siteId}/index.html` or `/api/preview/{siteId}`.
3. **No Caching Header**: Set `Cache-Control: no-store, max-age=0` on preview and generation routes to ensure iframe previews are never cached or reused.
