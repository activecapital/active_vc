# Architecture

`app/layout.tsx` renders navigation, the hero, page content, and the footer.
`app/page.tsx` composes the homepage sections with hardcoded JSX copy.
`app/components/TopHeroCard.tsx` contains the literal hero heading and subtitle;
`app/components/HowWeInvest.tsx` owns its fixed list of approach items.

`app/components/` also contains team, advisors, newsletter, and carousel components.
`app/src/` holds portfolio and testimonial arrays. Static assets live in `public/`.
There is no remote content loading or HTML injection.

`app/api/subscribe/route.ts` is the only application API. It sends newsletter
requests to Beehiiv using server-side credentials. `lib/rate-limit.ts` keeps
per-process counters without external storage.

`proxy.ts` and `lib/csp.ts` provide per-request CSP nonces. The proxy also forwards
the pathname used for the homepage canonical tag. `next.config.mjs` retains
security headers and staging crawler protection.

Vercel deploys the `staging` and `main` branches. Text changes are ordinary source
edits followed by deployment.
