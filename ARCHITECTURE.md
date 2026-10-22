# Architecture

Active Capital's website is a Next.js 16 (App Router) + React 19 + Tailwind 4 +
TypeScript marketing site with a built-in, self-editing admin CMS. This document
explains how the layout and pages are wired, which content comes from the database
versus the code, and how the admin panel works.

See [CLAUDE.md](./CLAUDE.md) for build/deploy commands and the branch/environment
model in depth.

## Stack

- **Next.js 16** App Router, **React 19**, **TypeScript**
- **Tailwind 4** (`@import "tailwindcss"` in `app/globals.css`)
- **Supabase** (Postgres + Auth) — two projects, staging and production
- **Anthropic Claude** (`claude-opus-4-6`) powers the admin AI chat agent
- **GitHub REST API** — the agent edits the repo's own files
- **Vercel** — hosting and deploys; **Upstash Redis** optional for rate limiting

## Layout setup

`app/layout.tsx` is the root layout and renders in **two modes** based on the
request path. The active path is read from a header (`x-pathname`) that `middleware.ts`
attaches to every request.

- **Admin mode** (`/admin/*`): a minimal `<body className="bg-black">` wrapping
  just the children, plus Google Tag Manager, Vercel Speed Insights, and Analytics.
- **Public mode** (everything else): a white outer frame containing a fixed-height,
  scrollable inner container (`bg-gray-dark`) that holds `HeaderNav`, the
  `TopHeroCard`, the page children, and `Footer`. Noticia Text is loaded here via
  `next/font`.

Admin and public therefore have completely independent chrome; the admin UI manages
its own full-height flex layout.

## Page setup

The homepage (`app/page.tsx`) is a **client component**. On mount it fetches
`/api/content`, which returns the database-backed `SiteContent`. It then composes
the page from section components in `app/components/`, passing the DB content only
to the sections that need it (hero/about text, approach items). Everything else —
portfolio logos, testimonials, team, advisors, newsletter — is rendered from static
data imported from `app/src/*.ts`.

Section components are presentational: they receive data as props or import static
arrays, and contain no data-fetching of their own. Reusable Tailwind class strings
live in `app/src/cssClasses.ts` (`faintBorder`, `hoverDimmed`).

### Component map

| File | Renders | Data source |
| --- | --- | --- |
| `TopHeroCard.tsx` | Hero above the fold | **DB** (`hero_title`, `hero_subtitle`) |
| `HowWeInvest.tsx` | Approach grid | **DB** (`approach_items`) |
| `page.tsx` (inline) | Pat's message, About, Contact | **DB** (`about_pat`, `about_active_capital`, `contact_html`) |
| `Portfolio.tsx` | Company logos | Code (`app/src/portfolio-companies.ts`) |
| `Testimonials.tsx` | Testimonial cards | Code (`app/src/testimonials.ts`) |
| `Team.tsx` | Team member cards | Code (inline array in component) |
| `Advisors.tsx` | Advisor cards | Code (inline in component) |
| `Newsletter.tsx` | Subscribe form → `/api/subscribe` | Code |
| `HeaderNav.tsx` / `Footer.tsx` | Navigation / footer | Code |

## Data: database vs. code

There are two content tiers, and the split is deliberate.

### From the database (editable without a deploy)

Editable marketing copy lives in the Supabase `site_content` key/value table
(one row per key). `lib/content.ts` defines the `SiteContent` shape, maps rows to
it, and provides `getPublicContent()` / `getAllContent()` / `updateContent()` etc.
Every read falls back to `DEFAULT_CONTENT` (also in `lib/content.ts`) when the DB
is unreachable or a key is missing, so the site never goes blank.

The DB-backed keys are:

- `hero_title` — hero heading
- `hero_subtitle` — hero subtitle
- `about_pat` — Pat's personal message (HTML)
- `about_active_capital` — firm description (HTML)
- `approach_items` — array of `{ label, icon }` for the How We Invest grid
- `contact_html` — Contact Us section (HTML)

These are updated instantly via `/api/admin/content` (or the AI agent's
`update_site_content` tool) and take effect on the next public read — no deploy.

### From the code (requires a deploy)

Everything structural or not frequently edited is committed to the repo:

