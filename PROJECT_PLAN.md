# B2B software demo project plan

## Execution rules
- Status: ACTIVE — Phase 0 COMPLETE (2026-11-25T03:26:00Z). Phase 1 is ACTIVE: dispatch `phase-1-build-007` (BUILD). The Planner issues each START handoff with a unique dispatch ID, phase ID/type, Builder ID, allowed files, commands, and permissions.
- Builder (the one Builder for this project): agent ID `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`; link https://cursor.com/agents/bc-26af2fe0-92fa-5211-810f-eb3a21fea559. Never start a replacement.
- Human communication and approvals happen only in the Cursor chat with the Planner; the Builder reports through PHASE_LOG.md and the agent channel.
- Execute phases in order with one Builder. Keep every merged revision usable on GitHub Pages; use safe defaults when SDK configuration or network requests are unavailable.
- Git authority defaults to none. For every phase, the handoff may grant Commit yes; Merge remains no until a separate, single-use approval dispatch authorizes the exact PR, reviewed head, merge action, and resulting deployment.
- Branch creation, push, and PR creation require explicit handoff permissions. Never infer them from Commit yes. Every merge below requires human approval because it can deploy the public site.
- Use only GitHub Pages and GitHub Actions. Add no backend, real authentication, lead delivery, payments, or business-system integrations. Defer chatbot, guide creation, and survey creation.
- For BUILD phases, require `npm run typecheck`, `npm run build`, and exactly one phase-specific smoke command defined below. Each smoke command must exit nonzero on failure and run without browser automation; do not add full suites or screenshots.
- Use the repository’s existing package manager equivalents if present; record the exact commands in the handoff. The Builder implements each smoke command in its phase.
- Reserve full browser QA for Phase 5. The Planner reviews command evidence before marking any phase complete. Phase 0 additionally requires its approved public deployment to be verified; local build success alone does not complete it.

## Phase 0 — Static scaffold and deployment
- **Type:** BUILD
- **Objective:** Create a minimal static site that GitHub Actions can build and deploy to GitHub Pages.
- **Definition of done:**
  1. `npm run typecheck` exits 0.
  2. `npm run build` exits 0 and produces static output with a visible home page, navigation shell, and no server runtime requirement.
  3. `npm run smoke:phase0` serves the built output under the configured repository base path and confirms the home page and referenced local assets return HTTP 200; the workflow uses the same build command and uploads that output to Pages.
  4. After the approved merge/deployment, a follow-up dispatch confirms a successful Actions run for the merged revision and HTTP 200 with the expected home-page content at the public URL; record the URL, revision, and run link in PHASE_LOG.md. Keep Phase 0 open until this passes.
