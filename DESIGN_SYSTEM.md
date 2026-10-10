# SiteForge Design System Specification

## Overview
SiteForge incorporates a token-driven UI design architecture supporting **Google Material Design 3 (M3)** as the default aesthetic skin, with a toggleable **Microsoft Fluent 2** skin available via Workspace Settings (`/settings`) and the Design System Showcase (`/design-system`).

---

## 1. Design Tokens Architecture

Design tokens are defined as CSS custom variables in `src/app/globals.css` and mapped into Tailwind CSS theme extensions (`tailwind.config.ts`).

### Color System Roles (Material 3)
| Token Role | Light Mode Value | Dark Mode Value | Purpose |
|---|---|---|---|
| `primary` | `#0b57d0` | `#a8c7fa` | Primary brand actions, active state fills |
| `on-primary` | `#ffffff` | `#062e6f` | Text/icon on primary fill |
| `primary-container` | `#d3e3fd` | `#0842a0` | Tonal highlights & FAB containers |
| `on-primary-container` | `#041e49` | `#d3e3fd` | Text on primary container |
| `secondary` | `#00639b` | `#7fcfff` | Secondary chips, badges, control fills |
| `secondary-container` | `#c2e7ff` | `#004d73` | Tonal navigation rail active item fills |
| `surface` | `#ffffff` | `#111318` | Base cards, dialogs, modals |
| `surface-container-low` | `#f0f4f9` | `#1a1c22` | Workspace background |
| `surface-container` | `#e9eef6` | `#1e2026` | Card fills, toolbars, sidebar drawers |
| `surface-container-high` | `#e1e8f5` | `#282a31` | Inputs, dropdown menus |
| `outline` | `#747775` | `#8e9099` | Text field outlines, prominent dividers |
| `outline-variant` | `#c4c7c5` | `#444746` | Subtle dividers, card borders |

### Color Overrides for Fluent 2 Skin (`data-skin="fluent2"`)
- **Primary Color:** `#0078d4` (Microsoft Blue)
- **Primary Container:** `#eff6fc` (Light) / `#003866` (Dark)
- **Shape Corner Radius:** Scaled down to `4px` (`rounded-md-sm`) for compact, high-density desktop productivity.

---

## 2. Shape Radius Scale
- `none`: 0px
- `xs`: 4px (Inputs, dropdowns, Fluent shapes)
- `sm`: 8px (Small cards, filter chips)
- `md`: 12px (Standard cards)
- `lg`: 16px (Medium dialogs)
- `xl`: 28px (Material 3 large containers, floating action surfaces)
- `full`: 9999px (Pill buttons, badges, avatar rings)

---

## 3. Elevation & Shadows
- **Elevation 1:** `0px 1px 3px 1px rgba(0,0,0,0.15), 0px 1px 2px 0px rgba(0,0,0,0.3)`
- **Elevation 2:** `0px 2px 6px 2px rgba(0,0,0,0.15), 0px 1px 2px 0px rgba(0,0,0,0.3)`
- **Elevation 3 (FAB / Floating):** `0px 4px 8px 3px rgba(0,0,0,0.15)`
- **Elevation 4 (Dialogs / Modals):** `0px 6px 10px 4px rgba(0,0,0,0.15)`

---

## 4. Reusable Primitives (`src/components/ui/index.tsx`)
1. **Button**: Supports `filled`, `tonal`, `outlined`, `ghost`, `fab` variants with M3 pill corners and state layers.
2. **Card**: Tonal surface background with subtle `outline-variant` border and elevation hover animations.
3. **Badge & Chip**: Pill containers for status indicators and filter controls.
4. **Input & TextField**: Floating label text fields with primary outline focus rings.
5. **Tabs**: Segmented control bar with active indicator sliding transition.
6. **Dialog**: Accessible modal dialog with 28px rounded corners and dark backdrop blur.
7. **Switch**: M3 toggle switch with sliding thumb.
8. **LinearProgress**: Continuous progress bar for AI pipeline execution feedback.
9. **Snackbar**: Floating notification toast at bottom center.

---

## 5. Accessibility & Contrast (WCAG 2.2 AA)
- All text pairs (`on-primary` on `primary`, `on-surface` on `surface`, `on-surface-variant` on `surface-container`) meet or exceed contrast ratio **4.5:1** for standard text and **3.0:1** for large text/icons.
- Interactive elements feature minimum touch targets of **44px × 44px** on mobile viewports.
