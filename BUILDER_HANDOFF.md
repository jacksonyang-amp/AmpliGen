# BUILDER_HANDOFF
**Status:** START
**Phase:** 6 — Statsig parameter stores and layers for every page template (code-only part)
**Dispatch ID:** phase-6-code-028
**Phase type:** BUILD (Steps A and B only: code, docs, test, offline checks; NO Statsig writes and NO Statsig calls at all)
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: For each of the seven page templates, add 32 typed page parameters with their exact current defaults. Read them through one helper `getPageParams(page)` that uses the Statsig client SDK parameter store, falling back to the defaults. Document them in `docs/statsig-params.yml` as PLANNED (not yet created in Statsig). Test that code, docs, and markup agree. Run the offline checks. Commit locally only. Layers and stores are NOT created in this dispatch.

## Authorization
Read this handoff from `origin/cursor/phase-4-handoff-fc41` (`git fetch origin cursor/phase-4-handoff-fc41`); the one on `main` is the old IDLE file. Do not check out or edit that branch. The approvals are DECISIONS.md entries on that branch:
- `2026-11-25T18:26:10Z` Phase 6 decisions (the Statsig write part is NOT used by this dispatch).
- `2026-11-25T18:28:34Z` task text and file list.
- `2026-11-25T18:36:03Z` human decisions: the 32 parameters, five overlap rows excluded, store parameters linked to layers (applies when stores are created later), each parameter read once per page load.
- The human's later answer (10:45 America/Los_Angeles, recorded in the Planner's DECISIONS.md entry titled "Human decision: Phase 6 code-only") selects code-only work now, with Statsig creation deferred until a write-scoped key exists.

## Prerequisites (on any failure log BLOCKED and change nothing)
1. In `/tmp/ampligen-phase6`: `git rev-parse build/phase-6` must be exactly `c356009ab32b064cd6913a0001360e97b305ba8d`; `git status --short` must print nothing; `git ls-remote origin refs/heads/build/phase-6` must print nothing.
2. Baseline on the unchanged tree, already run by you in phase-6-build-027 with exit 0: `npm ci`, typecheck, build, smoke:phase0 to smoke:phase4, bot:dry-run. Re-run `npm run bot:dry-run` and record the sha256 of its output after the three npm banner lines. It must equal `ec7d5edd56049f4540e269566c49dae09ca9489fe6e06158bf23178ed47764d4`. If it does not, log BLOCKED.

## Statsig rule for this dispatch
- No Statsig tool calls at all: no `Get_Context`, no `Search_Tools`, no list, read, create, update, delete, start, or stop. The code reads stores at runtime through the browser SDK only; that is not a Statsig management call and is allowed in code, but no test or script may call the Statsig management API.
- Do not create or assume any layer or store exists. In the docs, every entry is marked `status: planned`.

## Git permissions
- Commit yes, local commits on `build/phase-6` in `/tmp/ampligen-phase6`. Nothing else: no push, PR, merge, deployment, new branch, amend, rebase, reset, or force.
- `package-lock.json` must not change. No new dependency.

## Allowed files
`src/**` (new files and the minimal edits named below), `docs/statsig-params.yml` (new), `scripts/smoke-phase6.mjs` (new), the seven templates `index.html`, `product/index.html`, `pricing/index.html`, `demo-request/index.html`, `demo-request/success/index.html`, `sign-up/index.html`, `welcome/index.html`, `package.json` (add exactly one script line, `"smoke:phase6": "node --experimental-strip-types scripts/smoke-phase6.mjs"`, and change nothing else), and `PHASE_LOG.md` (append one entry).
Not allowed: `docs/custom-events.yml`, `.github/**`, `scripts/smoke-phase0.mjs` through `smoke-phase4.mjs`, `scripts/bot-runner.mjs`, `src/analytics/**`, `src/contract/**`, `src/identity/**`, `src/fixtures/**`, `vite.config.ts`, `src/style.css`, and any Planner-owned file. If an existing smoke script fails because of your change, do not edit it; log BLOCKED with the failing assertion.

## The parameters (32)
Page key, planned layer, planned store: `home` `home_layer` `home_params`; `product` `product_layer` `product_params`; `pricing` `pricing_layer` `pricing_params`; `demo_request` `demo_request_layer` `demo_request_params`; `demo_request_success` `demo_request_success_layer` `demo_request_success_params`; `sign_up` `sign_up_layer` `sign_up_params`; `welcome` `welcome_layer` `welcome_params`.
- home (6): `hero_eyebrow`, `hero_lede`, `primary_cta_label`, `secondary_cta_label`, `capabilities_heading`, `show_capabilities_section` (boolean, default true).
- product (6): `hero_lede`, `gateway_description`, `metrics_description`, `connect_description`, `card_cta_label`, `next_steps_primary_label`.
- pricing (5): `hero_heading`, `hero_lede`, `starter_price_text`, `growth_price_text`, `enterprise_price_text`.
- demo_request (4): `hero_heading`, `intro_notice`, `email_label`, `submit_label`.
- demo_request_success (3): `hero_heading`, `confirmation_notice`, `primary_cta_label`.
- sign_up (4): `hero_heading`, `intro_notice`, `submit_label`, `back_link_label`.
- welcome (4): `hero_eyebrow`, `hero_heading`, `welcome_notice`, `primary_cta_label`.
Types are string except `show_capabilities_section`. Defaults are the exact current text copied from the repo, character for character; the `phase-6-discover-026` entry in `PHASE_LOG.md` on `build/phase-6` has them with sources. Add no parameter, drop none, rename none. The five overlap rows stay excluded: do not touch the pricing plan CTA labels (experiment `pricing_cta_copy`), the pricing notice (config `pricing_notice`), or the Metrics card sentence (gate `metrics_account_breakdown`), and do not read, link, or reference those entities. If a listed parameter turns out to be one of those, log BLOCKED instead of choosing.

