# Architectural Decisions & Library Choices (`DECISIONS.md`)

## 1. LLM Primary Provider Selection
- **Choice**: Google Gemini 2.0 Flash (`gemini-2.0-flash`) via `GEMINI_API_KEY`.
- **Rationale**: User explicitly requested Gemini API integration. Gemini 2.0 Flash offers fast response times, 1M token context windows, structured JSON schema output, and generous free-tier limits.
- **Fallbacks**: Groq API (`llama-3.3-70b-versatile`) -> OpenRouter free tier (`google/gemini-2.0-flash-lite:free`, `meta-llama/llama-3.3-70b-instruct:free`) -> Local AI compiler fallback.

## 2. Storage & Database Repository Interface
- **Choice**: Typed repository pattern over SQLite (`data/siteforge_db.json` / FTS5) with local disk storage for assets.
- **Rationale**: Guarantees zero-cost offline capability without mandatory external account setups, while remaining API-compatible with Supabase Postgres + Storage.

## 3. Sandboxed Preview Canvas Security
- **Choice**: `iframe` with `sandbox="allow-scripts allow-forms allow-popups"` (strictly excluding `allow-same-origin`).
- **Rationale**: Prevents generated site scripts from accessing host application `localStorage` or session cookies. Communication is strictly governed by `postMessage` IPC with origin and schema validation.
