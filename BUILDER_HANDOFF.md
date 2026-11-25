# BUILDER_HANDOFF
**Status:** START
**Phase:** 6 — Statsig parameter stores and layers for every page template
**Dispatch ID:** phase-6-build-027
**Phase type:** BUILD (Steps 2 to 4: code, docs, test, then Statsig layers and stores)
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: For each of the seven page templates, add a typed set of page parameters with exact current defaults; read them through one helper `getPageParams(page)` that uses the Statsig client SDK parameter store; document them in `docs/statsig-params.yml`; test that code, docs, and markup agree; then create one layer and one linked parameter store per page in Statsig and read each back. No experiments. Commit locally only.

## Authorization
Read this handoff from `origin/cursor/phase-4-handoff-fc41` (`git fetch origin cursor/phase-4-handoff-fc41`); the one on `main` is the old IDLE file. Do not check out or edit that branch. The approvals are DECISIONS.md entries on that branch:
- `2026-11-25T18:26:10Z` Phase 6 decisions: Statsig writes limited to layers and parameter stores; never experiments, gates, or dynamic configs; never the three existing entities; commits on local `build/phase-6` only.
- `2026-11-25T18:28:34Z` task text and the file list for this dispatch.
- `2026-11-25T18:36:03Z` human decisions: the 32 parameters below, the five overlap rows excluded, store parameters linked to layers, each parameter read once per page load, write-enabled Statsig connection.
The human says the connection is now write-enabled. That is unverified by the Planner; Prerequisite 1 checks it.

## Prerequisites (check all before changing anything; on any failure log BLOCKED and write nothing)
1. Read the Statsig connection context (`Get_Context`). It must show write allowed (`canWrite` true, read-only flags false). If it still shows read-only, stop. Do not write code and do not call any Statsig write tool.
2. In `/tmp/ampligen-phase6`: `git rev-parse build/phase-6` must be exactly `b2349f816f57c17259895b7943d0905d7c6f7369`, `git status --short` must print nothing, `git merge-base --is-ancestor origin/main build/phase-6` must exit 0 after `git fetch origin main`, and `git ls-remote origin refs/heads/build/phase-6` must print nothing.
3. Baseline on the unchanged tree: `npm ci`; `npm run typecheck`; `npm run build`; `npm run smoke:phase0` through `npm run smoke:phase4`; and `npm run bot:dry-run`. All exit 0. Save the sha256 of the `bot:dry-run` output; Step B compares against it.

## Git permissions
- Commit yes, one or more local commits on `build/phase-6` in `/tmp/ampligen-phase6`. Nothing else: no push, PR, merge, deployment, new branch, amend, rebase, reset, or force.
- `package-lock.json` must not change. No new dependency.

## Allowed files
`src/**` (new files plus the minimal edits named below), `docs/statsig-params.yml` (new), `scripts/smoke-phase6.mjs` (new), the seven templates `index.html`, `product/index.html`, `pricing/index.html`, `demo-request/index.html`, `demo-request/success/index.html`, `sign-up/index.html`, `welcome/index.html`, `package.json` (add exactly one script line, `"smoke:phase6": "node --experimental-strip-types scripts/smoke-phase6.mjs"`, and change nothing else), and `PHASE_LOG.md` (append one entry).
Not allowed: `docs/custom-events.yml`, `.github/**`, `scripts/smoke-phase0.mjs` through `smoke-phase4.mjs`, `scripts/bot-runner.mjs`, `src/analytics/**`, `src/contract/**`, `src/identity/**`, `src/fixtures/**`, `vite.config.ts`, `src/style.css`, and any Planner-owned file. If an existing smoke script fails because of a change you made, do not edit it; log BLOCKED with the failing assertion.

