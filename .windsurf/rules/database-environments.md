---
description: Rules for which Supabase database (staging vs production) each part of the app should connect to, across all environments.
---

# Database Environment Strategy

## Environment Detection

Use Vercel's built-in `VERCEL_ENV` environment variable to determine the current environment:

- **production** → `VERCEL_ENV === "production"` (the `main` branch deployment)
- **staging** → `VERCEL_ENV === "preview"` (the `staging` branch deployment or any preview deploy)
- **local** → `VERCEL_ENV` is undefined (local dev via `next dev`)

Do NOT create a custom `ENV` variable. Rely on `VERCEL_ENV` for all environment branching.

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_STAGING_SUPABASE_URL` | Staging Supabase project URL |
| `NEXT_PUBLIC_STAGING_SUPABASE_ANON_KEY` | Staging Supabase anon key (for browser/SSR auth) |
| `STAGING_SUPABASE_SERVICE_ROLE_KEY` | Staging Supabase service-role key (server-side admin) |
| `NEXT_PUBLIC_PRODUCTION_SUPABASE_URL` | Production Supabase project URL |
| `NEXT_PUBLIC_PRODUCTION_SUPABASE_ANON_KEY` | Production Supabase anon key (for browser/SSR auth in production) |
| `PRODUCTION_SUPABASE_SERVICE_ROLE_KEY` | Production Supabase service-role key (server-side admin) |

---

## Connection Rules by Area

### 1. Admin UI (`/admin` and `app/admin/`)

**Always connects to the STAGING database**, regardless of environment.

- The admin editor reads from and saves to the staging DB.
- Uses `NEXT_PUBLIC_STAGING_SUPABASE_URL` / `STAGING_SUPABASE_SERVICE_ROLE_KEY`.

### 2. Website / Public Components (`app/components/`)

Depends on environment:

| Environment | Database | Variables Used |
|---|---|---|
| **local** | Staging | `NEXT_PUBLIC_STAGING_SUPABASE_URL` / `NEXT_PUBLIC_STAGING_SUPABASE_ANON_KEY` |
| **staging** | Staging | `NEXT_PUBLIC_STAGING_SUPABASE_URL` / `NEXT_PUBLIC_STAGING_SUPABASE_ANON_KEY` |
| **production** | Production | `NEXT_PUBLIC_PRODUCTION_SUPABASE_URL` / `NEXT_PUBLIC_PRODUCTION_SUPABASE_ANON_KEY` |

When building Supabase clients for public-facing components (browser or server), check `VERCEL_ENV`:

```ts
const isProduction = process.env.VERCEL_ENV === "production"
const url = isProduction
  ? process.env.NEXT_PUBLIC_PRODUCTION_SUPABASE_URL!
  : process.env.NEXT_PUBLIC_STAGING_SUPABASE_URL!
const anonKey = isProduction
  ? process.env.NEXT_PUBLIC_PRODUCTION_SUPABASE_ANON_KEY!
  : process.env.NEXT_PUBLIC_STAGING_SUPABASE_ANON_KEY!
```

### 3. Publish API (`app/api/admin/publish/`)

Copies data **from the staging DB to the production DB**.

- Reads from `NEXT_PUBLIC_STAGING_SUPABASE_URL` / `STAGING_SUPABASE_SERVICE_ROLE_KEY` (staging).
- Writes to `NEXT_PUBLIC_PRODUCTION_SUPABASE_URL` / `PRODUCTION_SUPABASE_SERVICE_ROLE_KEY` (production).
- Both clients are always needed regardless of environment.

### 4. Admin Auth (`app/api/admin/auth/`)

Depends on environment:

| Environment | Database |
|---|---|
| **local** | Staging |
| **staging** | Staging |
| **production** | Production |

Use the same `VERCEL_ENV` check to pick the correct Supabase URL and key for auth operations.

### 5. Admin Chat / AI (`app/api/admin/chat/`)

**Always connects to the STAGING database**, regardless of environment.

- AI-driven content edits always target the staging DB.
- Uses `NEXT_PUBLIC_STAGING_SUPABASE_URL` / `STAGING_SUPABASE_SERVICE_ROLE_KEY`.
- This ensures AI changes go through the staging → publish → production workflow.

---

## Summary Matrix

| Area | Local | Staging | Production |
|---|---|---|---|
| Admin UI (`/admin`) | Staging | Staging | Staging |
| Public components (`app/components/`) | Staging | Staging | **Production** |
| Publish API (`app/api/admin/publish/`) | Staging → Prod | Staging → Prod | Staging → Prod |
| Admin Auth (`app/api/admin/auth/`) | Staging | Staging | **Production** |
| Admin Chat (`app/api/admin/chat/`) | Staging | Staging | Staging |

---

## Key Implementation Notes

- **`lib/supabase.ts`**: Contains `getSupabase()` (staging) and `getProductionSupabase()` (production) server-side clients using service-role keys. Use these in API routes.
- **`lib/supabase-browser.ts`**: Browser client — must be environment-aware for public components (staging locally/preview, production in prod).
- **`lib/supabase-server.ts`**: SSR client — must also be environment-aware for public pages.
- Never expose service-role keys to the browser. `STAGING_SUPABASE_SERVICE_ROLE_KEY` and `PRODUCTION_SUPABASE_SERVICE_ROLE_KEY` are server-only (no `NEXT_PUBLIC_` prefix).
