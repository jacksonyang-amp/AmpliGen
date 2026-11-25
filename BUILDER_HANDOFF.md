# BUILDER_HANDOFF
**Status:** IDLE
**Phase:** 3 — Amplitude analytics and replay
**Dispatch ID:** phase-3-build-015 (reviewed; COMPLETE logged; local build/phase-3 at 8127b0d)
**Phase type:** BUILD
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Add the Amplitude Unified SDK (`@amplitude/unified`) behind one guarded `initAll()` call, and send the two approved business actions from the existing action registry to Amplitude through a sink. Page views and clicks come from Amplitude Autocapture, not custom events. Keep the site fully usable when no key is present. Statsig is Phase 4; do not add it.

## Prerequisites
- Phases 0, 1 and 2 are COMPLETE on `origin/main` (PHASE_LOG.md entries through `2026-11-25T04:10:14Z | Phase 2`; Phase 2 merge `cc19af9`).
- Scope authorization and Planner selections are recorded in DECISIONS.md on `origin/cursor/record-phase-3-decisions-fc41` (entries 2026-11-25T04:35:00Z and 2026-11-25T04:38:00Z). Read this handoff and those entries from that ref until its PR is merged: `git fetch origin cursor/record-phase-3-decisions-fc41`, then `git show origin/cursor/record-phase-3-decisions-fc41:BUILDER_HANDOFF.md` and `...:DECISIONS.md`. Do not check out or edit that branch.
- Also read PHASE_LOG.md, BUILDER.md, PROJECT_BRIEF.md, PROJECT_PLAN.md Phase 3, `docs/custom-events.yml` (read-only; the approved contract), `src/contract/`, `src/identity/`, `src/flow/handlers.ts`, `src/ui/forms.ts`, and `src/ui/runtime.ts`.
- Credentials: the human states that the Amplitude browser key is in the GitHub secret `NEXT_PUBLIC_AMPLITUDE_API_KEY`. The Planner cannot verify it. The workflow already maps it to `VITE_AMPLITUDE_API_KEY`; do not edit the workflow. Locally there is no key. Never print, log, or commit a key value. If any key-looking value appears in a file, stop and log BLOCKED.

## Verify before you integrate (BUILDER.md requires this)
Read the current official Amplitude documentation for `@amplitude/unified` and `initAll()` before writing integration code. Record in PHASE_LOG.md the SDK version installed, the documentation pages you used, and the answers to each item below. If any item cannot be satisfied, log BLOCKED with evidence; do not invent a workaround.
1. The exact `initAll()` signature and how to configure Analytics, Session Replay, Feature Experiment, and Guides & Surveys together in that one call.
2. How to configure Feature Experiment so Amplitude never assigns a variation: no variant fetch, no `variant()` or `exposure` calls, and no use of Amplitude flags. Statsig owns assignment (Phase 4). If the SDK cannot be initialized this way, log BLOCKED.
3. How to enable Autocapture for page views and clicks. Then confirm what each Autocapture feature records. It must not record the text a visitor types into form fields as an event property. If any Autocapture feature would put typed values, an email, or a name into an event, turn off that feature only, and log which one and why.
4. Session Replay settings (below), including the option names that control the sample rate and masking, and the SDK's default masking behavior.
5. Whether `track()` accepts an `insert_id` so `event_id` can be the dedupe key, and how to set the user ID and user properties.
6. Account-level reporting: whether it needs Amplitude account groups and which plan or entitlement it needs. The human approved sending `account_id` as an event property (DECISIONS.md 2026-11-25T04:35:00Z). If groups are documented and need no extra package, also set one group type `account` to `account_id` when mapped, and log it. If the entitlement is missing or unknown, keep the event property, log UNVERIFIED, and do not block.
7. How the SDK delivers events when the page navigates away right after `track()`. The forms emit and then immediately navigate.
8. Whether a Vite build that statically imports the SDK works with `base: '/AmpliGen/'`, and whether the SDK needs any other package installed. Transitive dependencies it installs by itself are fine. Do not install any other Amplitude package yourself.

## Planner selections (do not change)
**Contract.** Send exactly the two actions in `docs/custom-events.yml`, with the property names and values that `src/contract/actions.ts` already builds: `Demo Request Submitted` and `Sign Up Completed`. Do not add or rename events or properties. No Browse, page-view, or pricing custom event: Autocapture covers those (human answer, DECISIONS.md 2026-11-25T04:35:00Z). No `Experiment Exposure` event.

**Session Replay (human decision, DECISIONS.md 2026-11-25T04:38:00Z).** Capture 100% of sessions, with no masking: configure the least-masking level the SDK offers, and do not mask form inputs. Write the exact option names and values you set into PHASE_LOG.md. Do not change any visible form or page copy, even though the forms say nothing is sent; the human chose this with the conflict explained to them. Report it as a deviation note, not a failure. Keep the replay settings in one place so they are easy to change.

