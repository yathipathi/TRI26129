# SiteForge Visual Editor Technical Specification

## Overview
The **SiteForge Visual Editor** operates exclusively on `SiteSpec` structured data (validated via Zod schemas). It provides a 3-pane responsive editing environment (`/projects/[id]/edit`) where manual schema-driven modifications and AI-assisted proposals work safely together.

---

## 1. Section Type Registry & Catalog
All section types are registered in `src/lib/section-registry.ts` with categories, style variants, default properties, and schema field descriptors.

| Section Type | Category | Supported Style Variants | Key Schema Fields |
| :--- | :--- | :--- | :--- |
| `hero` | Hero & Intro | `minimal-brutalist`, `split-media`, `centered-badge` | `badge`, `title`, `subtitle`, `ctaPrimaryText`, `ctaPrimaryLink`, `ctaSecondaryText`, `ctaSecondaryLink` |
| `features` | Content & Features | `grid-cards`, `numbered-list` | `badge`, `title`, `subtitle`, `items` (repeatable array: `title`, `description`) |
| `pricing` | Commerce & Services | `3-tier-popular`, `horizontal-table` | `badge`, `title`, `subtitle`, `items` (repeatable array: `title`, `price`, `period`, `badge`, `description`) |
| `testimonials` | Social Proof & Media | `quote-cards` | `badge`, `title`, `subtitle`, `items` (repeatable array: `quote`, `author`, `role`) |
| `faq` | Content & Features | `accordion-bordered` | `badge`, `title`, `subtitle`, `items` (repeatable array: `question`, `answer`) |
| `contact` | Forms & Contact | `boxed-card` | `badge`, `title`, `subtitle`, `ctaText` |

---

## 2. Field Widget Catalog & UI Inspector
The Right Pane Inspector (`src/components/editor/EditorRightPane.tsx`) automatically generates input forms from Zod schema metadata:

- **Text**: Single-line input with length validation.
- **Textarea**: Multi-line text for subtitles, descriptions, and quotes.
- **Link Picker**: Validates internal page references (`index.html`, `about.html`), section anchors (`#pricing`), external URLs (`https://`), `mailto:`, `tel:`, and direct WhatsApp links.
- **Image Picker**: Client & server validated file upload (`/api/projects/[id]/assets`) with size cap (5 MB), allowed MIME types (PNG, JPEG, WebP, SVG), and REQUIRED alt text.
- **Color Picker**: Theme palette tokens (`primary`, `secondary`, `accent`) and custom hex values with contrast warnings.
- **Repeatable List Widget**: Add, remove, duplicate, and reorder list items (features, plans, FAQs) with min/max item count validation.
- **Pinned Field Toggle**: Small pin icon next to every field; manual edits pin the field to protect it against AI overwrite.

---

## 3. Editor Command Stack & Operation Types
All state mutations are encapsulated in command objects supporting unlimited Undo/Redo (`Ctrl+Z`, `Ctrl+Shift+Z`):

```ts
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
```

---

## 4. AI Proposal Contract & Pinned Field Rules
- **Scope Selector**: Requests are scoped to `'section'`, `'page'`, or `'site'`.
- **JSON Output Contract**: The LLM returns structured JSON proposals (never raw HTML/JS).
- **Pinned Field Protection**: Any field edited manually by the user receives a `pinned` attribute. AI updates skip pinned fields unless the user explicitly enables overwrite.
- **Proposal Review Modal**: All AI results render a before/after diff summary with **Accept All**, **Accept Selected**, and **Reject** buttons before applying.
