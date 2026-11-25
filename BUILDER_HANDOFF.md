# BUILDER_HANDOFF
**Status:** IDLE
**Phase:** 4 — Statsig experiments and controls
**Dispatch ID:** phase-4-build-018 (reviewed; COMPLETE logged at 0ad165d; IDLE)
**Phase type:** BUILD
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Add the Statsig web client SDK (`@statsig/js-client` only) behind one guarded initialization. Statsig assigns one pricing CTA experiment, one product feature gate, and one pricing dynamic config. The two existing business actions are also logged to Statsig, once each, with the same names and `event_id` already sent to Amplitude. With no key, the site shows the control content and makes no Statsig call.

## Prerequisites
- Phase 3 is deployed on `origin/main` at merge commit `b982f973d3e5fc93c1e9cb953a3fe61356670317`. Create `build/phase-4` from `origin/main`.
- Scope authorization and Planner selections are in DECISIONS.md on `origin/cursor/phase-4-handoff-fc41` (entry 2026-11-25T05:18:00Z). Read this handoff and that entry from that ref: `git fetch origin cursor/phase-4-handoff-fc41`, then `git show origin/cursor/phase-4-handoff-fc41:BUILDER_HANDOFF.md` and `...:DECISIONS.md`. Do not check out or edit that branch.
- Also read PHASE_LOG.md, BUILDER.md, PROJECT_BRIEF.md, PROJECT_PLAN.md Phase 4, `docs/custom-events.yml` (read-only), and the current `src/analytics/`, `src/contract/`, `src/flow/`, and `src/ui/` code.
- Credentials: the workflow already maps `secrets.NEXT_PUBLIC_STATSIG_CLIENT_KEY` to `VITE_STATSIG_CLIENT_KEY`. The Planner cannot verify that secret. Do not edit the workflow. Locally there is no key. Never print, log, or commit a key value. If any key-looking value appears in a file, stop and log BLOCKED.

## Verify before you integrate (BUILDER.md requires this)
Read the current official Statsig docs for `@statsig/js-client` and the current Statsig and Amplitude docs for exposure forwarding before writing code. Record the installed version, the doc URLs, and the answer to each item in PHASE_LOG.md. If an item cannot be satisfied, log BLOCKED with evidence. Do not invent an integration.
1. The current package name and the initialize call. Use `@statsig/js-client` only. Do not install `@statsig/session-replay`, `@statsig/web-analytics`, `statsig-js`, or any other Statsig package. Amplitude already records sessions and page views.
2. How `getExperiment`, `checkGate`, and `getDynamicConfig` log one exposure each, and how to avoid a second exposure if the page evaluates twice.
3. How exposure forwarding to Amplitude actually works. As of the Planner's check on 2026-11-25, the supported path is the Statsig console integration "Amplitude Native", which forwards exposures from Statsig's servers. It is not a client call. Confirm or correct that against the docs you read.
4. The `logEvent` metadata types. The contract properties include booleans. Convert them only in the way the current SDK documents, keep `event_id`, and do not drop required properties.
5. How to set and update the Statsig user, and how to flush before a navigation.

## Planner selections (do not change)
**Assignment unit.** The Statsig `userID` is the contract `user_id` (the stable visitor id, or the persona id while a persona is active). It is the same id Amplitude uses. Set it at startup and again on persona activation, persona clear, and sample-visitor reset, at the same points `getAnalytics().syncIdentity()` already runs. Custom attributes are `is_synthetic` and, only when mapped, `account_id`. Never set an email, a name, or free text. Do not derive the id from an email.

**Experiment `pricing_cta_copy`.** Hypothesis: more specific pricing CTA labels increase `Sign Up Completed` among visitors who see pricing, without changing where each button goes. `Demo Request Submitted` is the secondary metric. Synthetic results are not causal evidence. Parameter `label_mode`. Control value `control` keeps the current labels. Treatment value `specific` changes only the visible labels: Starter and Growth become "Start a free trial"; Enterprise becomes "Talk to sales". All three hrefs stay as they are. Any missing, failed, or unrecognized value uses the control labels. Evaluate once when the pricing page shows the plans, not on click.