- **Portfolio companies** — `app/src/portfolio-companies.ts`
- **Testimonials** — `app/src/testimonials.ts`
- **Characteristics / other static arrays** — `app/src/*.ts`
- **Team & advisors** — currently inline arrays inside their components
  (`app/components/Team.tsx`, `Advisors.tsx`)
- **All presentational components, layout, and logic**

File-based changes are made on the `staging` branch (by a human or by the AI agent
via the GitHub API) and reach production when staging is merged to `main`.

> Note: `app/page.tsx` also carries hardcoded fallback strings for the DB fields.
> These drift from `DEFAULT_CONTENT` over time — the single source of truth for
> defaults is `lib/content.ts`.

## Admin page

The admin panel is `app/admin/page.tsx` (a client component) plus the standalone
`app/admin/editor/page.tsx` variant. `/admin` is the hub; it combines three
surfaces in one screen.

### Auth

- Login is **Google OAuth via Supabase**, initiated in the browser so the PKCE
  verifier lives in a cookie.
- The OAuth exchange happens in `app/auth/callback/route.ts`, which enforces an
  `admin_users` whitelist (matching primary **or** secondary email) before
  redirecting in. Anyone not whitelisted is signed out and sent back with
  `?error=not_authorized`.
- `middleware.ts` refreshes the session on every request and **force-logs-out
  after 1 hour** on `/admin` routes (max session age). It does not itself gate
  access — that is done server-side per route.
- **Every `/api/admin/*` route is gated by `lib/auth.ts`'s `requireAdmin()`**,
  which verifies a whitelisted `admin_users` session and returns 401 otherwise.
- All admin API routes are also gated by `lib/rate-limit.ts` (Upstash Redis when
  configured, in-memory token bucket fallback).

### Visual Editor (left, 3/4)

A form bound to the DB `SiteContent`:

- Rich-text (`contentEditable` + `document.execCommand`) fields for the HTML copy
  (`hero_title`, `hero_subtitle`, `about_pat`, `about_active_capital`,
  `contact_html`).
- A table editor for `approach_items` with reorder (up/down), add, and remove.
- Each field saves individually to `PUT /api/admin/content` and shows a
  saving/saved indicator. Changes write to the **staging** DB and are live
  immediately on staging.

### AI Chat (right, 1/4)

An Anthropic tool-calling agent (`app/api/admin/chat/route.ts`) that can edit the
site on the user's behalf. It runs a loop (max 5 tool rounds) over `claude-opus-4-6`
with a system prompt describing the site and four tools:

- `get_site_content` / `update_site_content` — read and write DB content live.
- `read_file` / `write_file` — read/write repo files on GitHub's `staging` branch.
- `deploy_to_staging` — confirm the commit is on staging (Vercel auto-deploys).

The agent prefers DB writes for the editable fields and falls back to file edits
for everything else (team, portfolio, testimonials, etc.). Every turn is appended
as markdown to `admin_ai_conversations/<date>.md` and committed to `main`.

### Version history + Publish

- **Publish to Production** (`POST /api/admin/publish`) runs one or both of:
  - `db` — copies staging `site_content` → production `site_content`, then saves a
    semver snapshot to `content_versions` (keeps the last 10).
  - `git` — merges `staging` → `main` via the GitHub API, which triggers the
    production Vercel deploy.
- **Version History** modal lists the last 10 published versions; **Revert**
  restores production `site_content` to a chosen snapshot (`revertToVersion`).

### Underlying libraries

- `lib/content.ts` — `SiteContent` shape, `DEFAULT_CONTENT`, all DB reads/writes,
  publish/versions/revert.
- `lib/supabase.ts` — the three Supabase clients (`getSupabase` = staging service
  role, `getProductionSupabase`, `getPublicSupabase`).
- `lib/supabase-server.ts` — cookie-based SSR client for server routes.
- `lib/github-api.ts` — read/write files, multi-file tree commits, branch merge,
  and branch bootstrap against the GitHub API.
- `lib/rate-limit.ts` — per-route rate limiting.

## Data flow summary

```
Public read:  browser → /api/content → getPublicContent() → prod DB (or staging) → DEFAULT_CONTENT fallback
Admin edit:   admin UI → /api/admin/content → getSupabase() (staging DB), live on staging
AI file edit: chat → write_file → lib/github-api.ts → commit to `staging` → Vercel staging deploy
Publish:      /api/admin/publish → staging DB → prod DB (+ semver snapshot) and/or staging → main merge → prod deploy
```
