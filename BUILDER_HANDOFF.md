# BUILDER_HANDOFF
**Status:** START
**Phase:** 6 — Statsig parameter stores and layers for every page template
**Dispatch ID:** phase-6-discover-026
**Phase type:** BUILD (Step 1 only: discovery, report only)
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Find every page template in the repo and propose, in one table, the layer, parameter store, and parameters (name, type, current hardcoded default) for each page. Report only. Create nothing in Statsig. Change no site file. Stop after logging.

## Authorization
- Phase 6 and its limits are the human's decisions in DECISIONS.md `2026-11-25T18:26:10Z | Human decisions: add Phase 6 (Statsig parameter stores and layers)`. Read it from `origin/cursor/phase-4-handoff-fc41` after `git fetch origin cursor/phase-4-handoff-fc41`. Read this handoff from that same branch. Do not check out or edit that branch. The `BUILDER_HANDOFF.md` on `main` is the old IDLE file and does not apply.
- This dispatch uses none of the Statsig write permission. A later dispatch, issued after the human replies "Go" to the Planner, covers creating layers and stores and wiring the code.

## Prerequisites
- `git fetch origin main`. `origin/main` must be `4d677832cb5026304c5728d9360dc409db38d486` or a descendant of it; if it is not, stop and log BLOCKED.
- `git branch --list build/phase-6` and `git ls-remote origin refs/heads/build/phase-6` must both print nothing. If either prints a line, stop and log BLOCKED.

## Git permissions (this dispatch)
- Create the worktree and branch once: `git worktree add /tmp/ampligen-phase6 -b build/phase-6 origin/main`.
- Commit yes, on local `build/phase-6` only, and only the `PHASE_LOG.md` entry.
- Push no. PR no. Merge no. Deployment no. Amend, rebase, reset, and force no. Any other branch no.
- `npm ci` in the worktree is allowed. It must not change a tracked file; check `git status` before committing.

## Allowed files
- `PHASE_LOG.md` (append one entry). No other file, including `package.json`, `package-lock.json`, any `.html`, `src/**`, `docs/**`, and `scripts/**`.

## Step 1: discover (report only)
1. List every page template in the repo. This is a static Vite site, not an app router. A template is one distinct HTML file in the repo that Vite builds (check `vite.config.ts` for the entry list and `ls` for the files). Expect these seven; list any others and do not invent pages that do not exist (there is no cart, checkout, product listing, or product detail template): home `index.html`, `product/index.html`, `pricing/index.html`, `demo-request/index.html`, `demo-request/success/index.html`, `sign-up/index.html`, `welcome/index.html`. Treat each file as one page.
2. For each page, list the values a visitor could see change: copy, labels, layout choices, feature toggles, numeric thresholds. Give each a snake_case name, a type (string, boolean, number, or JSON), and its exact current value as the default. For each, give the source: file and the element or selector. Copy defaults character for character from the repo; do not paraphrase.
3. Exclusions. Do not propose any value that feeds the event contract or identity: anything in `docs/custom-events.yml`, `product_id`, `plan_id`, `entry_point`, event names, property names, ids, storage keys, hrefs, and routes. Do not propose form validation messages, `aria-*` text, or the page `<title>` unless you list them in a separate "considered, not proposed" list with the reason.
4. Existing Statsig entities. Three exist and stay untouched: experiment `pricing_cta_copy` (`label_mode`, drives the plan CTA labels on pricing), dynamic config `pricing_notice` (`notice`, drives the pricing notice), gate `metrics_account_breakdown` (drives the Metrics card sentence on product). For the values they already control, mark the row "existing entity: overlap" and propose either to exclude it or to give the store a separate parameter. The human decides. Do not read, change, or reference those three entities from a new store.
5. Show one table: `page | layer name | store name | parameters (name, type, default, source)`. Naming: `<page>_layer` and `<page>_params`, with snake_case page keys (for example `demo_request`, `demo_request_success`, `sign_up`). If the number of parameters on a page looks too large to be useful, say so and give a recommended shorter list; the human trims it.
6. Statsig facts, read-only, with the evidence (official documentation URL, or the read call and its result):
   - the exact `@statsig/js-client` v3 API for reading a parameter store (`getParameterStore` or the current name), and what it returns when the store is missing or a parameter is unset;
   - whether reading a store parameter logs an exposure, which kind (layer, gate, config), and what that means for "one exposure per evaluation" and "no duplicate exposure at the Amplitude boundary" in this repo;
   - the project's review settings and any limits on layers, stores, or parameters per entity;
   - the existing layers and parameter stores in the project (read-only list calls only), and any name collision with your proposed names.
   Use the Statsig connection for read calls only: no create, update, delete, start, or stop, and no experiment of any kind. Never print or commit a key. If a read needs a console key or a secret you do not have, log that as a gap and continue with the rest.
7. Baseline QA on the unchanged tree: `npm ci`, `npm run typecheck`, and `npm run build` from `/tmp/ampligen-phase6`, with exit codes. They must exit 0. This confirms the starting point; it is not a smoke check of new work.

## Definition of done
1. The table covers every page template that exists, and no page that does not.
2. Every default is the exact current value, with its source.
3. No excluded value (item 3) is proposed; existing-entity overlaps are marked (item 4).
4. The Statsig facts in item 6 are answered with evidence, or marked as a gap with the reason.
5. Baseline `npm run typecheck` and `npm run build` exit 0.
6. `git status` in the worktree shows `PHASE_LOG.md` as the only changed file; one local commit on `build/phase-6`; nothing in Statsig was written; nothing pushed.

## Report
- Append one `PHASE_LOG.md` entry with the BUILDER.md template: `COMPLETE` if every criterion passes, `BLOCKED` otherwise. Put the full table, the considered-not-proposed list, and the Statsig facts in "What was built". Commit it on `build/phase-6`.
- Notify the Planner and stop. Do not start Step 2. Wait for a new START dispatch.

## Later steps, for context only (NOT authorized in this dispatch)
- Step 2: after the human's "Go", create one layer and one parameter store per page in Statsig, store parameters linked to the layer parameters, read each back, no experiments. Step 3: one helper `getPageParams(page)` that reads the page's store through the Statsig client SDK and falls back to the table's defaults; components never read stores or layers directly; replace the hardcoded values; write `docs/statsig-params.yml`; add a test that fails if a parameter used in the helper is missing from that file. Step 4: tests, typecheck, build, a test-user load of each page with defaults, and Amplitude and Statsig business events unchanged. Off limits throughout: starting or editing experiments, deleting existing Statsig entities, merging, production data.

## Forbidden
- Any Statsig create, update, delete, start, or stop; any experiment; any change to the three existing entities.
- Any file change except the one `PHASE_LOG.md` entry; any commit on another branch; a push, PR, merge, or deployment.
- Printing or committing a key or secret; touching production data; traffic or a browser run.

## Stop
After logging COMPLETE or BLOCKED, stop.
