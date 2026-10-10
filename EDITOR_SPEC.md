# SiteForge Professional Visual Editor Specification (`EDITOR_SPEC.md`)

## Overview
The SiteForge Visual Editor (`/projects/[id]/preview`) is a professional-grade visual editor designed for creating, editing, and fact-checking multi-page web applications. Operating strictly on structured `SiteSpec` data (never raw unmaintainable HTML), it combines live canvas interaction, granular manual section control, and source-grounded AI editing.

---

## 1. Core Architecture & Sandboxed Canvas

- **Route**: `/projects/[id]/preview` (Auth required, ownership verified).
- **Sandboxed Canvas**: Renders the site inside an `<iframe>` configured with `sandbox="allow-scripts allow-forms allow-popups"` (strictly excluding `allow-same-origin`).
- **Bridge Script Overlay**: Lightweight script ([preview-bridge.ts](file:///c:/Users/YATHIPATHI%20SATHYA/Downloads/HACTHON_KITSW/src/lib/preview-bridge.ts)) injected into the canvas in Edit Mode to handle postMessage IPC, hover outlines, click selection, and double-click inline text editing.
- **Per-Section DOM Patching**: `/api/projects/[id]/render-section` renders raw HTML for individual sections to patch the iframe DOM instantly without reloading.

---

## 2. Operation Types & RFC 6902 JSON Patches

All edits produce typed operations:

| Operation Type | Target Scope | Description |
| :--- | :--- | :--- |
| `add_section` | `page` / `site` | Inserts a new section from library or AI at a specified index. |
| `update_props` | `section` | Updates content, layout, style, or items of a single target section. |
| `remove_section` | `page` | Deletes a section with undo toast recovery. |
| `move_section` | `page` | Swaps section order up or down. |
| `update_theme` | `site` | Updates global Material 3 / Fluent 2 design tokens across all pages. |
| `update_page` | `page` | Updates page slug, name, title, or SEO metadata. |

---

## 3. Pinned Fields & Section Locking Mechanics

1. **Section Locking (`isLocked: true`)**:
   - When a section is locked by the user, all manual, AI quick actions, and page-wide prompts are rejected both on the client and server (`400 Bad Request`).
2. **Auto-Pinning on Manual Edits (`pinnedFields`)**:
   - Any property edited manually by hand is automatically appended to `section.pinnedFields`.
   - AI operations skip modifying `pinnedFields` unless the user explicitly toggles *"Allow AI to change my manual edits"* for that request.
   - Skipped pinned fields are logged and presented in the proposal review modal.

---

## 4. Zero-Collateral Byte Hash Verification

- Before and after every section mutation, SHA-256 byte hashes are computed for every section (`computeSectionHash`).
- `assertZeroCollateralDamage` verifies that every non-target section remains 100% byte-identical.
- Violations are logged and flagged; valid edits display a green confirmation badge:
  > *"Only this section changed (Byte-identical zero-collateral proof verified)"*

---

## 5. Security, Asset Manager & Link Rules

- **Asset Manager**: Image uploads require magic byte validation (`PNG`, `JPG`, `WEBP`, `GIF`, `SVG`), 10 MB size caps, metadata stripping, and **REQUIRED accessible alt text** (or explicit decorative marking).
- **SSRF Safety**: External image URLs fetched via `/api/assets/rehost` block private/loopback IP address ranges (`127.0.0.1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `localhost`).
- **Link Sanitizer**: `sanitizeLinkUrl` enforces safe protocols (`https:`, `http:`, `tel:`, `mailto:`, `https://wa.me/`, `#`) and strictly blocks dangerous `javascript:` or `data:` schemes.

---

## 6. Versioning, Autosave & Concurrency

- **Debounced Autosave**: Draft edits autosave to DB every 1.5 seconds with incremental revision numbers.
- **Optimistic Concurrency (409 Conflict)**: If multiple tabs/sessions edit the same project, the server detects revision mismatches and presents a conflict resolution modal (**Reload**, **Merge**, **Overwrite**).
- **Auto-Checkpointing**: Version checkpoints are created automatically upon accepting AI proposals, adding/removing sections, performing page operations, or exporting.
- **Version Timeline Comparison**: Compare any two versions visually and via field-level property diffs (`/api/projects/[id]/versions/compare`).