- **Risks:** Repository/base-path configuration, Pages availability, and Actions permissions may need human setup. The Planner reviews local checks for merge readiness, obtains approval, and dispatches deployment verification within Phase 0; do not mark the phase complete or start Phase 1 before the live check passes.
- **Review of dispatch `phase-0-build-001` (UTC 2026-11-25):** Builder logged BLOCKED in PHASE_LOG.md at `build/phase-0` commit `45cf2089a3d903f09061d5717b873c39f0037b12` (code `253badcf20a5a232fc5150a33fdab3c7e2251ba8`); not pushed. Planner independently re-ran in a clean worktree: `npm run typecheck` exit 0 (PASS); `npm run build` exit 0 with static `dist/` (PASS); `npm run smoke:phase0` exit 0, 23 passed (PASS). Scope check: only allowed files changed; no SDKs, forms, backend, or key literals (secret scan clean). Criterion 4 (public deployment verified) is UNVERIFIED. **Phase 0 stays open; Phase 1 not started.** Push and PR creation for `build/phase-0` are authorized and held until `main` no longer contains `node_modules/` or `dist/`. Merge and deployment are not authorized.
- **Status:** COMPLETE (2026-11-25T03:26:00Z). Criteria 1-3 PASS. Criterion 4 PASS: live deployment on PR #6 merge `c8593de`, and the record on `main` (PR #9, merge `950692b665d86dcf206809a01c5c518592aaa3da`, Pages run https://github.com/jacksonyang-amp/AmpliGen/actions/runs/45539939585 succeeded on that SHA). The record is `PHASE_LOG.md` entry `2026-11-25T03:18:00Z | Phase 0 | COMPLETE`. Phase 1 may be drafted but not started until the human says so. Earlier status (superseded): OPEN pending the Builder's `PHASE_LOG.md` record (dispatch `phase-0-log-004`). Criteria 1-3 PASS (Planner re-ran typecheck, build, and `npm run smoke:phase0` on `main` at `9daf225`: all exit 0, 23 passed). Criterion 4, live part: PASS — PR #6 merged to `main` as `c8593de06523a07b596a4cef28967ec0d7f49c2b` after the human’s named Approve; Pages run https://github.com/jacksonyang-amp/AmpliGen/actions/runs/45538301854 succeeded on that SHA; https://jacksonyang-amp.github.io/AmpliGen/ returns HTTP 200 with `<title>API Platform Demo</title>` and its assets return 200. Criterion 4, record part: FAIL — the criterion requires the URL, revision, and run link in PHASE_LOG.md, and `main` holds only the earlier BLOCKED entry. An earlier revision of this line marked Phase 0 COMPLETE before that record existed; this corrects it. Phase 1 stays unstarted until Phase 0 is COMPLETE.
- **Needs human approval to merge?** Yes (done for PR #6).
- **Git permissions for the Builder:** Push, PR, and merge were each approved separately for this phase only; no further git authority is granted for Phase 1.

## Phase 1 — Product and pricing pages
- **Type:** BUILD
- **Objective:** Add the fictional platform’s product and pricing pages with working navigation to demo and trial entry points.
- **Definition of done:**
  1. `npm run typecheck` exits 0.
  2. `npm run build` exits 0 with home, product, pricing, demo-request, and sign-up routes; unfinished forms display clear temporary information instead of broken controls.
  3. `npm run smoke:phase1` confirms those routes resolve from the built site and checks the product names, pricing copy, and CTA destinations against the phase’s content fixtures.
- **Planner selections (fixed for this phase; the Builder must not change them):**
  - Platform name: Lumora API Platform (fictional demo name).
  - Products: Lumora Gateway (route, authenticate, and rate-limit API traffic); Lumora Metrics (usage and conversion by account and team); Lumora Connect (webhooks and prebuilt business-tool connectors).
  - Plans, labeled "Illustrative demo pricing. Not offered.": Starter $49 per month, CTA "Start a trial" to `/AmpliGen/sign-up/`; Growth $249 per month, CTA "Start a trial" to `/AmpliGen/sign-up/`; Enterprise custom pricing, CTA "Request a demo" to `/AmpliGen/demo-request/`.
  - Routes: `/AmpliGen/`, `/AmpliGen/product/`, `/AmpliGen/pricing/`, `/AmpliGen/demo-request/`, `/AmpliGen/sign-up/`. Demo-request and sign-up show temporary notices with no input fields.
  - Smoke command: `npm run smoke:phase1`. Regression: `npm run smoke:phase0` must still exit 0.
- **Status:** COMPLETE (2026-11-25T03:52:00Z). Criteria 1-3 PASS on merge commit `2abd6ff9dc6205a884e3ccf0555e452282becf32` (PR #12, merged under the named approval at 2026-11-25T03:51:00Z). Pages run 45542736922 succeeded; the five routes return HTTP 200. Phase 2 has not started. Earlier status (superseded): ACTIVE — dispatched as `phase-1-build-007` on 2026-11-25T03:35:00Z after the Cursor-chat instruction "Start with Phase 1". No push, PR, or merge is authorized for this phase's Builder work yet.
- **Review of dispatch `phase-1-build-007` (UTC 2026-11-25T03:42:00Z):** Builder logged COMPLETE on local `build/phase-1`, head `3a6ba6d4ad639e53ae7ca3e1e4494a857fcf89f1` (code `0b3a6dd69d36f4fb417a05184174478341e9dd45`); not pushed. Planner re-ran the checks in a clean worktree at that head: `npm ci` exit 0; `npm run typecheck` exit 0 (criterion 1 PASS); `npm run build` exit 0 with `dist/` holding all five route `index.html` files (criterion 2 PASS); `npm run smoke:phase1` exit 0, 91 passed (criterion 3 PASS); regression `npm run smoke:phase0` exit 0, 28 passed. Scope: all 12 changed files are on the allowed list; `package.json` adds only the `smoke:phase1` script; no lockfile, workflow, or Planner-file change; no input, form, `fetch`, SDK, or key-like literal in app source. Fixed content matches the Planner selections (names, prices, label, CTA hrefs, notice copy).
- **Planner correction (not a criterion failure):** the Planner's handoff told the Builder to keep Phase 0 home content. As a result the home page still says "API Platform Demo" and "Product, pricing, and account pages will be added in later phases", which would be false once published, and its hero buttons only jump to on-page anchors instead of the new pages. **Phase 1 stays ACTIVE and unpushed** until dispatch `phase-1-fix-008` aligns the home page and the Planner re-reviews. Dispatch `phase-1-fix-008` was issued at 2026-11-25T03:43:00Z; it edits the home page, its fixture entries, and `smoke:phase1` only.
- **Review of dispatch `phase-1-fix-008` (UTC 2026-11-25T03:45:00Z):** Builder logged COMPLETE on local `build/phase-1`, head `3a1a163a624d050fbb9906c4e4a1b4f59c286ba8`. The Planner re-ran `npm ci`, `npm run typecheck`, `npm run build`, `npm run smoke:phase1` (105 passed), and `npm run smoke:phase0` (28 passed) in a clean worktree at that head, all exit 0. The built home page has title `Lumora API Platform Demo`, no "will be added in later phases" text, and hero links to `/AmpliGen/product/` and `/AmpliGen/pricing/`. Scope: the changed files are the allowed set only, and `package.json` adds only the `smoke:phase1` script. Criteria 1-3 PASS. **Phase 1 is ready for push and PR approval.** It is not complete until the human approves the push and PR and the Planner records the review after that. **Scope change (2026-11-25T03:43:00Z):** the human asked for the product name to be AmpliGen and for site references to it being fictional or a demo to be removed. Dispatch `phase-1-fix-009` carries this out, with one authorized edit to two assertions in `scripts/smoke-phase0.mjs`. Re-review is required before any push approval is requested. **Review of dispatch `phase-1-fix-009` (UTC 2026-11-25T03:48:00Z):** Builder logged COMPLETE on local `build/phase-1`, head `937b0f52d4921b96b8bd898c88c5a87e8b838609`. The Planner re-ran `npm ci`, typecheck, build, `smoke:phase1` (144 passed), and `smoke:phase0` (28 passed) in a clean worktree at that head, all exit 0. Built titles are `AmpliGen`, `Product | AmpliGen`, `Pricing | AmpliGen`, `Request a demo | AmpliGen`, and `Sign up | AmpliGen`. A scan of the built HTML found no `Lumora`, `fictional`, `demonstration`, `demo-banner`, or `API Platform Demo` outside attribute values. `scripts/smoke-phase0.mjs` changed only its two assertions on lines 83-84. Scope matches the allowed list. Criteria 1-3 PASS. **Phase 1 was pushed as PR #12** (https://github.com/jacksonyang-amp/AmpliGen/pull/12, head `937b0f52d4921b96b8bd898c88c5a87e8b838609`, base `main`, not merged). Phase 1 is COMPLETE as of the merge at `2abd6ff`. Dispatch `phase-1-push-010` (2026-11-25T03:50:00Z) is USED.
- **Risks:** Use general UST-style visual hierarchy as inspiration only; do not copy branding, logos, or marks. Platform name and prices are fictional and must be labeled as such. The Builder adds no SDKs, forms, or network calls in this phase.
- **Needs human approval to merge?** Yes.
- **Git permissions for the Builder:** Branch creation: yes, `build/phase-1` only. Commit: yes, local commits on `build/phase-1` only. Push: no. PR creation: no. Merge: no. Deployment: no. Destructive operations: no. Each push and PR needs a separate RESERVED approval in DECISIONS.md.

## Phase 2 — Simulated conversions and identities
- **Type:** BUILD
- **Objective:** Implement simulated conversion journeys with deterministic visitor/account fixtures and a bot runner for replaying those journeys.
- **Definition of done:**
  1. `npm run typecheck` exits 0.
  2. `npm run build` exits 0 with validated forms, a simulated demo-success page, a mock product landing page prepared for a future guide, and a repo-fixture bot runner using the application’s identity/action contract.
  3. `npm run smoke:phase2` exercises the form and identity handlers with invalid input, a predefined persona, and a fictional company email; checks success destinations, stable user/account IDs, and persona-reset behavior; confirms no authentication or lead-delivery request is made and the bot runner dry-run emits the expected ordered actions and identities without sending telemetry.
- **Risks:** The Planner must define email-to-account mapping, unknown-domain behavior, and synthetic-data labeling before dispatch. Do not transmit raw form emails to analytics; use fictional fixture addresses for demonstrations and clearly label simulated actions. Keep the bot runner independent of vendor SDKs; connect its existing action contract to instrumentation in later phases. Live traffic volume, target projects, and any cost require explicit authorization.
- **Needs human approval to merge?** Yes.
- **Git permissions for the Builder:** Commit yes, only when granted in the phase handoff; Merge no, pending a separate approved dispatch.

## Phase 3 — Amplitude analytics and replay
- **Type:** BUILD
- **Objective:** Instrument the existing journeys and account identities through the Amplitude Unified SDK.
- **Definition of done:**
  1. `npm run typecheck` exits 0.
  2. `npm run build` exits 0 with only `@amplitude/unified` as the direct Amplitude dependency and one guarded `initAll()` call; configure Analytics, Session Replay, Feature Experiment, and Guides & Surveys together without Amplitude-controlled variation assignment.
  3. `npm run smoke:phase3` uses a mocked SDK boundary to check one initialization, the agreed page/pricing/conversion event sequence, user/account properties, synthetic labels, no duplicate events, and usable no-key behavior; it also checks no separate Amplitude package was directly installed.
- **Risks:** Before integration, the Builder must verify current official SDK documentation and required entitlements, including account reporting and replay. The Planner must approve an event contract and replay privacy settings; missing credentials or unsupported capabilities block live integration. Do not separately install `@amplitude/analytics-browser` or any other Amplitude package; transitive dependencies are SDK-managed.
- **Needs human approval to merge?** Yes.
- **Git permissions for the Builder:** Commit yes, only when granted in the phase handoff; Merge no, pending a separate approved dispatch.

## Phase 4 — Statsig experiments and controls
- **Type:** BUILD
- **Objective:** Add Statsig-controlled content experiments, feature gates, and dynamic configs with shared outcome measurement in both tools.
- **Definition of done:**
  1. `npm run typecheck` exits 0.
  2. `npm run build` exits 0 with a pricing CTA experiment, one mock-product feature gate, one content dynamic config, and safe fallbacks; reuse the Phase 2 fixture runner and existing event/identity contract rather than adding a new traffic generator.
  3. `npm run smoke:phase4` checks deterministic control/treatment and gate/config fixtures, fallback behavior, one intended exposure per evaluation contract, exposure forwarding to the mocked Amplitude boundary, and matching conversion identities/events at both SDK boundaries; run the bot runner in dry-run mode only.
- **Risks:** Verify supported Statsig exposure forwarding against current official documentation before coding; do not invent an integration. The Planner must define assignment units, exposure semantics, conversion metrics, and the initial hypothesis. Live bot volume, target projects, and any resulting cost require explicit authorization; synthetic outcomes must not be presented as causal evidence.
- **Needs human approval to merge?** Yes.
- **Git permissions for the Builder:** Commit yes, only when granted in the phase handoff; Merge no, pending a separate approved dispatch.

## Phase 5 — Final verification and demo readiness
- **Type:** VERIFY
- **Objective:** Verify the deployed journeys, SDK delivery, and analysis workflows in the browser and both vendor consoles.
- **Definition of done:**
  1. Typecheck, build, and the repository’s full available test suite pass; the latest approved deployment has a successful Actions run and serves the expected revision.
  2. A browser walkthrough at mobile and desktop widths passes product browsing, pricing, invalid/valid demo requests, sign-up, mock landing, direct navigation/reload, keyboard operation, and visible focus; record results and screenshots.
  3. Using authorized synthetic traffic, Amplitude shows the agreed events, user/account mapping, a funnel and journey analysis, and playable replay with sensitive fields masked; record evidence references.
  4. Statsig shows experiment exposures, conversion events, gate targeting, and dynamic-config changes; matching exposure identifiers appear in Amplitude for segmented analysis, with no duplicate delivery in the checked journey.
  5. A demo runbook records the public URL, test personas, reset steps, analysis links, integration configuration, and later guide/survey setup; all failed or unverified criteria are resolved before project completion.
- **Risks:** Credentials, entitlements, ingestion delay, replay processing, and low synthetic sample sizes can block verification. Record blockers rather than claiming console results from mocked checks. If fixes change the reviewed app, return them through a new BUILD dispatch and repeat affected verification; recheck the public revision after the final approved merge.
- **Needs human approval to merge?** Yes, if verification produces a PR; otherwise no merge is needed.
- **Git permissions for the Builder:** Commit yes for assigned evidence/runbook changes when granted in the handoff; Merge no, pending a separate approved dispatch.
