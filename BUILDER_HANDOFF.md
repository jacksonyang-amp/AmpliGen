# BUILDER_HANDOFF
**Status:** START
**Phase:** 1 — Product and pricing pages (merge only)
**Dispatch ID:** phase-1-merge-011
**Phase type:** BUILD
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Merge PR #12 into `main` once, and nothing else.

## Prerequisites
- The human's named approval is RESERVED in DECISIONS.md on `origin/cursor/phase-1-handoff-fc41` (entry 2026-11-25T03:51:00Z). Read it with `git fetch origin cursor/phase-1-handoff-fc41` and `git show origin/cursor/phase-1-handoff-fc41:DECISIONS.md`. Do not check out or edit that branch.
- Check first with `gh pr view 12 --repo jacksonyang-amp/AmpliGen --json state,isDraft,headRefOid,baseRefName`. It must be OPEN, not a draft, base `main`, head `937b0f52d4921b96b8bd898c88c5a87e8b838609`. If any check fails, stop and report BLOCKED. Do not merge.

## Steps
1. Merge once with a merge commit, pinned to the head: `gh pr merge 12 --repo jacksonyang-amp/AmpliGen --merge --match-head-commit 937b0f52d4921b96b8bd898c88c5a87e8b838609`. Do not use `--auto`, squash, or rebase.
2. `git fetch origin main`. Confirm `origin/main` contains `src/content/phase1.fixtures.json` and `product/index.html`. Record the merge commit SHA and the new `origin/main` SHA.
3. Find the "Deploy to GitHub Pages" run for the merge commit (`gh run list --repo jacksonyang-amp/AmpliGen --branch main --limit 5`), and watch it with `gh run watch <id> --repo jacksonyang-amp/AmpliGen --exit-status`. Record its URL and conclusion. Do not re-run anything.
4. Do not edit files, commit, push, open PRs, or merge anything else.

## Git permissions
- Merge: yes, once, PR #12 only, pinned to the head above.
- Commit: no. Push: no. PR creation: no. Branch creation: no. Deployment: only the merge's own Pages run. Destructive operations: no.

## Report
Final reply: the PR #12 merge commit SHA, the new `origin/main` SHA, the Pages run URL and conclusion, and any BLOCKED reason. Then stop.