## Work
### A. Wire the code
1. One definition of the parameters in code (page key, parameter name, type, default, planned layer and store names), for example `src/statsig/page-params.ts`. Docs and test are checked against it.
2. One helper `getPageParams(page)` that reads that page's store through the Statsig client SDK. Add one method to the `ExperimentsSdk` interface in `src/statsig/sdk.ts` and implement it in `src/statsig/statsig-adapter.ts` with `client.getParameterStore(name)` and `get(param, fallback)`. When the store is missing, a parameter is unset, a type does not match, the SDK fails, or there is no SDK, each parameter returns its default. Components and page scripts never read a store or layer directly.
3. Exposure rule (human decision 18:36:03Z): each parameter is read at most once per page load, with its own memo like `src/statsig/controller.ts`; exposure logging stays on, so later layer links will log at most one `layer_exposure` per parameter per page load. Do not read parameters the page does not use.
4. Apply values after init, the way the three existing entities are applied: markup defaults show first; values change only if Statsig initializes within the existing 3000 ms timeout. Minimal edits to `src/statsig/controller.ts` and `src/statsig/pages.ts`; no change to how the existing experiment, gate, and config are evaluated or applied, and no change to event forwarding.
5. Templates: add `data-param="<parameter name>"` to the element whose text is the default. Change no text, class, id, href, or structure. If a default's element has child elements, put the attribute on a text-only child or wrap only the text in `<span data-param="...">`; list each such case in the log. Apply values with `textContent` only, never `innerHTML`. Ignore an unset value, an empty or whitespace-only string, and a string over 300 characters (the default stays). For `show_capabilities_section`, hide the capabilities section only when the value is exactly `false`; when true, nothing changes.
6. `docs/statsig-params.yml`: JSON syntax like `docs/custom-events.yml`, readable with `JSON.parse`, no parser dependency. For every page: layer, store, each parameter with type and default, and `status: "planned"` for the layer and store (not created in Statsig).
7. `scripts/smoke-phase6.mjs`, run by `npm run smoke:phase6`. It must check: (a) the code's parameter set equals the docs' set, name, type, default, layer, and store; (b) a negative case: remove one parameter from an in-memory copy of the docs and confirm the check fails, then add one extra entry and confirm it fails; (c) each default equals the text of its `data-param` element in the template; (d) with a fake SDK that has no stores, each of the seven pages loads with defaults, using a test user ID; (e) with a fake SDK that returns overrides, the override is applied, and a bad override (wrong type, empty, over 300 characters) leaves the default; (f) each parameter is read at most once per page load, including across a user update; (g) the two business events and the Amplitude boundary are unchanged, using the same fake boundaries `smoke:phase4` uses, and the new code does not reference the three existing entities. Use the repo's existing test style (see `scripts/smoke-phase4.mjs`). Non-browser only.

### B. Verify offline
From `/tmp/ampligen-phase6`: `npm run typecheck`; `npm run build`; `npm run smoke:phase6`; `npm run smoke:phase0` through `npm run smoke:phase4` unchanged; `npm run bot:dry-run` with output sha256 equal to `ec7d5edd56049f4540e269566c49dae09ca9489fe6e06158bf23178ed47764d4`. All exit 0. Commit locally.

## Definition of done
1. 32 parameters across seven pages exist in code, `docs/statsig-params.yml` (status planned), and the templates, with exact defaults; none of the five overlap rows is touched.
2. `getPageParams(page)` is the only reader of stores and layers; defaults apply when a store, parameter, or SDK is missing; each parameter is read at most once per page load.
3. `npm run typecheck`, `npm run build`, `npm run smoke:phase6`, `smoke:phase0` to `smoke:phase4`, and `bot:dry-run` exit 0; the bot output hash equals the baseline; the two business events and the Amplitude boundary are unchanged.
4. No Statsig call was made. No layer or store was created, read, or changed.
5. `git status` shows only allowed files; local commits only on `build/phase-6`; `package-lock.json` unchanged; nothing pushed.
6. UNVERIFIED by design, do not claim: that the page loads the values from a live store with the real client key, and any exposure events in Statsig. Layers and stores are not created, so Statsig creation is a later dispatch.

## Report
Append one `PHASE_LOG.md` entry with the BUILDER.md template. Mark `COMPLETE` only if every criterion above passes; otherwise `BLOCKED`. List the template files changed, the `data-param` count per page, any `<span>` wrap, and the bot sha256. Commit locally. Notify the Planner and stop. Wait for a new START dispatch.

## Forbidden
Push, PR, merge, deployment, or any other branch; any Statsig call; any experiment, gate, or dynamic config; any change to the three existing entities; any file outside the allowed list; new dependencies; printing or committing a key or secret; production data; traffic or a browser run.

## Stop
After logging COMPLETE or BLOCKED, stop.