## The parameters (32; names and defaults are in the `phase-6-discover-026` entry in `PHASE_LOG.md` on `build/phase-6`)
Page key, layer, store: `home` `home_layer` `home_params`; `product` `product_layer` `product_params`; `pricing` `pricing_layer` `pricing_params`; `demo_request` `demo_request_layer` `demo_request_params`; `demo_request_success` `demo_request_success_layer` `demo_request_success_params`; `sign_up` `sign_up_layer` `sign_up_params`; `welcome` `welcome_layer` `welcome_params`.
- home (6): `hero_eyebrow`, `hero_lede`, `primary_cta_label`, `secondary_cta_label`, `capabilities_heading`, `show_capabilities_section` (boolean, default true).
- product (6): `hero_lede`, `gateway_description`, `metrics_description`, `connect_description`, `card_cta_label`, `next_steps_primary_label`.
- pricing (5): `hero_heading`, `hero_lede`, `starter_price_text`, `growth_price_text`, `enterprise_price_text`.
- demo_request (4): `hero_heading`, `intro_notice`, `email_label`, `submit_label`.
- demo_request_success (3): `hero_heading`, `confirmation_notice`, `primary_cta_label`.
- sign_up (4): `hero_heading`, `intro_notice`, `submit_label`, `back_link_label`.
- welcome (4): `hero_eyebrow`, `hero_heading`, `welcome_notice`, `primary_cta_label`.
Types are string except `show_capabilities_section`. Defaults are the exact current text copied from the repo, character for character, as in your table. Add no parameter, drop none, rename none. The five overlap rows stay excluded: do not touch the pricing plan CTA labels (experiment `pricing_cta_copy`), the pricing notice (config `pricing_notice`), or the Metrics card sentence (gate `metrics_account_breakdown`), and do not read, link, or reference those entities from the new code or stores. If a listed parameter turns out to be one of those, log BLOCKED instead of choosing.

## Order of work (a Planner deviation from the task text's Step 2, 3, 4 order: code first, because Statsig entities cannot be deleted, so the set must be final before anything is created)
### A. Wire the code (task Step 3)
1. One definition of the parameters in code (page key, parameter name, type, default), for example `src/statsig/page-params.ts`. Docs and test are checked against it.
2. One helper `getPageParams(page)` that reads that page's store through the Statsig client SDK. Add one method to the `ExperimentsSdk` interface in `src/statsig/sdk.ts` and implement it in `src/statsig/statsig-adapter.ts` with `client.getParameterStore(name)` and `get(param, fallback)` (the Step 1 report has the evidence). With a missing store, an unset parameter, a type mismatch, an SDK failure, or no SDK, each parameter returns its default. Components and page scripts never read a store or layer directly.
3. Exposure rule (human decision `18:36:03Z`): store parameters are linked to layers, so each read logs a `layer_exposure`. Read each parameter at most once per page load, with its own memo like the one in `src/statsig/controller.ts`; exposure logging stays on. Do not read parameters the page does not use.
4. Apply values from the existing controller after init, in the same way the three existing entities are applied (markup defaults show first; values change only if Statsig initialized within the existing 3000 ms timeout). Minimal edits to `src/statsig/controller.ts` and `src/statsig/pages.ts` only, with no change to how the existing experiment, gate, and config are evaluated or applied, and none to event forwarding.
5. Templates: add a `data-param="<parameter name>"` attribute on the element whose text is the default. Change no text, class, id, href, or structure. If a default's element holds child elements, put the attribute on an existing text-only child or wrap only the text in a `<span data-param>`; list each such case in the log. Apply values with `textContent` only, never `innerHTML`. Ignore an unset value, an empty or whitespace-only string, and a string over 300 characters (the default stays). For `show_capabilities_section`, hide the capabilities section only when the value is exactly `false`; keep the `#capabilities` element and its nav link usable as today when it is true.
6. `docs/statsig-params.yml`: every page, layer, store, parameter, type, and default. Write it in JSON syntax like `docs/custom-events.yml` so the test can read it with `JSON.parse`; no parser dependency.
7. `scripts/smoke-phase6.mjs`, run by `npm run smoke:phase6`. It must check: (a) the parameter set in the code equals the set in `docs/statsig-params.yml`, name, type, default, layer, and store; (b) a negative case: remove one parameter from an in-memory copy of the docs and confirm the check fails, then do the reverse (an extra docs entry); (c) each default equals the text of its `data-param` element in the template; (d) with a fake SDK that has no stores, each of the seven pages loads with its defaults, using a test user ID; (e) with a fake SDK that returns overrides, the override is applied, and a bad override (wrong type, empty, over 300 characters) leaves the default; (f) each parameter is read at most once per page load, including across a user update; (g) the two business events and the Amplitude boundary are unchanged, using the same fake boundaries `smoke:phase4` uses, and none of the existing three entities is referenced by the new code. Use the repo's existing test style (see `scripts/smoke-phase4.mjs`). Non-browser only.

