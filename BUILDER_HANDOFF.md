# BUILDER_HANDOFF
**Status:** IDLE
**Phase:** 5 — Final verification and demo readiness
**Dispatch ID:** phase-5-push-025 (reviewed 2026-11-25T17:47:00Z; pushed; IDLE)
**Phase type:** PUSH (dispatch only; no build, no file changes)
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Push the reviewed local `build/phase-5` head to `origin` once, as a new branch. Do not open a PR. Do not merge.

## Prerequisites
- The approval is DECISIONS.md 2026-11-25T17:45:00Z, state RESERVED, dispatch `phase-5-push-025`. Read it from `origin/cursor/phase-4-handoff-fc41` after `git fetch origin cursor/phase-4-handoff-fc41`. Do not check out or edit that branch.
- `git rev-parse build/phase-5` must be exactly `4bf3e265f5c174ad7ccf242a2f69d34f65d712df`. The worktree `/tmp/ampligen-phase5` must be clean. If either differs, stop and report BLOCKED. Do not commit, rebase, reset, or amend.
- `git ls-remote origin refs/heads/build/phase-5` must print nothing. If the branch already exists on origin, stop and report BLOCKED.
- `git merge-base --is-ancestor origin/main build/phase-5` must exit 0. Run `git fetch origin main` first.

## Steps
1. Run the prerequisite checks.
2. From `/tmp/ampligen-phase5`, run `git push -u origin build/phase-5` once. No flags. Retry only network errors, up to 4 times, with backoff.
3. Run `git ls-remote origin refs/heads/build/phase-5`. It must print `4bf3e265f5c174ad7ccf242a2f69d34f65d712df`.
4. Report PUSHED with the `ls-remote` output, or BLOCKED with the failing check, and stop.

## Forbidden
- Any file change or new commit, `PHASE_LOG.md` included.
- Force-push, rebase, amend, reset, or push of any other ref.
- Creating, editing, or commenting on a PR; `gh pr create` or `gh pr merge`.
- Merge, deployment, workflow dispatch, console changes, any traffic or browser run.

## Stop
After reporting PUSHED or BLOCKED, stop. Do not start criteria 3 or 4.