**Initialization.**
- One `initAll()` call site in the whole of `src/`, guarded. It runs only when `import.meta.env.VITE_AMPLITUDE_API_KEY` is a non-empty string. With no key, call nothing in the SDK, register no sink, make no network request, and leave every page working as in Phase 2.
- Run it at most once per page load even if called twice. Wrap it so a thrown error or a rejected promise is caught and the site keeps working.
- Keys are read only through `import.meta.env`. Add `src/vite-env.d.ts` if needed for typing.

**Identity.**
- Amplitude user ID is the contract `user_id`: the stored visitor ID, or the persona's fixed ID while a persona is active. Set it at startup. Set it again from the action itself immediately before each `track()` call, so it is correct after a persona swap or reset. Persona reset restores the visitor ID; it is not sign-out, and you must not call any reset or opt-out that rotates the device or user.
- User properties: set `is_synthetic` (boolean) from the identity, and `account_id` only when mapped. Never set a name or email.

**Sink.** Add an `ActionSink` named `amplitude` to the existing registry (`src/contract/registry.ts`). Attach it only when init succeeded. It sends each action once with `track(action.name, action.properties)` plus `insert_id` = `event_id` if the SDK supports it. The registry already drops duplicates and invalid actions; keep that. The bot runner and `smoke:phase2` must stay network-free and sinkless: do not attach this sink in `scripts/bot-runner.mjs`.

**Delivery before navigation.** Forms fire the action and then navigate. If the SDK does not itself guarantee delivery on page hide, add a small bounded wait: call the SDK's flush and wait at most 1000 ms, then navigate. With no sink, navigate immediately as now. Put this logic in a framework-free function under `src/analytics/` so the smoke can test it, and call it from `src/ui/forms.ts`.

**Module layout.** Keep all SDK imports in one adapter file, `src/analytics/amplitude-adapter.ts`. Everything else works against a small interface (init, setUserId, setUserProperties, track, flush) so `smoke:phase3` can run in Node with a fake SDK and never import the real package.

## Allowed files
- `package.json` (add `@amplitude/unified` to `dependencies` with the version npm resolves, and the script `smoke:phase3`; Node flags as used by `smoke:phase2`), `package-lock.json`
- `src/analytics/` (new), `src/vite-env.d.ts` (new, if needed), `src/main.ts`, `src/ui/runtime.ts`, `src/ui/forms.ts` (only the identity-sync call and the bounded flush before navigation; do not change fields, copy, or validation)
- `tsconfig.json` and `vite.config.ts` only if the SDK requires it; say why in the log
- `scripts/smoke-phase3.mjs` (new)
- `scripts/smoke-phase1.mjs` and `scripts/smoke-phase2.mjs`, limited to the assertions below. Authorization: DECISIONS.md 2026-11-25T04:38:00Z. Every other check stays.
  - Phase 1: "built scripts include no Amplitude or Statsig SDK code" becomes "built scripts include no Statsig code". "package.json declares no Amplitude or Statsig packages" becomes "no Statsig package and no Amplitude package other than `@amplitude/unified`". "package.json has no runtime dependencies" becomes "the only runtime dependency is `@amplitude/unified`". The network scan of `src/` for `fetch`, `XMLHttpRequest`, `sendBeacon`, and `WebSocket` stays and must pass.
  - Phase 2: the `src/` scan keeps every banned item except: the Amplitude, `initAll`, and environment-access items are allowed only inside `src/analytics/`, and only the exact `import.meta.env.VITE_AMPLITUDE_API_KEY` read. "package.json has no runtime dependencies" becomes "the only runtime dependency is `@amplitude/unified`". Dev dependencies stay `typescript` and `vite`. The bot runner and network-silence checks stay.
- `README.md` (commands, how the key is supplied, what is sent), `PHASE_LOG.md` (append only)
- Do not edit `.github/workflows/`, `scripts/smoke-phase0.mjs`, `scripts/bot-runner.mjs`, `docs/`, any `.html` page, `src/contract/`, `src/fixtures/`, `src/content/`, `PROJECT_BRIEF.md`, or any Planner-owned file. If `scripts/smoke-phase0.mjs` fails because of your change, log BLOCKED.

## Forbidden
- No Statsig package or code. No guide or survey content: enable the SDK capability only; the `data-guide-anchor` element on `/AmpliGen/welcome/` stays empty.
- No second Amplitude package installed by you (for example `@amplitude/analytics-browser`, `@amplitude/session-replay-browser`, `@amplitude/experiment-js-client`).
- No second `initAll()`, no custom event beyond the two approved actions, no Amplitude variation assignment, no email, name, or free text in any event, user property, or log line.
- No key value anywhere in the repository, build output, logs, or the PHASE_LOG.md entry.
- No browser automation, screenshots, or full test suites. Those belong to Phase 5. Real delivery to Amplitude is UNVERIFIED in this phase; say so.