### B. Verify offline (task Step 4)
Run, from `/tmp/ampligen-phase6`: `npm run typecheck`; `npm run build`; `npm run smoke:phase6`; `npm run smoke:phase0` through `npm run smoke:phase4` unchanged; and `npm run bot:dry-run`, whose output sha256 must equal the baseline. All exit 0. Commit locally before any Statsig write. If anything fails and the cause is not fixable inside the allowed files, log BLOCKED and write nothing to Statsig.

### C. Create in Statsig (task Step 2), only after B passes
1. Read the project context and respect the review settings. The Step 1 report says the production environment requires review and a release pipeline. If creating a layer or store needs a review, an approval, a release pipeline step, a console key, or a secret you do not have, stop, log BLOCKED, and list exactly what was created so far. Do not work around review, and do not use any other key.
2. Use the connection's discovery tools (`Search_Tools`, `Get_Tool_Schema`) to find the exact create operations. Do not guess operation names or parameters.
3. Before each create, list existing layers and stores and confirm the name is free. Never overwrite or edit an existing entity.
4. For each page, create one layer named `<page>_layer` with the page's parameters, types, and defaults, `idType` `userID` to match the existing entities, and no experiment. Then create one parameter store named `<page>_params` with the same parameter names, each linked to the matching parameter in that page's layer.
5. After each creation, read it back and confirm the name, parameter types, defaults, and links. Compare the seven read-backs with `docs/statsig-params.yml`; any difference is a defect to log.
6. Never create, edit, start, or stop an experiment, gate, or dynamic config. Never delete anything, including entities you created. Never touch `pricing_cta_copy`, `metrics_account_breakdown`, `pricing_notice`, or the implicit layer `statsig::pricing_cta_copy_layer`. Never print or commit a key.

## Definition of done
1. 32 parameters across seven pages exist in code, `docs/statsig-params.yml`, and the templates, with exact defaults; none of the five overlap rows is touched.
2. `getPageParams(page)` is the only reader of stores and layers; defaults apply when a store, parameter, or SDK is missing; each parameter is read at most once per page load.
3. `npm run typecheck`, `npm run build`, `npm run smoke:phase6`, `smoke:phase0` to `smoke:phase4`, and `bot:dry-run` exit 0; the bot output hash equals the baseline; the two business events and the Amplitude boundary are unchanged.
4. Seven layers and seven stores exist in Statsig with the names above, each store parameter linked to its layer parameter, each read back and matching the docs; no experiment exists or started; no existing entity changed.
5. `git status` shows only allowed files; local commits only on `build/phase-6`; `package-lock.json` unchanged; nothing pushed.
6. UNVERIFIED by design, do not claim: live evaluation in a browser with the real client key, and the actual exposure events in Statsig.

## Report
Append one `PHASE_LOG.md` entry with the BUILDER.md template: pages covered, layers and stores created (names only), deviations, and anything left for the Planner. `COMPLETE` only if every criterion above passes; otherwise `BLOCKED` with what exists in Statsig. Commit it locally. Notify the Planner and stop. Wait for a new START dispatch.

## Forbidden
Push, PR, merge, deployment, or any other branch; any Statsig delete; any experiment, gate, or dynamic config write; any change to the three existing entities or the implicit layer; any file outside the allowed list; new dependencies; printing or committing a key or secret; production data; traffic or a browser run.

## Stop
After logging COMPLETE or BLOCKED, stop.
