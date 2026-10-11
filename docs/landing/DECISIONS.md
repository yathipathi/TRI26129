# Landing Page Architectural Decisions & Technical Budgets (`DECISIONS.md`)

This document outlines the architectural decisions, design tokens, performance budgets, accessibility rules, and routing configurations for the SiteForge public landing page.

---

## 1. Routing & Access Control
- **Public Landing Page Route**: Statically rendered at `/` for unauthenticated visitors.
- **Signed-In Redirect**: Authenticated visitors navigating to `/` are automatically redirected to `/dashboard`.
- **Dashboard Relocation**: The project workspace dashboard is hosted at `/dashboard`.
- **Public Allowlist in Middleware**:
  - `/` (landing page only for unauthenticated users)
  - `/login` & `/signup`
  - `/privacy`
  - `/terms`
  - `/academic-integrity`
  - `/contact`
  - `/templates`
  - `/builder`
  - `/preview`
  - `/review`
  - `/projects`

---

## 2. Technical Performance Budgets (Lighthouse Mobile)
- **Performance Score**: >= 90
- **Accessibility Score**: >= 98
- **Best Practices Score**: >= 95
- **SEO Score**: >= 95
- **Largest Contentful Paint (LCP)**: <= 2.5s
- **Cumulative Layout Shift (CLS)**: <= 0.05
- **Interaction to Next Paint (INP)**: <= 200ms
- **Total Landing Bundle JS**: <= 150 KB gzipped

---

## 3. Design System & Accessibility Rules
- **Spacing Grid**: Strict 4px/8px layout grid.
- **Color Palette**: Reuses existing Google Material 3 / Fluent 2 design tokens (`bg-md-surface`, `text-md-on-surface`, `bg-md-primary`).
- **Typography Scale**: Maximum two font families (Inter / system-ui sans-serif and monospace code font).
- **Contrast**: Minimum 4.5:1 WCAG 2.2 AA contrast ratio in both Light and Dark theme modes.
- **Motion**: Scroll animations governed by `IntersectionObserver` and respects `prefers-reduced-motion`.
