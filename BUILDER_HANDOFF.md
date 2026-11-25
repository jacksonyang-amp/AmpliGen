# BUILDER_HANDOFF
**Status:** IDLE
**Phase:** 1 — Product and pricing pages
**Dispatch ID:** phase-1-build-007 (reviewed; COMPLETE logged)
**Phase type:** BUILD
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Add the fictional Lumora API Platform product and pricing pages with working navigation to demo-request and sign-up placeholder routes.

## Prerequisites
- Phase 0 is COMPLETE. Confirm that `origin/main` PHASE_LOG.md has the entry `2026-11-25T03:18:00Z | Phase 0 | COMPLETE` before editing.
- Scope authorization: the human instructed "Start with Phase 1" in the Cursor chat. It is recorded in DECISIONS.md with timestamp 2026-11-25T03:35:00Z.
- This handoff is read from `origin/cursor/phase-1-handoff-fc41` until its PR is merged to `main`. Read BUILDER_HANDOFF.md, PHASE_LOG.md, BUILDER.md, PROJECT_BRIEF.md, and PROJECT_PLAN.md Phase 1 from that branch and from `origin/main` if it is newer.

## Fixed content (Planner selections; do not change)
- Platform name: Lumora API Platform. Label it as a fictional demo.
- Products, exact names and one-line descriptions:
  - Lumora Gateway: "Route, authenticate, and rate-limit API traffic."
  - Lumora Metrics: "See usage and conversion by account and team."
  - Lumora Connect: "Send webhooks and connect to prebuilt business tools."
- Pricing, labeled "Illustrative demo pricing. Not offered.":
  - Starter: $49 per month. CTA "Start a trial" to `/AmpliGen/sign-up/`.
  - Growth: $249 per month. CTA "Start a trial" to `/AmpliGen/sign-up/`.
  - Enterprise: Custom pricing. CTA "Request a demo" to `/AmpliGen/demo-request/`.
- Product page CTAs: "Request a demo" to `/AmpliGen/demo-request/`, and "View pricing" to `/AmpliGen/pricing/`.
- Demo-request page temporary copy: "Demo requests are not connected yet. This page is a placeholder, and nothing you enter is sent anywhere." Include no input fields.
- Sign-up page temporary copy: "Mock sign-up is not available yet. No account is created." Include no input fields. Link back to `/AmpliGen/pricing/`.
- Nav on every page links to home, product, pricing, demo-request, and sign-up using the base path.

## Routes (must resolve in the built output under `/AmpliGen/`)
- `/AmpliGen/` (existing home page; keep its content so `smoke:phase0` still passes)
- `/AmpliGen/product/`
- `/AmpliGen/pricing/`
- `/AmpliGen/demo-request/`
- `/AmpliGen/sign-up/`

Implement each route as a real HTML entry (`product/index.html`, and so on) registered through Vite multi-page `build.rollupOptions.input`. Keep `base: '/AmpliGen/'`.

## Content fixture
- Create `src/content/phase1.fixtures.json` with platform name, products (name, description, CTA label, CTA href), plans (name, price, CTA label, CTA href), and the temporary copy above. `smoke:phase1` compares the built HTML against this file.

## Allowed files
- `src/` (new Phase 1 pages, styles, and fixture)
- `public/` only if needed
- `index.html` (nav only; keep home content)
- `product/index.html`, `pricing/index.html`, `demo-request/index.html`, `sign-up/index.html` (new)
- `vite.config.ts` (add multi-page inputs only; keep base and outDir)
- `scripts/smoke-phase1.mjs` (new)
- `package.json` (add the `smoke:phase1` script only; no new dependencies)
- `README.md` (route list and smoke command)
- `PHASE_LOG.md` (append only)

Do not edit `.github/workflows/`, `scripts/smoke-phase0.mjs`, `DECISIONS.md`, `BUILDER_HANDOFF.md`, `PROJECT_PLAN.md`, `PROJECT_BRIEF.md`, `PLANNER.md`, `BUILDER.md`, or `AGENTS.md`. If the Phase 1 change would break `smoke:phase0`, log BLOCKED instead of editing that smoke script.

## Forbidden in this phase
- No new npm dependencies. No `@amplitude/*` or Statsig packages. No `initAll()`, no analytics calls, and no feature-flag code.
- No input fields, `<form>` submissions, `fetch`, or XHR calls.
- No secrets, keys, or environment values. No backend.
- No copied real-company branding, logos, or marks.
- No Playwright, browser walkthroughs, or screenshots. Those belong to Phase 5.

## Steps
1. Run `git fetch origin main`. Create branch `build/phase-1` from `origin/main`. Branch creation is limited to this name.
2. Implement the routes, navigation, fixture, and smoke script described above.
3. Run these commands from the repository root. Each must pass:
   - `npm ci` (install only)
   - `npm run typecheck`: expect exit 0
   - `npm run build`: expect exit 0, and `dist/` contains `index.html`, `product/index.html`, `pricing/index.html`, `demo-request/index.html`, and `sign-up/index.html`
   - `npm run smoke:phase1`: expect exit 0 with all checks passing. It must serve `dist/` under `/AmpliGen/`, check each route returns HTTP 200, and compare product names, plan prices, the "Illustrative demo pricing. Not offered." label, CTA hrefs, and temporary copy against the fixture.
   - `npm run smoke:phase0`: expect exit 0 (regression)
4. Commit the work on `build/phase-1` in logical commits. Do not push. Do not open a PR. Do not merge.
5. Append one PHASE_LOG.md entry using the template in BUILDER.md, with the commit SHAs, the command results, and a criterion-by-criterion PASS/FAIL/UNVERIFIED check against the definition of done below. Then report COMPLETE or BLOCKED to the Planner through the agent channel and stop.

## Definition of done (from PROJECT_PLAN.md Phase 1)
1. `npm run typecheck` exits 0.
2. `npm run build` exits 0 with home, product, pricing, demo-request, and sign-up routes. Unfinished forms show clear temporary information instead of broken controls.
3. `npm run smoke:phase1` confirms those routes resolve from the built site and checks the product names, pricing copy, and CTA destinations against the fixture.

## Git permissions
- Branch creation: yes, `build/phase-1` only.
- Commit: yes, local commits on `build/phase-1` only.
- Push: no. PR creation: no. Merge: no. Deployment: no. Destructive git operations: no.
- Any push, PR, or merge needs a separate RESERVED approval in DECISIONS.md. Stop after the local commit and PHASE_LOG.md entry.

## Stop
After logging COMPLETE or BLOCKED, stop. Do not start Phase 2.
