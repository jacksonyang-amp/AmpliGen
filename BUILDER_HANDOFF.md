# BUILDER_HANDOFF
**Status:** IDLE
**Phase:** 2 — Simulated conversions and identities
**Dispatch ID:** phase-2-build-012 (reviewed; COMPLETE logged)
**Phase type:** BUILD
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Add validated demo-request and sign-up forms with simulated success pages, deterministic visitor/account fixtures, an application identity/action contract, and a dry-run bot runner that replays journeys through that same contract. No data leaves the browser, and no vendor SDK is used.

## Prerequisites
- Phases 0 and 1 are COMPLETE on `origin/main` (PHASE_LOG.md entries `2026-11-25T03:18:00Z | Phase 0` and the Phase 1 entries, merge `2abd6ff`).
- Scope authorization: the human's "Start Phase 2" is recorded in DECISIONS.md at 2026-11-25T03:57:00Z, with the Planner selections.
- Read this handoff from `origin/cursor/phase-2-handoff-fc41` until its PR is merged. Also read PHASE_LOG.md, BUILDER.md, PROJECT_BRIEF.md, PROJECT_PLAN.md Phase 2, and `docs/custom-events.yml` (read-only; it is the contract basis).

## Contract (Planner selections; do not change)
Use the exact names and properties in `docs/custom-events.yml`. Browsing is not an action.

**Actions** (build them in one shared contract module; each is a plain object `{ name, properties }`):
- `Demo Request Submitted`: properties `event_id`, `user_id`, `account_id` (omit when unmapped), `is_synthetic`, `traffic_source`, `product_id`, `plan_id` (optional), `entry_point`, `is_simulated` (always true), `submission_id`.
- `Sign Up Completed`: properties `event_id`, `user_id`, `account_id` (omit when unmapped), `is_synthetic`, `traffic_source`, `product_id`, `plan_id` (required), `entry_point`, `is_simulated` (always true), `identity_method`, `account_mapping_status`.
- Enums: `traffic_source` is `manual_demo`, `bot`, or `visitor`; `entry_point` is `product`, `pricing`, `navigation`, or `direct`; `identity_method` is `predefined_persona` or `company_email`; `account_mapping_status` is `mapped` or `unmapped`.
- No action, stored identity, or bot output may contain an email address, a name, or free text.

**IDs:** `product_id` is `ampligen_gateway`, `ampligen_metrics`, or `ampligen_connect`. `plan_id` is `starter`, `growth`, or `enterprise`. Sign-up accepts only `starter` and `growth`; demo request accepts all three or none.

**Identity:**
- `visitor_id`: `vis_` plus 12 random hex characters, created once per browser and saved in `localStorage` key `ampligen.identity.v1` with the optional `personaId`, `accountId`, and `mappingStatus`. It never derives from an email and never changes except by clearing storage.
- A predefined persona temporarily replaces `user_id` with the persona's fixed ID. Resetting clears `personaId`, `accountId`, and `mappingStatus` and restores `user_id` to the saved `visitor_id`. Reset is not sign-out and does not rotate the visitor ID.
- `identity_method` is `predefined_persona` only if a persona is active and the entered email equals that persona's email. Otherwise it is `company_email`, and the persona is cleared before the action is built.
- Email-to-account mapping: trim and lowercase the email, then match the exact domain against the fixture accounts. A match gives `mapped` and that `account_id`. A free-mail or unknown domain gives `unmapped`, and no `account_id` is stored or emitted. Store nothing derived from an unmatched domain.
- `is_synthetic` is true for any persona, any bot, or any email whose domain ends in `.example`. Otherwise false. `traffic_source` is `bot` for the bot runner, `manual_demo` for a persona or `.example` entry by a person, and `visitor` otherwise.
- `entry_point`: track the previous internal page path in `sessionStorage`, updating it only when the path changes (so a reload does not overwrite it). `/AmpliGen/product/` gives `product`, `/AmpliGen/pricing/` gives `pricing`, any other internal page gives `navigation`, and none gives `direct`.

**Fixtures** (new files under `src/fixtures/`):
- Accounts: `acct_northwind_labs` (domain `northwind-labs.example`), `acct_globex_retail` (`globex-retail.example`), `acct_initech_systems` (`initech-systems.example`). Include a free-mail list: `freemail.example`, `gmail.com`, `outlook.com`, `yahoo.com`, `icloud.com`, `proton.me`.
- Personas, with fixed user IDs: `persona_priya_nair` (Priya Nair, `priya.nair@northwind-labs.example`, Northwind Labs), `persona_marcus_lee` (Marcus Lee, `marcus.lee@globex-retail.example`, Globex Retail), `persona_sam_ortiz` (Sam Ortiz, `sam.ortiz@initech-systems.example`, Initech Systems), `persona_dana_wu` (Dana Wu, `dana.wu@freemail.example`, no account, so unmapped).
- Bot journeys (four, deterministic): (1) Northwind persona: visit `/`, visit `/product/`, visit `/pricing/`, submit demo request. (2) Globex persona: visit `/`, visit `/pricing/`, submit sign-up on `growth`. (3) Initech persona: visit `/product/`, visit `/pricing/`, then stop with no conversion. (4) Dana persona: visit `/`, submit an invalid sign-up (bad email), then a valid sign-up on `starter`. Bot user IDs are fixed (`bot_visitor_001` and so on) where no persona applies; each journey names its persona or bot ID, and its steps.
- All fixture emails use the reserved `.example` TLD (`freemail.example` included). The bot never uses a real address.

