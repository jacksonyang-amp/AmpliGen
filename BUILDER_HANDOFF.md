# BUILDER_HANDOFF
**Status:** IDLE
**Phase:** 4 — Statsig experiments and controls
**Dispatch ID:** phase-4-merge-023 (reviewed; merged as dece677; IDLE)
**Phase type:** MERGE (merge only; the build and push are already accepted)
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Merge https://github.com/jacksonyang-amp/AmpliGen/pull/20 once, as a merge commit, pinned to head `49b8aac462658b6a96481ac4158467a6b972641a`. Do not change any file. Do not push any ref.

## Prerequisites
- The approval is DECISIONS.md 2026-11-25T06:13:00Z, state RESERVED, dispatch `phase-4-merge-023`. Read it from `origin/cursor/phase-4-handoff-fc41` after `git fetch origin cursor/phase-4-handoff-fc41`. Do not check out or edit that branch.
- Immediately before merging, confirm with `gh pr view 20 --json state,isDraft,baseRefName,headRefOid,mergedAt` that PR #20 is OPEN, not a draft, base `main`, and head exactly `49b8aac462658b6a96481ac4158467a6b972641a`, and that `mergedAt` is null. If any value differs, stop and report BLOCKED.
- `git ls-remote origin refs/heads/build/phase-4` must print `49b8aac462658b6a96481ac4158467a6b972641a`. If not, stop and report BLOCKED.

## Steps
1. Run the prerequisite checks.
2. Merge PR #20 once with merge method `merge` (a merge commit). Do not squash and do not rebase. Pin the merge to the head SHA above, so GitHub refuses it if the head has moved.
3. Report the merge commit SHA, the new `origin/main` SHA, and the Pages workflow run URL if GitHub has created one. If that run is queued or in progress, report the URL and stop. Do not wait for it to finish.
4. Do not edit any file, including `PHASE_LOG.md`. A new commit on `build/phase-4` voids the approval.

## Git permissions
- Merge: yes, PR #20 once, as a merge commit, only while its head is `49b8aac462658b6a96481ac4158467a6b972641a`.
- Commit: no. Push of any ref: no. A second PR: no. Force-push: no. Rebase: no. Squash: no. Destructive git operations: no.

## Stop
After the merge is reported, stop. Do not start Phase 5.