**Gate `metrics_account_breakdown`.** On the product page, under the AmpliGen Metrics card, a section is hidden unless the gate passes. The section text is exactly "Account breakdown shows usage and conversion for the mapped account." Do not insert an account name, email, or other identity. Fallback is hidden. Evaluate once when the product page renders.

**Dynamic config `pricing_notice`.** String parameter `notice`, rendered as text into the existing `[data-pricing-label]` element. Fallback, and the no-JavaScript text, stays "Illustrative pricing. Not offered." If the value is missing, not a string, or longer than 120 characters, use the fallback. Do not interpret the value as HTML. Evaluate once when the pricing page renders.

**Events.** Keep sending `Demo Request Submitted` and `Sign Up Completed` to Amplitude exactly as Phase 3 does. Also send each once to Statsig with `logEvent`, using the same event name, the same `event_id`, and the same contract properties. Do not add a business event. Do not send an `Experiment Exposure` event from this site. Do not call Amplitude `track` for a Statsig exposure. If the docs confirm that forwarding is the console integration, log live forwarding as UNVERIFIED and do not build a client-side forwarder. A console setting that also forwards these two custom events would duplicate them in Amplitude, because this site already sends them; record that and do not try to turn the console setting off from code.

**Initialization.** One Statsig client for the page. Initialize only when `import.meta.env.VITE_STATSIG_CLIENT_KEY` is a non-empty string. With no key, call nothing in the SDK, show the control labels, hide the gate section, keep the fallback notice, and leave every existing flow working. Run initialization at most once per page load. A thrown error or a rejected initialize keeps the fallbacks and the page working. Environment tier is `production`.

**Delivery before navigation.** The forms already flush Amplitude and wait at most 1000 ms, then navigate once. Join the Statsig flush to that same wait. Do not add a second wait, and do not navigate twice. With no Statsig client, behavior stays as it is now.

## Allowed files
- `package.json` (add `@statsig/js-client` and the script `smoke:phase4`), `package-lock.json`
- `src/statsig/` (new). All `@statsig/js-client` imports live in one adapter file, `src/statsig/statsig-adapter.ts`. Everything else, including `smoke:phase4`, uses a small fake-able interface.
- `src/main.ts`, `src/ui/forms.ts` (only the existing identity-sync and flush call sites; do not change fields, copy, or validation)
- `pricing/index.html` and `product/index.html` only for the hooks the experiment, gate, and notice need. Do not change control labels, hrefs, or other copy in the HTML. The treatment labels are applied by script.
- `src/style.css` only if the hidden gate section needs a rule that already matches the site
- `scripts/smoke-phase4.mjs` (new)
- `scripts/smoke-phase1.mjs`, `scripts/smoke-phase2.mjs`, and `scripts/smoke-phase3.mjs`, limited to the assertions below. Authorization: DECISIONS.md 2026-11-25T05:18:00Z.
  - Where a check says there is no Statsig package, no Statsig import, or no Statsig code in `src/` or `dist/`, allow only `@statsig/js-client`, imported only from `src/statsig/statsig-adapter.ts`. Any other Statsig package or import still fails.
  - The `src/` network scan keeps every banned item except Statsig SDK calls inside `src/statsig/`. Amplitude rules from Phase 3 stay as they are.
  - "the only runtime dependency is `@amplitude/unified`" becomes "the only runtime dependencies are `@amplitude/unified` and `@statsig/js-client`".
- `README.md` (the new command, the key name, the three Statsig names, and what is sent), `PHASE_LOG.md` (append only)
- Do not edit `.github/workflows/`, `scripts/smoke-phase0.mjs`, `scripts/bot-runner.mjs`, `docs/`, `src/contract/`, `src/fixtures/`, `src/content/`, `src/analytics/` except the shared flush hook if the current function cannot accept a second flush without it, `PROJECT_BRIEF.md`, or any Planner-owned file. If `scripts/smoke-phase0.mjs` fails because of your change, log BLOCKED.

## Forbidden
- No second Statsig package. No Amplitude experiment, variant, or flag evaluation. Amplitude Feature Experiment stays off, as Phase 3 left it.
- No guide or survey content. No change to visible form copy.
- No email, name, or free text in a Statsig user, event, gate, or config value that this repo sets.
- No key value anywhere in the repository, build output, logs, or PHASE_LOG.md.
- No live bot traffic and no network from `scripts/bot-runner.mjs`. Dry-run only.
- No browser automation, screenshots, or full test suites. Those belong to Phase 5.
- Do not create the Statsig console experiment, gate, or config, and do not claim they exist. Live assignment is UNVERIFIED until those exist in the project named below.

