# BUILDER_HANDOFF
**Status:** START
**Phase:** 1 — Product and pricing pages (correction: align the home page)
**Dispatch ID:** phase-1-fix-008
**Phase type:** BUILD
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Make the home page consistent with the other four pages. This corrects a Planner handoff gap, not a Builder error. Change nothing else.

## Prerequisites
- Dispatch `phase-1-build-007` is reviewed and accepted except for this one correction (DECISIONS.md, 2026-11-25T03:42:00Z).
- Work on the existing local branch `build/phase-1` (head `3a6ba6d4ad639e53ae7ca3e1e4494a857fcf89f1`). If the head differs, stop and log BLOCKED. Do not create a new branch.
- Read this handoff from `origin/cursor/phase-1-handoff-fc41` until its PR is merged. Also read PHASE_LOG.md, BUILDER.md, and PROJECT_PLAN.md Phase 1.

## Required changes (home page only)
1. Remove the sentence "Product, pricing, and account pages will be added in later phases." Replace the hero lede with: "A fictional B2B API platform with three products. Explore the products, compare pricing, or request a demo."
2. Brand: use "Lumora API Platform" in the header brand (same markup as the other four pages), the h1, the footer, and the meta description. Set `<title>` to exactly `Lumora API Platform Demo`. That keeps the existing `smoke:phase0` check for "API Platform Demo" passing, so do not edit `scripts/smoke-phase0.mjs`.
3. Hero buttons: primary "Explore products" to `/AmpliGen/product/`; secondary "View pricing" to `/AmpliGen/pricing/`. Remove the two on-page anchor buttons.
4. Keep the secondary "On this page" nav, `id="overview"`, `id="capabilities"`, `id="about"`, the "Fictional demo" banner, and all other home content. `smoke:phase0` still requires them.
5. Add the home brand, title, lede, and the two hero CTAs (label and href) to `src/content/phase1.fixtures.json`. Extend `scripts/smoke-phase1.mjs` to check them on the built home page, and to fail if the built home page contains "will be added in later phases".

## Allowed files
- `index.html`, `src/content/phase1.fixtures.json`, `scripts/smoke-phase1.mjs`, `src/style.css` (only if the hero buttons need it), `README.md` (only if it describes the home page), `PHASE_LOG.md` (append only).
- Do not edit the other four pages, `vite.config.ts`, `package.json`, `scripts/smoke-phase0.mjs`, `.github/workflows/`, or any Planner-owned file.

## Forbidden
- Same as dispatch 007: no new dependencies, SDKs, input fields, `fetch`, secrets, or backend; no copied branding; no browser automation or screenshots.

## Steps
1. Confirm you are on `build/phase-1` at the head above.
2. Make the five changes. Commit them locally in one or two commits.
3. Run from the repository root and record exact exit codes: `npm run typecheck`, `npm run build`, `npm run smoke:phase1`, `npm run smoke:phase0`. All must exit 0.
4. Do not push, open a PR, merge, or deploy.
5. Append one PHASE_LOG.md entry (template in BUILDER.md) with dispatch ID `phase-1-fix-008`, commit SHAs, and the result. Commit it. Report COMPLETE or BLOCKED to the Planner and stop.

## Definition of done
1. `npm run typecheck` exits 0.
2. `npm run build` exits 0; the built home page has the Lumora brand, `<title>Lumora API Platform Demo</title>`, no "will be added in later phases" text, and hero CTAs to `/AmpliGen/product/` and `/AmpliGen/pricing/`.
3. `npm run smoke:phase1` exits 0 and checks those home-page items against the fixture; `npm run smoke:phase0` still exits 0.

## Git permissions
- Commit: yes, local commits on the existing `build/phase-1` only. Branch creation: no.
- Push: no. PR creation: no. Merge: no. Deployment: no. Destructive operations: no.
- Any push, PR, or merge needs a separate RESERVED approval in DECISIONS.md.

## Stop
After logging COMPLETE or BLOCKED, stop. Do not start Phase 2.
