# Repository guidance

This is the Active Capital marketing site, built with Next.js 16 App Router,
React 19, Tailwind CSS 4, TypeScript, and Yarn. Use Node.js 24.

Commands: `yarn dev`, `yarn test`, `yarn build`, and `yarn start`.

All public copy is checked in. `lib/content.ts` is the single source for the six
marketing content fields; `app/src/` holds portfolio and testimonial data;
`app/components/` contains the presentation and team/advisor details.

Preserve production copy and layout unless a change is requested. The original
production export is in `content/production-snapshot.json`. Content changes deploy
through Git: staging to staging.active.vc, main to active.vc. There is no CMS or
persistence layer. Only the Beehiiv newsletter endpoint requires secrets.

`proxy.ts` preserves CSP nonces and pathname forwarding for the canonical tag.
Do not remove nonce propagation: Next.js framework startup scripts depend on it.
Use the `@/*` alias for imports relative to the repository root.
