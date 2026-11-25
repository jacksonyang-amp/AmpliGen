# BUILDER_HANDOFF
**Status:** START
**Phase:** 1 — Product and pricing pages (correction: product name and labels)
**Dispatch ID:** phase-1-fix-009
**Phase type:** BUILD
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Rename the site's product to AmpliGen and remove every site reference that calls the site or its content fictional or a demo. This follows the human's instruction in the Cursor chat, recorded in DECISIONS.md at 2026-11-25T03:43:00Z. Change nothing else.

## Prerequisites
- Work on the existing local branch `build/phase-1`. Confirm its head is `365b0d8` or later, specifically `3a1a163a624d050fbb9906c4e4a1b4f59c286ba8`, before editing. If not, log BLOCKED.
- Read this handoff from `origin/cursor/phase-1-handoff-fc41` until its PR is merged. Also read PHASE_LOG.md and BUILDER.md.

## Required changes
1. Product name: replace "Lumora API Platform" and "Lumora" with "AmpliGen" everywhere in the site. That includes the header brand, `<title>` values, h1s, footers, meta descriptions, the fixture, and the smoke scripts. Product names become "AmpliGen Gateway", "AmpliGen Metrics", and "AmpliGen Connect". Replace the brand mark text "LA" with "AG". Home `<title>` is exactly `AmpliGen`. Other titles use the form `Pricing | AmpliGen`.
2. Remove the "Fictional demo" banner (`div.demo-banner`) from every page, along with its CSS if it is then unused.
3. Remove every "fictional" and "demo" description of the site or its content. Specifically:
   - Home lede: "A B2B API platform with three products. Explore the products, compare pricing, or request a demo."
   - Home eyebrow "Static demo site" becomes "Static site".
   - Home in-page nav link and section heading "About this demo" become "About this site". The paragraph becomes "This site contains no real customers, leads, accounts, or services, and it does not send data to any backend."
   - Footer on every page: "AmpliGen. Product details and pricing shown on this site are illustrative."
   - Product page lede: "Three products that work together to run and measure API programs."
   - Pricing label: "Illustrative pricing. Not offered."
   - Meta descriptions: remove "fictional" and "demo" wording. For example, "AmpliGen: a B2B API and software platform." and "AmpliGen products: API gateway, metrics, and connector products."
4. Keep these unchanged, since they name a request feature rather than describing the site: the nav label "Demo request", the route `/AmpliGen/demo-request/`, every "Request a demo" CTA, and the demo-request notice "Demo requests are not connected yet. This page is a placeholder, and nothing you enter is sent anywhere." Keep the sign-up notice "Mock sign-up is not available yet. No account is created." because the brief requires simulated sign-up to be labeled.
5. Update the fixture (`src/content/phase1.fixtures.json`) to match: rename the brand and product names, the pricing label, the home lede, title, and brand. Remove the `demoLabel` key and its use. Keep route hrefs.
6. `scripts/smoke-phase1.mjs`: update the expected values to the fixture. Remove the check that each route labels itself as "fictional demo". Add these checks on every built route: the rendered HTML (excluding attribute values such as href, src, and data-attributes) has no "Lumora", no "fictional" (case-insensitive), no "demonstration", no "Fictional demo", no "demo-banner" class, and no "API Platform Demo". Also check that the home title is exactly `AmpliGen`.
7. `scripts/smoke-phase0.mjs`: this file may be edited ONLY at its two assertions on lines 83-84. Authorization is recorded in DECISIONS.md at 2026-11-25T03:43:00Z. Change the title assertion to check for `AmpliGen`, and replace the "Fictional demo" assertion with a check that the home page includes `AmpliGen`. Do not change anything else in that file. Its other checks must still pass.
8. `README.md`: change the heading to `# AmpliGen`. Rewrite the description to: "A B2B API and software platform site. It is a static site with repository-held mock data and no backend." Update the route table to match the new names: product as "AmpliGen Gateway, Metrics, and Connect products"; pricing as "Pricing with demo and trial CTAs"; keep the demo-request row. Keep the smoke command lines.
9. Do NOT edit `PHASE_LOG.md` history. Append only your new entry.

## Allowed files
- `index.html`, `product/index.html`, `pricing/index.html`, `demo-request/index.html`, `sign-up/index.html`
- `src/content/phase1.fixtures.json`, `src/style.css` (only to remove the unused banner rule), `scripts/smoke-phase1.mjs`
- `scripts/smoke-phase0.mjs` (only lines 83-84, as described in item 7)
- `README.md`, `PHASE_LOG.md` (append only)
- Do not edit `vite.config.ts`, `package.json`, `.github/workflows/`, `PROJECT_BRIEF.md`, or any other Planner-owned file.

## Forbidden
- No new dependencies, SDKs, input fields, `fetch` calls, secrets, backend, or copied real-company branding.
- No browser automation or screenshots.

## Steps
1. Confirm you are on `build/phase-1` at the head above.
2. Make the changes above. Commit locally in one or two commits.
3. Run from the repository root and record exact exit codes: `npm run typecheck`, `npm run build`, `npm run smoke:phase1`, and `npm run smoke:phase0`. All must exit 0. Also run `git grep -n -i -E 'lumora|fictional' -- index.html product pricing demo-request sign-up src` and record that it returns nothing.
4. Do not push, open a PR, merge, or deploy.
5. Append one PHASE_LOG.md entry for dispatch `phase-1-fix-009` using the template in BUILDER.md, with commit SHAs and results. Commit it. Report COMPLETE or BLOCKED to the Planner and stop.

## Definition of done
1. `npm run typecheck` exits 0.
2. `npm run build` exits 0. Every built page uses the AmpliGen brand, has no "Lumora", "fictional", "Fictional demo", "demonstration", or `demo-banner`, and the home title is exactly `AmpliGen`.
3. `npm run smoke:phase1` and `npm run smoke:phase0` both exit 0.

## Git permissions
- Commit: yes, local commits on the existing `build/phase-1` only. Branch creation: no.
- Push: no. PR creation: no. Merge: no. Deployment: no. Destructive operations: no.

## Stop
After logging COMPLETE or BLOCKED, stop. Do not start Phase 2.
