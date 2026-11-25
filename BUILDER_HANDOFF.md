# BUILDER_HANDOFF
**Status:** IDLE
**Phase:** 3 — Amplitude analytics and replay
**Dispatch ID:** phase-3-merge-017 (reviewed; merged as b982f97; IDLE)
**Phase type:** BUILD (merge only; the build and the pull request are already accepted)
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Merge https://github.com/jacksonyang-amp/AmpliGen/pull/17 once, as a merge commit, pinned to head `8127b0dc321ba56d206f8ead26b739afdeaf5705`. Do not change any file. Do not push any other ref.

## Prerequisites
- Read this handoff and DECISIONS.md from `origin/cursor/record-phase-3-decisions-fc41` after `git fetch origin cursor/record-phase-3-decisions-fc41`. Do not check out or edit that branch.
- The approval is the entry 2026-11-25T05:05:00Z, state RESERVED, dispatch `phase-3-merge-017`.
- Immediately before merging, confirm PR #17 is open, not a draft, base `main`, and its head SHA is exactly `8127b0dc321ba56d206f8ead26b739afdeaf5705`. If the head is anything else, stop and report BLOCKED.

## Steps
1. `origin/main` is `e8cb9ba` (the squash of docs PR #16). The Planner's merge-tree of `origin/build/phase-3` onto that main is clean. Do not rebase `build/phase-3`, do not add a commit, and do not force-push.
2. Merge PR #17 once using the merge method `merge` (a merge commit). Do not squash and do not rebase. The approved commit must remain in the history of `main`.
3. Do not edit any file, including `PHASE_LOG.md`. A new commit on `build/phase-3` voids the approval.
4. Report the merge commit SHA, the new `origin/main` SHA, and the Pages workflow run URL if GitHub has created one. If that run is queued or in progress, report the URL and stop. Do not wait for it to finish.

## Git permissions
- Merge: yes, PR #17 once, as a merge commit, only while its head is `8127b0dc321ba56d206f8ead26b739afdeaf5705`.
- The merge deploys. That is the authorized consequence: GitHub Actions publishes the site and the Amplitude key is baked into the bundle, which starts recording sessions unmasked at 100%.
- Commit: no. Push of any other branch: no. A second PR: no. Force-push: no. Rebase: no. Squash: no. Destructive git operations: no.

## Stop
After the merge is reported, stop. Do not start Phase 4.
