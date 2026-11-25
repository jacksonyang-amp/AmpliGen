# BUILDER_HANDOFF
**Status:** START
**Phase:** 2 — Simulated conversions and identities (merge only)
**Dispatch ID:** phase-2-merge-014
**Phase type:** BUILD
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Merge PR #14 into `main` once, and nothing else.

## Prerequisites
- The human's named approval is RESERVED in DECISIONS.md on `origin/cursor/phase-2-handoff-fc41` (entry 2026-11-25T04:21:00Z). Read it with `git fetch origin cursor/phase-2-handoff-fc41` and `git show origin/cursor/phase-2-handoff-fc41:DECISIONS.md`. Do not check out or edit that branch.
- Read this handoff from that same ref: `git show origin/cursor/phase-2-handoff-fc41:BUILDER_HANDOFF.md`.
- Check first with `gh pr view 14 --repo jacksonyang-amp/AmpliGen --json state,isDraft,headRefOid,baseRefName,mergeable`. It must be OPEN, not a draft, base `main`, head `fd8bae63dae88216f376c5668ba095daff20c8c1`, and mergeable. If any check fails, stop and report BLOCKED. Do not merge.
- `origin/main` is `0f21228c0fafb3b26043942fd8375554710dec5d` (the squash of PR #13, docs only). That does not change the approved head. If `origin/main` has moved past that commit with any file other than `BUILDER_HANDOFF.md`, `DECISIONS.md`, or `PROJECT_PLAN.md`, stop and report BLOCKED.

## Steps
1. Merge once with a merge commit, pinned to the head: `gh pr merge 14 --repo jacksonyang-amp/AmpliGen --merge --match-head-commit fd8bae63dae88216f376c5668ba095daff20c8c1`. Do not use `--auto`, squash, or rebase.
2. `git fetch origin main`. Confirm `origin/main` contains `demo-request/success/index.html` and `scripts/smoke-phase2.mjs`. Record the merge commit SHA and the new `origin/main` SHA.
3. Find the "Deploy to GitHub Pages" run for the merge commit (`gh run list --repo jacksonyang-amp/AmpliGen --branch main --limit 5`), and watch it with `gh run watch <id> --repo jacksonyang-amp/AmpliGen --exit-status`. Record its URL and conclusion. Do not re-run anything.
4. Do not edit files, commit, push, open PRs, or merge anything else.

## Git permissions
- Merge: yes, once, PR #14 only, pinned to the head above.
- Commit: no. Push: no. PR creation: no. Branch creation: no. Deployment: only the merge's own Pages run. Destructive operations: no.

## Report
Final reply: the PR #14 merge commit SHA, the new `origin/main` SHA, the Pages run URL and conclusion, and any BLOCKED reason. Then stop.
