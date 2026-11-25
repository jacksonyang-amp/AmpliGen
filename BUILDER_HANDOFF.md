# BUILDER_HANDOFF
**Status:** IDLE
**Phase:** 4 — Statsig experiments and controls
**Dispatch ID:** phase-4-push-022 (reviewed; pushed as 49b8aac; IDLE)
**Phase type:** PUSH (dispatch only; no build, no file changes)
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Push the reviewed local `build/phase-4` head to `origin` once, so that PR #20 (https://github.com/jacksonyang-amp/AmpliGen/pull/20) updates. Do not merge it.

## Prerequisites
- The approval is DECISIONS.md 2026-11-25T06:09:00Z, state RESERVED, dispatch `phase-4-push-022`. Read it from `origin/cursor/phase-4-handoff-fc41` after `git fetch origin cursor/phase-4-handoff-fc41`. Do not check out or edit that branch.
- `git rev-parse build/phase-4` must be exactly `49b8aac462658b6a96481ac4158467a6b972641a`. The working tree must be clean. If either is different, stop and report BLOCKED. Do not commit, rebase, reset, amend, or create a branch.
- `git ls-remote origin refs/heads/build/phase-4` must be exactly `0ad165dc71a471c03fde776b9f9098110d830389`. If it is anything else, stop and report BLOCKED.
- `git merge-base --is-ancestor 0ad165dc71a471c03fde776b9f9098110d830389 49b8aac462658b6a96481ac4158467a6b972641a` must exit 0. If it does not, stop and report BLOCKED.

## Steps
1. Run the prerequisite checks above.
2. Run `git push -u origin build/phase-4` once. It must be a plain fast-forward with no flags. Retry only network errors, up to 4 times, with backoff.
3. Run `git ls-remote origin refs/heads/build/phase-4`. It must print `49b8aac462658b6a96481ac4158467a6b972641a`.
4. Run `gh pr view 20 --json state,isDraft,baseRefName,headRefOid`. It must show OPEN, not a draft, base `main`, and head `49b8aac462658b6a96481ac4158467a6b972641a`. Read only. Do not edit the PR.
5. Report PUSHED with the `ls-remote` output and the PR #20 fields, or BLOCKED with the failing check, and stop.

## Allowed
- One plain push of `build/phase-4` at `49b8aac462658b6a96481ac4158467a6b972641a`.
- Read-only git and `gh pr view` commands.

## Forbidden
- Any file change, any new commit, `PHASE_LOG.md` included. This dispatch changes nothing in the repository.
- Force-push, rebase, amend, reset, or push of any other ref.
- Creating, editing, or commenting on a PR; running `gh pr create` or `gh pr merge`.
- Merge, deployment, workflow dispatch, Statsig or Amplitude console changes, live bot traffic.

## Stop
After reporting PUSHED or BLOCKED, stop. Do not start Phase 5.
