# AI Website Builder & Hostinger-Style Template Engine

An autonomous AI website builder and Hostinger-style template gallery built with Next.js 15 App Router, TypeScript, and Tailwind CSS. The engine collects user specifications, executes real-time web research, synthesizes a structured content brief, generates complete multi-page HTML/CSS/JS websites, validates internal links, and serves them in a sandboxed preview iframe with 1-click ZIP export.

---

## Features & Highlights

- **Hostinger-Style Template Gallery**: 12 visually distinct, category-specific website templates (`portfolio`, `restaurant`, `law-firm`, `clinic`, `ecommerce`, `startup-saas`, `education`, `real-estate`, `photography`, `ngo`, `agency`, `blog`).
- **Free, Card-Free AI Stack**:
  - Primary LLM: **Groq Free Tier** (`llama-3.3-70b-versatile`).
  - Fallback LLM: **OpenRouter Free Tier** (`meta-llama/llama-3.3-70b-instruct:free`, `mistralai/mistral-7b-instruct:free`).
  - Fallback Compiler: Local AI website layout compiler.
- **Web Research Engine**:
  - Primary Search: **Tavily Free Tier**.
  - Fallback Search: **DuckDuckGo** & domain-specific search.
- **Full Multi-Page Code Generation**: Produces `index.html`, `about.html`, `services.html`, `contact.html`, `styles.css`, and `script.js`.
- **Inline Refine Chat & ZIP Download**: Apply edits dynamically to generated sites and download standard offline ZIP packages.

---

## Setup & Running on Windows (PowerShell)

### 1. Prerequisites
- Node.js (v18 or higher)
- npm

### 2. Installation
```powershell
# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

To enable live LLM and Web Research API integrations (100% free, no credit card required):
- **Groq API Key**: Get a free key at [console.groq.com](https://console.groq.com/)
- **Tavily Search Key**: Get a free key at [tavily.com](https://tavily.com/)
- **OpenRouter Key**: Get a free key at [openrouter.ai](https://openrouter.ai/)

Paste keys into `.env`:
```env
GROQ_API_KEY=gsk_your_free_groq_key
TAVILY_API_KEY=tvly_your_free_tavily_key
OPENROUTER_API_KEY=sk-or-v1_your_free_openrouter_key
PORT=3000
```

*(Note: If no API keys are set, the platform uses DuckDuckGo web search and the built-in AI layout compiler automatically.)*

### 4. Running Development Server
```powershell
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing page with prompt intake and template gallery entry |
| `/templates` | Hostinger template gallery grid across 12 categories |
| `/templates/[slug]` | Unique live preview of a specific template with "Use Template" button |
| `/builder` | AI builder with SSE progress log, preview canvas, and refine chat |
| `/preview/[siteId]` | Full-page render of a generated site |
| `/api/generate` | POST: SSE streaming generation pipeline |
| `/api/refine` | POST: Applies inline user edit instructions to site files |
| `/api/download/[siteId]` | GET: Downloads site files as offline ZIP |

---

## Free Cloud Deployment Guide (Vercel & Render)

### Vercel Deployment (Free)
1. Push workspace repository to GitHub.
2. Import project into Vercel dashboard ([vercel.com](https://vercel.com)).
3. Set environment variables (`GROQ_API_KEY`, `TAVILY_API_KEY`).
4. Deploy! Next.js App Router route handlers run serverlessly.

*(Note: On serverless platforms like Vercel, server storage is ephemeral. Use the 1-click **Download ZIP** flow or attach Vercel Blob / KV if persistent disk storage is required.)*
