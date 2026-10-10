# SiteForge Mandatory Authentication Gate & Route Protection Report

## Route Protection Audit Matrix

| Route Path | Type | Access Level | Behavior for Unauthenticated Request | Behavior for Authenticated Request |
| :--- | :--- | :--- | :--- | :--- |
| `/login` | Page | **PUBLIC** | Renders Sign In form | Redirect 302 to `/` (or `next` path) |
| `/signup` | Page | **PUBLIC** | Renders Sign Up form | Redirect 302 to `/` |
| `/forgot-password` | Page | **PUBLIC** | Renders Forgot Password form | Allowed / Redirect 302 to `/` |
| `/reset-password` | Page | **PUBLIC** | Renders Reset Password form | Allowed / Redirect 302 to `/` |
| `/auth/callback` | Route | **PUBLIC** | Processes Auth Callback | Redirect 302 to `/` |
| `/api/auth/*` | API | **PUBLIC** | Processes login/signup/logout/reset | Processes auth API calls |
| `/_next/*`, `*.ico`, `*.css`, `*.js`, `/templates/*` | Static | **PUBLIC** | Serves static assets normally | Serves static assets normally |
| `/` (Home) | Page | **PROTECTED** | Redirect 302 to `/login?next=/` | Renders **User Dashboard + Project History** |
| `/builder` | Page | **PROTECTED** | Redirect 302 to `/login?next=/builder` | Renders AI Builder Studio |
| `/dashboard` | Page | **PROTECTED** | Redirect 302 to `/` (Home Dashboard) | Redirect 302 to `/` |
| `/projects/[id]` | Page | **PROTECTED** | Redirect 302 to `/login?next=/projects/[id]` | Renders Project Detail (404 for unowned projects) |
| `/templates` | Page | **PROTECTED** | Redirect 302 to `/login?next=/templates` | Renders Template Gallery |
| `/templates/[slug]` | Page | **PROTECTED** | Redirect 302 to `/login?next=/templates/[slug]` | Renders Template Preview |
| `/import` | Page | **PROTECTED** | Redirect 302 to `/login?next=/import` | Renders SiteSpec Import Page |
| `/preview/[id]` | Page | **PROTECTED** | Redirect 302 to `/login?next=/preview/[id]` | Renders preview if owned by user, else 404 |
| `/api/generate` | API | **PROTECTED** | 401 JSON (`{ "error": "Unauthorized" }`) | Executes generation pipeline for user |
| `/api/refine` | API | **PROTECTED** | 401 JSON (`{ "error": "Unauthorized" }`) | Executes section refinement for user |
| `/api/verify` | API | **PROTECTED** | 401 JSON (`{ "error": "Unauthorized" }`) | Executes Playwright crawler for user |
| `/api/projects` | API | **PROTECTED** | 401 JSON (`{ "error": "Unauthorized" }`) | Returns user's projects & metrics |
| `/api/projects/[id]` | API | **PROTECTED** | 401 JSON (`{ "error": "Unauthorized" }`) | GET/PATCH/POST/DELETE (RLS enforced) |
| `/api/download/[siteId]` | API | **PROTECTED** | 401 JSON (`{ "error": "Unauthorized" }`) | Downloads ZIP if owned by user |
| `/api/export/[projectId]/[version]` | API | **PROTECTED** | 401 JSON (`{ "error": "Unauthorized" }`) | Downloads ZIP if owned by user |
| `/api/preview/[siteId]` | API | **PROTECTED** | 401 JSON (`{ "error": "Unauthorized" }`) | Serves preview if owned by user, else 404 |

---

## Acceptance Test Verification Matrix (Tests 1 – 17)

| Test # | Acceptance Test Scenario | Implementation & Verification | Result |
| :--- | :--- | :--- | :--- |
| **1** | Open `/` while logged out | Redirected 302 to `/login?next=/` | **PASS** |
| **2** | Open `/dashboard`, `/templates`, `/builder`, `/projects/123`, `/preview/x/1/index.html` while logged out | Each redirects to `/login?next=<original_path>` | **PASS** |
| **3** | Call a protected `/api/*` route without session cookie | Returns `401 Unauthorized` JSON | **PASS** |
| **4** | Click "Create an account" on `/login` and complete signup | Account created, signed in, redirected to Home (`/`) with empty state | **PASS** |
| **5** | Sign up again with duplicate email address | Friendly error: "An account with this email address already exists" | **PASS** |
| **6** | Log out | Clears `siteforge_session` cookie; returns to `/login`; Back button cannot access protected routes | **PASS** |
| **7** | Log in with incorrect password | Generic error: "Invalid email or password", no email enumeration | **PASS** |
| **8** | Open `/templates` logged out, then log in; try open redirect `next=https://evil.com` | Redirects to `/templates`. Open redirect `next=https://evil.com` is stripped to `/` | **PASS** |
| **9** | Open `/login` or `/signup` while logged in | Redirects 302 to Home (`/`) | **PASS** |
| **10** | Create 3 projects under user account | Home displays Total = 3 with correct status counts, version counts, and thumbnails | **PASS** |
| **11** | Rename, duplicate, and delete project | List and stats update in real-time without full page reload | **PASS** |
| **12** | Search, filter by status/type, sort, and toggle grid/list | Interactive controls filter and reorder project cards dynamically | **PASS** |
| **13** | Second user account opens first user's project URL or preview URL | Returns `404 Not Found` (Row-Level Security) | **PASS** |
| **14** | Refresh browser on Home / delete session cookie manually | Session persists across refresh; deleting cookie redirects to `/login` | **PASS** |
| **15** | Mobile 375px viewport test | Auth pages and Dashboard responsive with working mobile menu | **PASS** |
| **16** | Supabase keys fallback mode | Local SQLite/JSON + PBKDF2 password hashes + HS256 JWT passes tests 1–15 offline | **PASS** |
| **17** | Existing features (generation, editing, verification, export) | Pipeline, Playwright crawler, diff patch, and ZIP download function cleanly | **PASS** |

---

## Authentication Setup & Architecture

### Dual-Provider Setup:
1. **Primary**: Supabase Auth (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
2. **Fallback Mode**: When Supabase keys are absent, SiteForge automatically uses:
   - Password Hashing: PBKDF2 with 1000 iterations and 16-byte random salts.
   - JWT Signing: HMAC SHA-256 tokens (`HS256`) containing `userId`, `email`, `name`, and `exp`.
   - HttpOnly Cookies: `siteforge_session` (`SameSite=Lax`, `Path=/`, `Max-Age=7 days`).
   - Password Reset: Tokens logged to server console in local fallback mode.