## Routes and UI
- `/AmpliGen/demo-request/`: form with name (required, 1-80 characters), work email (required, valid, at most 254 characters), product (required select), plan (optional select). Persona select ("Sample visitor") that prefills name and email, and a "Reset sample visitor" button. Keep the visible copy: "Nothing you enter is sent anywhere." and a note that the request is simulated.
- `/AmpliGen/demo-request/success/`: simulated success page. Copy states the request is simulated and nothing was sent.
- `/AmpliGen/sign-up/`: form with name, work email, product (required), plan (required, `starter` or `growth`). No password field. Same persona select and reset button. Keep the copy "This sign-up is simulated. No account is created and nothing is sent."
- `/AmpliGen/welcome/`: mock product landing page with a heading, links to the product page, a "Reset sample visitor" button, and an empty `<div id="guide-anchor" data-guide-anchor></div>` for a future guide. No guide code.
- Valid submit: build the action, emit it once, then navigate (demo request to `/AmpliGen/demo-request/success/`, sign-up to `/AmpliGen/welcome/`). Invalid submit: show inline field errors (`role="alert"` or `aria-describedby`), do not emit, do not navigate. Reloading a destination page must not emit.
- Forms use real labels, `autocomplete` attributes, and `novalidate` with script validation. The form has no `action` attribute that sends anywhere. Without script, show a short note that the form needs JavaScript.
- Avoid the words "fictional" and "demo" as descriptions of the site (the human's rule, DECISIONS.md 2026-11-25T03:43:00Z). The existing "Demo request" nav label and "Request a demo" CTAs stay.

## Implementation requirements
- One shared implementation: put validation, identity, mapping, and the action builders in framework-free TypeScript modules under `src/` (for example `src/contract/` and `src/identity/`) that import nothing from the DOM. `src/` form wiring calls them. The bot runner and `smoke:phase2` import the same modules. Do not duplicate any logic.
- Inject storage, an ID generator, and a clock-free sequence so handlers are deterministic in Node. Provide an in-memory storage for Node.
- Provide an `ActionSink` registry with no default sink. Emitting with no sink does nothing, and a duplicate `event_id` is ignored. Phase 3 will attach sinks; do not add any sink that sends data.
- Running TypeScript in Node: Node here is 22.23 and strips types by default; `package.json` declares `>=22.12.0`. Use only erasable syntax (no enums, namespaces, or parameter properties), set `erasableSyntaxOnly` and `allowImportingTsExtensions` in `tsconfig.json` if needed, and add `--experimental-strip-types` to the npm scripts if the engine floor requires it. If you cannot share the modules without a new dependency, log BLOCKED rather than duplicating logic or adding a package.
- `scripts/bot-runner.mjs`: reads the bot-journey fixture and replays each journey through the shared handlers using an in-memory store and a deterministic counter. `--dry-run` is the only supported mode, and it is the default. Any other mode must exit nonzero with a message that live traffic is not authorized. Output is JSON Lines on stdout, in order: `seq`, `journey_id`, `bot_id`, the step, and for conversion steps the resulting action or the validation errors. Same output on every run. It makes no network call and reads no environment value.
- No `fetch`, `XMLHttpRequest`, `sendBeacon`, or `WebSocket` in `src/`. `smoke:phase1` already scans for these.

## Allowed files
- `src/` (new modules, fixtures, form wiring, `main.ts`, `style.css`)
- `demo-request/index.html`, `demo-request/success/index.html`, `sign-up/index.html`, `welcome/index.html`
- `vite.config.ts` (add the two new route inputs only), `tsconfig.json` (only options the shared modules need), `package.json` (scripts `smoke:phase2` and `bot:dry-run`; `engines` only if required; no dependencies)
- `scripts/bot-runner.mjs`, `scripts/smoke-phase2.mjs`
- `scripts/smoke-phase1.mjs` and `src/content/phase1.fixtures.json`, limited to: the "no form controls" check no longer applying to `/demo-request/` and `/sign-up/`, and the placeholder-notice checks and fixture copy for those two pages. Authorization: DECISIONS.md 2026-11-25T03:57:00Z. Every other Phase 1 check stays.
- `README.md` (routes, commands, identity rules), `PHASE_LOG.md` (append only)
- Do not edit `.github/workflows/`, `scripts/smoke-phase0.mjs`, `docs/`, `pricing/index.html`, `product/index.html`, `index.html`, `PROJECT_BRIEF.md`, or any Planner-owned file.

## Forbidden
- No new npm dependency. No `@amplitude/*` or Statsig package, `initAll()`, or analytics or flag code.
- No authentication, password field, backend, lead delivery, or payment code. No network call of any kind.
- No keys, secrets, or environment values. No real email address anywhere.
- No browser automation, screenshots, or full test suites. Those belong to Phase 5.

## Steps
1. `git fetch origin main`. Create branch `build/phase-2` from `origin/main`. Branch creation is limited to this name.
2. Implement the shared modules, fixtures, forms, new routes, bot runner, and `smoke:phase2`. Make the narrow Phase 1 smoke edits.
3. Run these from the repository root. Each must pass:
   - `npm ci` (install only)
   - `npm run typecheck`: exit 0
   - `npm run build`: exit 0, and `dist/` has `index.html`, `product/`, `pricing/`, `demo-request/`, `demo-request/success/`, `sign-up/`, and `welcome/` entries
   - `npm run smoke:phase2`: exit 0 (checks below)
   - `npm run bot:dry-run`: exit 0, with the expected ordered output
   - `npm run smoke:phase1` and `npm run smoke:phase0`: exit 0 (regression)
4. `smoke:phase2` must check, without a browser:
   - invalid input is rejected for each of: empty name, name over 80 characters, missing email, malformed email, email over 254 characters, missing product, unknown product, sign-up without a plan, sign-up with `enterprise`; each returns field errors, emits nothing, and gives no destination
   - a predefined persona gives its fixed user ID, `predefined_persona`, a mapped account (or unmapped for Dana), and `manual_demo`, `is_synthetic` true
   - a `.example` company email with no persona gives the visitor ID, `company_email`, mapped for a fixture domain, `manual_demo`, `is_synthetic` true
   - an unknown domain and a free-mail domain each give `unmapped` with no `account_id` key; a real-looking non-`.example` address gives `visitor` and `is_synthetic` false
   - a persona with a different entered email is cleared and gives `company_email`
   - success destinations are `/AmpliGen/demo-request/success/` and `/AmpliGen/welcome/`
   - user ID and account ID are stable across repeated runs and across the sign-up (same visitor ID before and after)
   - persona reset clears persona and account, restores the original visitor ID, and does not rotate it
   - each valid submission emits exactly one action; an invalid one emits none; re-emitting the same `event_id` is ignored
   - no action, stored record, or bot output contains an email or a name (scan for `@` and the fixture names)
   - during all handler and bot work, stubbed `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `node:http`, and `node:https` request functions are never called; `src/` has no network API and `package.json` has no Amplitude, Statsig, or other runtime dependency
   - the bot dry-run output equals the expected ordered actions and identities for the four journeys, is identical across two runs, and a non-dry-run mode exits nonzero
   - the built output serves under `/AmpliGen/`: each of the seven routes returns HTTP 200; the forms have labeled fields, no password input, and no `action` URL; `welcome` has `data-guide-anchor`; the new pages contain none of "Lumora", "fictional", or "Fictional demo"
5. Commit locally on `build/phase-2` in logical commits. Do not push. Do not open a PR. Do not merge.
6. Append one PHASE_LOG.md entry using the BUILDER.md template, with commit SHAs, exact commands and results, and a PASS/FAIL/UNVERIFIED check per criterion. Browser behavior of the forms is UNVERIFIED in this phase and belongs to Phase 5; say so. Commit it. Report COMPLETE or BLOCKED to the Planner and stop.

## Definition of done (from PROJECT_PLAN.md Phase 2)
1. `npm run typecheck` exits 0.
2. `npm run build` exits 0 with validated forms, a simulated success page, a mock product landing page prepared for a future guide, and a repo-fixture bot runner that uses the application's identity/action contract.
3. `npm run smoke:phase2` exercises the form and identity handlers with invalid input, a predefined persona, and a fictional company email; checks success destinations, stable user and account IDs, and persona-reset behavior; confirms no authentication or lead-delivery request is made; and the bot dry-run emits the expected ordered actions and identities without sending telemetry.

## Git permissions
- Branch creation: yes, `build/phase-2` only.
- Commit: yes, local commits on `build/phase-2` only.
- Push: no. PR creation: no. Merge: no. Deployment: no. Destructive git operations: no.
- Any push, PR, or merge needs a separate RESERVED approval in DECISIONS.md. Stop after the local commit and PHASE_LOG.md entry.

## Stop
After logging COMPLETE or BLOCKED, stop. Do not start Phase 3.
