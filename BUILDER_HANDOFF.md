# BUILDER_HANDOFF
**Status:** START
**Phase:** 1 — Product and pricing pages (push and PR only)
**Dispatch ID:** phase-1-push-010
**Phase type:** BUILD
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Push `build/phase-1` once and open one PR into `main`. Do not change any file or commit.

## Prerequisites
- The human's named approval is RESERVED in DECISIONS.md on `origin/cursor/phase-1-handoff-fc41` (entry 2026-11-25T03:49:00Z). Read it with `git fetch origin cursor/phase-1-handoff-fc41`, then `git show origin/cursor/phase-1-handoff-fc41:DECISIONS.md`. Do not check out or edit that branch.
- Local branch `build/phase-1` must point to `937b0f52d4921b96b8bd898c88c5a87e8b838609`. If it does not, stop and log BLOCKED. Do not amend, rebase, or add a commit.

## Steps
1. `git push -u origin 937b0f52d4921b96b8bd898c88c5a87e8b838609:refs/heads/build/phase-1`. Push once. Do not force.
2. Open exactly one PR from `build/phase-1` into `main`. Title: "Phase 1: AmpliGen product and pricing pages". Body: head SHA `937b0f52d4921b96b8bd898c88c5a87e8b838609`; Phase 1 criteria 1-3 PASS on the Planner's clean-worktree run; the diff is limited to the Phase 1 allowed files plus the Phase 0 smoke assertions on lines 83-84; no merge is authorized, and merging redeploys the public site. Use `gh pr create --base main --head build/phase-1`. Do not use `--auto`.
3. Append one PHASE_LOG.md entry with dispatch `phase-1-push-010`, the push result, and the PR URL. Do not edit any other file. You may commit this entry only on a new commit on `build/phase-1` if the Planner later asks; otherwise leave the entry uncommitted and say so.
4. Do not merge, deploy, edit any file other than PHASE_LOG.md, or push anything else.

## Git permissions
- Push: yes, once, of commit `937b0f52d4921b96b8bd898c88c5a87e8b838609` to `build/phase-1` only.
- PR creation: yes, exactly one PR into `main`.
- Commit: no. Branch creation: no. Merge: no. Deployment: no. Destructive operations: no.

## Report
Final reply: push exit code, remote SHA, PR URL, and any BLOCKED reason. Then stop.
