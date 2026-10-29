# Repository guidance

This is a one-page Active Capital marketing site using Next.js 16 App Router,
React 19, Tailwind CSS 4, TypeScript, and Yarn. Use Node.js 24.

Commands: `yarn dev`, `yarn test`, `yarn build`, and `yarn start`.

Write marketing copy directly as JSX in `app/page.tsx` and the relevant component.
The hero is in `TopHeroCard.tsx`; approach items are in `HowWeInvest.tsx`.
Portfolio and testimonial arrays live in `app/src/`. Keep the site simple:
do not introduce a CMS, content abstraction, or database layer.

Preserve production copy and layout unless a change is requested. Deploy through
Git: staging to staging.active.vc, main to active.vc. Only the Beehiiv newsletter
endpoint needs credentials.

`proxy.ts` preserves CSP nonces and pathname forwarding for the canonical tag.
Next.js startup scripts depend on nonce propagation. The `@/*` import alias maps
to the repository root.
