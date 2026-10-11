# SiteForge AI Studio 🚀
### Autonomous Verified Web Engineering Platform & Academic Thesis Generator

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Playwright](https://img.shields.io/badge/Playwright-Verified-45ba4b?style=for-the-badge&logo=playwright)](https://playwright.dev/)
[![WCAG 2.2 AA](https://img.shields.io/badge/Accessibility-WCAG_2.2_AA-purple?style=for-the-badge)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 📌 Project Overview

**SiteForge AI** is an end-to-end autonomous web engineering studio that solves the core flaws of generic generative AI site builders (hallucinated claims, broken links, single-page vendor lock-in). Given a natural language prompt, SiteForge:
1. **Researches & Synthesizes**: Performs live web research (Tavily/RAG) and formulates a structured content brief.
2. **Generates Multi-Page Code**: Compiles semantic HTML5, responsive Tailwind CSS, and interactive client JavaScript tailored precisely to the user's prompt (e.g. real-time voting polls, artisanal bakeries, clinics, e-commerce stores).
3. **Validates with Headless Crawler**: Executes Playwright crawls to verify zero dead links, responsive breakpoints (375px to 1280px), and form targets before code delivery.
4. **Auto-Generates University Project Thesis**: Produces an A4-printable, university-compliant thesis report complete with Literature Survey, DFD Level 0/1, ER Diagrams, and UML Diagrams (Class, Use Case, Sequence, Activity).
5. **Zero Vendor Lock-In**: Delivers an offline-ready standalone ZIP package with 100% code ownership.

---

## 🎓 Academic Thesis & Deliverables Included

This repository includes full academic project documentation formatted according to **KITSW (Kamala Institute of Technology & Science)** B.Tech / M.Tech Major Project Thesis guidelines:

| Deliverable | Location in Repository | Description |
| :--- | :--- | :--- |
| **A4 Printable Thesis** | [`public/downloads/THESIS_PRINTABLE.html`](public/downloads/THESIS_PRINTABLE.html) | Single-sided A4 Times New Roman formatted printable thesis document. |
| **Thesis Report Markdown** | [`public/downloads/PROJECT_THESIS_REPORT.md`](public/downloads/PROJECT_THESIS_REPORT.md) | Structured Chapter 1 to 6 project report with Acknowledgements and Certificates. |
| **System Architecture & UML** | [`docs/FULL_PROJECT_DOCUMENTATION.md`](docs/FULL_PROJECT_DOCUMENTATION.md) | DFD 0/1, ER Diagram, UML Use Case, Class, Sequence & Activity diagrams. |
| **Executive PPTX Presentation** | [`public/downloads/SiteForge_Executive_Master_14_Slides.pptx`](public/downloads/SiteForge_Executive_Master_14_Slides.pptx) | 14-slide professional widescreen presentation with diagrams and metrics. |
| **Demo Video (2:20 min)** | [`public/downloads/SiteForge_Demo_Video_Perfect_2m20s.mp4`](public/downloads/SiteForge_Demo_Video_Perfect_2m20s.mp4) | High-definition self-recording demo video with AI voiceover narration. |

---

## 🏗️ High-Level System Architecture

```
                     +---------------------------------------+
                     |         User Natural Prompt           |
                     | ("generate a live poll application")  |
                     +-------------------+-------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |     Intake & Zod Schema Validator     |
                     +-------------------+-------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |    Web Retrieval & Research Engine    |
                     |         (Tavily / RAG Engine)         |
                     +-------------------+-------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |    Prompt-Driven Semantic Compiler    |
                     |   (HTML5, Tailwind, Interactive JS)   |
                     +-------------------+-------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |      Playwright Crawler Gate          |
                     |   (Dead-link & Contrast Verification) |
                     +-------------------+-------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |  Packaging & Academic Thesis Engine   |
                     |  - Multi-page HTML/CSS/JS             |
                     |  - A4 Printable Thesis HTML           |
                     |  - UML / ER / DFD Documentation       |
                     |  - Offline 1-Click ZIP Download       |
                     +---------------------------------------+
```

---

## ⚡ Key Modules & Features

### 1. Prompt-Driven Live Application Synthesis
- Supports custom requirements without template lock-in:
  - **Live Poll Application**: Real-time voting radio choices, animated percentage bars, live vote counter, and custom poll creation form.
  - **Artisanal Bakery & Cafe**: Daily hearth menu, organic bread cards with prices, and pickup order form.
  - **Healthcare & Clinic**: Doctor consultation booking, medical departments, and emergency triage hotline.
  - **E-Commerce Store**: Featured catalog drops, add-to-cart badges, and cart counter engine.

### 2. Automated Thesis Generator
- Adheres to standard engineering university thesis guidelines:
  - **Title Page & College Certificate**
  - **Acknowledgement & Abstract**
  - **List of Figures & List of Tables**
  - **Chapter 1**: Introduction, Existing System with Drawbacks, Proposed System with Features
  - **Chapter 2**: Literature Survey & Comparative Analysis
  - **Chapter 3**: Analysis (Hardware/Software, Functional & Non-Functional Requirements)
  - **Chapter 4**: Design (Block Diagram, DFD Level 0/1, ER Diagram, UML Diagrams, Data Dictionary)
  - **Chapter 5**: Implementation & Automated Verification
  - **Chapter 6**: Conclusion & Future Scope

### 3. Automated Crawler Gate
- Employs headless Playwright automation to verify internal route integrity (`index.html`, `about.html`, `services.html`, `contact.html`).
- Guards against broken anchors (`href="#"`) and validates contrast according to WCAG 2.2 AA.

---

## 🛠️ Getting Started (Local Setup)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
- `npm` or `pnpm`

### Installation
```bash
# Clone the repository
git clone https://github.com/yathipathi/TRI26129.git

# Navigate to project directory
cd TRI26129

# Install dependencies
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

*(Optional: Add free API keys for Groq or Tavily in `.env`. If no keys are specified, SiteForge operates deterministically using the built-in local compiler.)*

### Running the Application
```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧭 Routes & Endpoints

| Route | Method | Purpose |
| :--- | :--- | :--- |
| `/` | `GET` | Landing page with prompt intake and feature showcase. |
| `/builder` | `GET` | Live AI Site Studio with SSE progress feed, viewport preview, and refine canvas. |
| `/templates` | `GET` | Hostinger-style curated template catalog across 12 categories. |
| `/preview/[siteId]` | `GET` | Sandboxed preview of any generated website. |
| `/api/generate` | `POST` | Server-Sent Events (SSE) streaming multi-agent generation pipeline. |
| `/api/verify` | `POST` | Headless Playwright crawler verification audit. |
| `/api/download/[siteId]` | `GET` | Bundles complete website + academic thesis documentation into a ZIP package. |

---

## 👥 Acknowledgements

Special thanks to the faculty and administration of **Kamala Institute of Technology and Science (KITS)**, Department of Computer Science & Engineering, for their continuous support and guidance during the development of this major project.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
