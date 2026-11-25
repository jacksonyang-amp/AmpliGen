# BUILDER_HANDOFF
**Status:** IDLE
**Phase:** 4 — Statsig experiments and controls
**Dispatch ID:** phase-4-design-021
**Phase type:** BUILD (correction to `phase-4-design-020`)
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Clear the one blocker from `phase-4-design-020`. `scripts/smoke-phase0.mjs` requires `id="about"` on the home page, and the human asked for the "About this site" section to be removed. Make the one allowed edit to that script, re-run every check, and commit locally.

## What the Planner decided
The Planner wrote two instructions that could not both hold: remove the About section, and do not edit `smoke-phase0`. The human's direction (DECISIONS.md 2026-11-25T05:46:00Z) is to remove the section. Option 1 from your report is accepted. Do not add a hidden or empty `id="about"` element, and do not keep any About text.

## Prerequisites
- Local `build/phase-4` is `4ff641332950719ba41309b60258a4ce50b7b746`, which sits on `181ec64950bdbe2a88b473eadd3fa9f46d30e34c` and `0ad165dc71a471c03fde776b9f9098110d830389`. If it is not, stop and report BLOCKED. Add commits on top. Do not rebase, reset, amend, or create a branch.
- Read this handoff and DECISIONS.md 2026-11-25T05:55:00Z from `origin/cursor/phase-4-handoff-fc41` after `git fetch origin cursor/phase-4-handoff-fc41`. Do not check out or edit that branch.

## The one edit
In `scripts/smoke-phase0.mjs`, change only the "home page has in-page navigation targets" check so that it no longer requires `id="about"`:

- Keep `html.includes('href="#overview"')` and `html.includes('id="capabilities"')`.
- Remove only `html.includes('id="about"')`.
- Do not change any other line, check, name, or count in that file.

If another Phase 0 check still fails after this edit, stop and report BLOCKED with the failing check name. Do not edit it.

## Allowed files
- `scripts/smoke-phase0.mjs`, the one-line condition above only
- `PHASE_LOG.md` (append only)

## Forbidden
- No other file, no new dependency, no push, no new branch, no PR, no merge, no deployment, no force-push, no rebase.
- No change to site copy, the theme, events, identity, Statsig entities, or Amplitude.

## Steps
1. Confirm `git rev-parse build/phase-4` is `4ff641332950719ba41309b60258a4ce50b7b746`.
2. Make the one edit and commit it as its own commit.
3. From the repository root, every one of these exits 0: `npm ci`, `npm run typecheck`, `npm run build`, `npm run smoke:phase4`, `npm run smoke:phase3`, `npm run smoke:phase2`, `npm run smoke:phase1`, `npm run smoke:phase0`, `npm run bot:dry-run`. The bot output stays the same as on `0ad165d`.
4. Append one PHASE_LOG.md entry for this dispatch with the commit SHAs, the commands, and the result of the former blocker. Commit it. State that the earlier `phase-4-design-020` entry is superseded for the `smoke:phase0` result.
5. Report COMPLETE or BLOCKED and stop.

## Git permissions
- Commit: yes, new commits on the existing local `build/phase-4` only.
- Branch creation: no. Push: no. PR creation: no. Merge: no. Deployment: no. Force-push: no. Rebase: no.
- PR #20 stays at `0ad165d` until a later push approval names the new head.

## Stop
After logging COMPLETE or BLOCKED, stop. Do not start Phase 5.
