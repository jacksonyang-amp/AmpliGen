# BUILDER_HANDOFF
**Status:** START
**Phase:** 3 — Amplitude analytics and replay
**Dispatch ID:** phase-3-push-016
**Phase type:** BUILD (git action only; the build itself is already accepted)
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Push the already-reviewed local branch `build/phase-3` at commit `8127b0dc321ba56d206f8ead26b739afdeaf5705` to `origin`, and open exactly one pull request into `main`. Do not merge. Do not change any file.

## Prerequisites
- Dispatch `phase-3-build-015` is COMPLETE and accepted (DECISIONS.md 2026-11-25T04:50:00Z). The reviewed head is local `build/phase-3` at `8127b0dc321ba56d206f8ead26b739afdeaf5705`.
- This push and PR are authorized by DECISIONS.md 2026-11-25T04:59:00Z, state RESERVED, dispatch `phase-3-push-016`. Read the handoff and that entry from `origin/cursor/record-phase-3-decisions-fc41` after `git fetch origin cursor/record-phase-3-decisions-fc41`. Do not check out or edit that branch.
- Confirm `git rev-parse build/phase-3` prints `8127b0dc321ba56d206f8ead26b739afdeaf5705`. If that commit is not present, stop and report BLOCKED. Do not rebuild, cherry-pick, amend, or create a new commit. A different SHA voids this approval.

## Steps
1. `git fetch origin main` and `git fetch origin build/phase-3` (the second may fail if the branch was never pushed; that is expected). Confirm the local head is exactly `8127b0dc321ba56d206f8ead26b739afdeaf5705` and the worktree for that commit is clean. Do not commit.
2. Push once: `git push -u origin 8127b0dc321ba56d206f8ead26b739afdeaf5705:refs/heads/build/phase-3`. If `origin/build/phase-3` already exists at a different commit, stop and report BLOCKED. Do not force-push.
3. Open exactly one pull request, not a draft, base `main`, head `build/phase-3`. Title: `Add Amplitude analytics and unmasked session replay`. Body: this adds `@amplitude/unified` behind one guarded `initAll()`; the only custom events are `Demo Request Submitted` and `Sign Up Completed`; page views and clicks come from Autocapture; replay is configured at 100% with form fields unmasked; merging deploys the public site and starts recording, and this pull request does not merge. Do not enable auto-merge.
4. Do not edit `PHASE_LOG.md` or any other file. A new commit would change the approved SHA.
5. Report the pull request URL, the remote SHA of `build/phase-3`, and confirm the push did not start a Pages deployment. The workflow runs only on `main`.

## Git permissions
- Push: yes, once, ref `build/phase-3` at `8127b0dc321ba56d206f8ead26b739afdeaf5705` only.
- PR creation: yes, exactly one pull request into `main`. Not a draft. No second pull request.
- Branch creation: no. Commit: no. Merge: no. Deployment: no. Force-push: no. Destructive git operations: no.
- A push of `build/phase-3` does not deploy. Merging into `main` would deploy the site with the Amplitude key and start recording sessions unmasked at 100%. That merge is not approved.

## Stop
After the pull request is open, stop. Do not start Phase 4. Do not merge.
