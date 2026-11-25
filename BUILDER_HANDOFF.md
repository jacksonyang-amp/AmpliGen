# BUILDER_HANDOFF
**Status:** START
**Phase:** 2 — Simulated conversions and identities (push and PR only)
**Dispatch ID:** phase-2-push-013
**Phase type:** BUILD
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Push `build/phase-2` once and open one PR into `main`. Do not change any file or commit.

## Prerequisites
- The human's named approval is RESERVED in DECISIONS.md on `origin/cursor/phase-2-handoff-fc41` (entry 2026-11-25T04:16:00Z). Read it with `git fetch origin cursor/phase-2-handoff-fc41`, then `git show origin/cursor/phase-2-handoff-fc41:DECISIONS.md`. Do not check out or edit that branch.
- Read this handoff from that same ref: `git show origin/cursor/phase-2-handoff-fc41:BUILDER_HANDOFF.md`. Your checkout of `build/phase-2` does not contain this dispatch.
- Local branch `build/phase-2` must point to `fd8bae63dae88216f376c5668ba095daff20c8c1`. If it does not, stop and log BLOCKED. Do not amend, rebase, or add a commit.

## Steps
1. `git push -u origin fd8bae63dae88216f376c5668ba095daff20c8c1:refs/heads/build/phase-2`. Push once. Do not force.
2. Open exactly one PR from `build/phase-2` into `main`. Title: "Phase 2: simulated demo request and sign-up". Body: head SHA `fd8bae63dae88216f376c5668ba095daff20c8c1`; Phase 2 criteria 1-3 PASS on the Planner's clean-worktree run (`typecheck`, `build` with seven routes, `smoke:phase2` 132 passed, `bot:dry-run`, `smoke:phase1` 146 passed, `smoke:phase0` 28 passed); browser form behavior is UNVERIFIED and belongs to Phase 5; the diff is the Phase 2 allowed files; no merge is authorized, and merging redeploys the public site. Use `gh pr create --base main --head build/phase-2`. Do not use `--auto`. Do not open a second PR if one already exists for this head.
3. Do not merge, deploy, edit any file, commit, or push anything else. Report the push result and PR URL in your final reply. Leave PHASE_LOG.md unchanged so the PR head stays the approved commit.

## Git permissions
- Push: yes, once, of commit `fd8bae63dae88216f376c5668ba095daff20c8c1` to `build/phase-2` only.
- PR creation: yes, exactly one PR into `main`.
- Commit: no. Branch creation: no. Merge: no. Deployment: no. Destructive operations: no.
- A push of this branch does not deploy. Only a later merge to `main` runs `.github/workflows/deploy-pages.yml`. That merge is not approved.

## Report
Final reply: push exit code, remote SHA, PR URL, and any BLOCKED reason. Then stop.
