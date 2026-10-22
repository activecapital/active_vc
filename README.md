# Active Capital

The Active Capital website: a Next.js marketing site with a built-in admin CMS that
can edit its own content (and its own source) via an AI chat assistant.

> Full details — layout/page setup, what's stored in the database vs. the code, and
> how the admin panel works — live in **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

## Getting Started

```bash
yarn install
yarn dev        # http://localhost:3000
```

Required environment variables are documented in [env.example](./env.example).

## Commands

```bash
yarn dev     # start the dev server
yarn lint    # next lint
yarn build   # next lint & next build
```

There is no test suite.

## What's where

- **`app/layout.tsx`** — root layout; renders admin chrome vs. public chrome based
  on the request path.
- **`app/page.tsx`** — homepage; fetches DB content from `/api/content` and
  composes the page from components in `app/components/`.
- **`app/components/`** — presentational section components (Portfolio, Team,
  Testimonials, HowWeInvest, etc.).
- **`app/src/`** — static data (portfolio companies, testimonials, characteristics).
- **`app/admin/`** — the admin CMS: visual editor + AI chat + version history.
- **`app/api/`** — API routes (public content, subscribe, and the admin actions).
- **`lib/`** — Supabase clients, content access, GitHub API, rate limiting.
- **`middleware.ts`** — Next middleware: session refresh + 1-hour max session age on `/admin`, plus the `x-pathname` header. Server-side admin auth is enforced per-route by `lib/auth.ts` (`requireAdmin`), not by the middleware.

Content is split in two: editable marketing copy lives in the Supabase
`site_content` table (updated live, no deploy), while everything structural is
committed to the code and ships on deploy. See the architecture doc for the full
breakdown.

## Branch / environment model

- `staging` branch → staging.active.vc → staging Supabase
- `main` branch → production → production Supabase

Publishing copies staging content to production, snapshots a semver version, and/or
merges `staging` → `main` to trigger the production deploy. Details in
[CLAUDE.md](./CLAUDE.md) and [ARCHITECTURE.md](./ARCHITECTURE.md).

### Staging crawler protection

`app/robots.ts` disallows crawling in non-production environments. In addition,
`next.config.mjs` sends `X-Robots-Tag: noindex, nofollow` on every preview response,
including static files, and on `staging.active.vc` even for a production build.
Production requests to `active.vc` do not receive this header.

These are directives for cooperative crawlers, not access controls. Google must
fetch a URL to see `noindex`, so the robots.txt block can prevent removal of an
already indexed URL. If staging appears in search results, temporarily permit
crawling so Google can read the header, or restrict staging behind authentication.

## CHANGELOG

* Feb 21, 2025 — Added Chris Saum back to Team; updated website text; contact email
  changed to team@active.vc