## Steps
1. `git fetch origin main`. Create branch `build/phase-4` from `origin/main`. Branch creation is limited to this name.
2. Do the verification above and record it. Then implement the adapter, the three evaluations, the Statsig event log, the shared flush, and `smoke:phase4`. Make the narrow Phase 1, 2, and 3 smoke edits.
3. Run these from the repository root. Each must pass:
   - `npm ci`
   - `npm run typecheck`: exit 0
   - `npm run build`: exit 0 with no key set, and `dist/` still has all seven route entries
   - `npm run smoke:phase4`: exit 0
   - `npm run smoke:phase3`, `npm run smoke:phase2`, `npm run smoke:phase1`, `npm run smoke:phase0`, and `npm run bot:dry-run`: exit 0. The bot output is unchanged.
4. `smoke:phase4` must check, without a browser and with a fake Statsig client:
   - Runtime dependencies are exactly `@amplitude/unified` and `@statsig/js-client`. No other `@statsig/*` import exists outside `src/statsig/statsig-adapter.ts`.
   - One initialize call when the key is a non-empty string. A second start does not create a second client. An empty key makes zero SDK calls, shows control labels, hides the gate, keeps the fallback notice, and still returns the Phase 2 actions.
   - A throwing or rejecting client is caught and the fallbacks still render.
   - Control and `specific` change only the three CTA labels. Hrefs do not change. An unknown `label_mode` uses the control labels.
   - The gate fixture shows the Metrics section only when the gate passes. The section text is the sentence above and contains no `@` and no persona or account name.
   - The notice fixture replaces the pricing label. A non-string or a string over 120 characters keeps the fallback. The notice is assigned as text, not HTML.
   - Evaluating each of the three twice logs one exposure each, not two.
   - Replaying the bot journeys logs exactly three Statsig events, in order: `Demo Request Submitted` (Priya), `Sign Up Completed` (Marcus), `Sign Up Completed` (Dana). Each carries the contract `event_id`. The invalid sign-up and the browse-only journey log nothing. The Amplitude sink still receives those same three events and no exposure event. No `event_id` is repeated.
   - The fake user id is the persona id after a swap and the visitor id after reset. No argument contains `@` or a fixture name.
   - With no key, stubbed `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `node:http`, and `node:https` are not called.
   - `dist/` built without a key contains no key-like literal. All seven routes still return HTTP 200 under `/AmpliGen/`.
5. Commit locally on `build/phase-4`. Do not push. Do not open a PR. Do not merge.
6. Append one PHASE_LOG.md entry using the BUILDER.md template. Include commit SHAs, the SDK version, the doc pages, the verification answers, the exact experiment, gate, and config names, commands and results, and PASS, FAIL, or UNVERIFIED for each criterion. State that live Statsig assignment, exposure forwarding, and delivery of the two events to Statsig are UNVERIFIED. Commit that entry. Report COMPLETE or BLOCKED and stop.

## Definition of done (from PROJECT_PLAN.md Phase 4)
1. `npm run typecheck` exits 0.
2. `npm run build` exits 0 with the pricing CTA experiment, the product feature gate, the pricing dynamic config, and the safe fallbacks above. The bot runner stays the Phase 2 dry-run. The event and identity contract is unchanged.
3. `npm run smoke:phase4` checks the control and treatment fixtures, the gate and config fixtures, fallbacks, one exposure per evaluation, no client-side exposure event on the Amplitude boundary, and the same conversion identities and events at both boundaries.

## Git permissions
- Branch creation: yes, `build/phase-4` only.
- Commit: yes, local commits on `build/phase-4` only.
- Push: no. PR creation: no. Merge: no. Deployment: no. Destructive git operations: no.
- A merge to `main` deploys the site. If the Statsig client key is present, the deployed site will initialize Statsig and send the two business actions and the exposures. That merge is not approved.

## Stop
After logging COMPLETE or BLOCKED, stop. Do not start Phase 5.