## Steps
1. `git fetch origin main`. Create branch `build/phase-3` from `origin/main`. Branch creation is limited to this name.
2. Do the verification above and record the findings. Then implement the adapter, sink, identity sync, bounded flush, and `smoke:phase3`. Make the narrow Phase 1 and Phase 2 smoke edits.
3. Run these from the repository root. Each must pass:
   - `npm ci` (install only; run `npm install @amplitude/unified` first to add the dependency)
   - `npm run typecheck`: exit 0
   - `npm run build`: exit 0 with no key set, and `dist/` still has all seven route entries
   - `npm run smoke:phase3`: exit 0 (checks below)
   - `npm run smoke:phase2`, `npm run smoke:phase1`, `npm run smoke:phase0`, and `npm run bot:dry-run`: exit 0 (regression; the bot output is unchanged)
4. `smoke:phase3` must check, without a browser and with a fake SDK for the real one:
   - **Dependencies:** `package.json` runtime dependencies are exactly `@amplitude/unified`; no other `@amplitude/*` package is declared anywhere in `package.json`; no `@amplitude/*` import in `src/` outside `src/analytics/amplitude-adapter.ts`, and that file imports only `@amplitude/unified`; no Statsig package or import.
   - **Single guarded init:** `src/` has one `initAll(` call site. With a key and the fake SDK, calling init several times results in exactly one `initAll` call. With an empty or missing key, zero SDK calls are made, no sink is registered, and handlers still return their actions and destinations as in Phase 2. A throwing or rejecting SDK is caught and the handlers still work.
   - **Config handed to `initAll`:** the key is passed through; Analytics, Session Replay, Feature Experiment, and Guides & Surveys are all configured; Replay sample rate is 100% and not masked as chosen; Autocapture is on, with any feature turned off for the reason you logged; Feature Experiment is configured so no variation is assigned and no variant, exposure, or flag call is ever made on the fake.
   - **Event sequence:** run the four bot journeys through the shared handlers with the Amplitude sink attached to the fake. The fake receives exactly three `track` calls, in this order, with these names and the properties the contract builders produce: `Demo Request Submitted` (Priya), `Sign Up Completed` (Marcus), `Sign Up Completed` (Dana). Each call has `insert_id` = `event_id` if the SDK supports it. The invalid sign-up and the browse-only journey send nothing. All `traffic_source` values are `bot` and `is_synthetic` is true. No `event_id` repeats, and re-emitting an action sends nothing.
   - **Identity and properties:** the fake sees `setUserId` with the persona ID after a persona swap, the visitor ID after reset, and the action's `user_id` immediately before every `track`. `is_synthetic` is set as a user property; `account_id` is set only when mapped (Dana has none); the account group, if you implemented it, matches.
   - **Privacy:** no argument passed to any fake SDK method, and no config value, contains `@` or any fixture name (scan recursively).
   - **Delivery before navigation:** the bounded-flush function waits for flush up to the limit and then navigates, navigates after the limit if flush never resolves, navigates immediately with no sink, and never navigates twice.
   - **Network silence without a key:** with stubbed `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `node:http`, and `node:https`, running the Phase 2 handler and bot work with no key and no sink calls none of them.
   - **Built output:** `dist/` built without a key contains no key-like literal and no `fetch`-style call added by `src/` code; all seven routes still return HTTP 200 under `/AmpliGen/`.
5. Commit locally on `build/phase-3` in logical commits. Do not push. Do not open a PR. Do not merge.
6. Append one PHASE_LOG.md entry using the BUILDER.md template. Include commit SHAs, the SDK version, the documentation pages you used, the answers to the eight verification items, the exact replay settings, exact commands and results, and a PASS/FAIL/UNVERIFIED line for each criterion. State plainly that real delivery to Amplitude, replay capture, account-level reporting, and form behavior in a browser are UNVERIFIED in this phase. Commit it. Report COMPLETE or BLOCKED to the Planner and stop.

## Definition of done (from PROJECT_PLAN.md Phase 3)
1. `npm run typecheck` exits 0.
2. `npm run build` exits 0 with only `@amplitude/unified` as the direct Amplitude dependency and one guarded `initAll()` call, configuring Analytics, Session Replay, Feature Experiment, and Guides & Surveys together without Amplitude-controlled variation assignment.
3. `npm run smoke:phase3` uses a mocked SDK boundary to check one initialization, the agreed event sequence (Autocapture plus the two business actions), user and account properties, synthetic labels, no duplicate events, and usable no-key behavior; it also checks no separate Amplitude package was directly installed.

## Git permissions
- Branch creation: yes, `build/phase-3` only.
- Commit: yes, local commits on `build/phase-3` only.
- Push: no. PR creation: no. Merge: no. Deployment: no. Destructive git operations: no.
- Any push, PR, or merge needs a separate RESERVED approval in DECISIONS.md. A merge to `main` deploys the site with the key from the GitHub secret, which starts recording sessions to Amplitude. Stop after the local commit and PHASE_LOG.md entry.

## Stop
After logging COMPLETE or BLOCKED, stop. Do not start Phase 4.
