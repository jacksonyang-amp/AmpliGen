# B2B software demo project plan

## Execution rules
- Status: ACTIVE — Phase 0 local dispatch `phase-0-build-001` is BLOCKED and the handoff is IDLE. The Planner issues each START handoff with a unique dispatch ID, phase ID/type, Builder ID, allowed files, commands, and permissions.
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
- **Needs human approval to merge?** Yes.
- **Git permissions for the Builder:** When the Phase 0 handoff grants it, create and switch to `build/phase-0` and commit there. Push, merge, and deployment remain no until separately authorized.

## Phase 1 — Product and pricing pages
- **Type:** BUILD
- **Objective:** Add the fictional platform’s product and pricing pages with working navigation to demo and trial entry points.
- **Definition of done:**
  1. `npm run typecheck` exits 0.
  2. `npm run build` exits 0 with home, product, pricing, demo-request, and sign-up routes; unfinished forms display clear temporary information instead of broken controls.
  3. `npm run smoke:phase1` confirms those routes resolve from the built site and checks the product names, pricing copy, and CTA destinations against the phase’s content fixtures.
- **Risks:** The Planner must select the platform name, products, and fictional prices before dispatch. Use UST’s general visual hierarchy as inspiration without copying branding; specify exact UI details in an approved spec if needed.
- **Needs human approval to merge?** Yes.
- **Git permissions for the Builder:** Commit yes, only when granted in the phase handoff; Merge no, pending a separate approved dispatch.

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
