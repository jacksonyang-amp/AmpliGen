# BUILDER_HANDOFF
**Status:** IDLE
**Phase:** 4 — Statsig experiments and controls
**Dispatch ID:** phase-4-push-019 (reviewed; PR #20 open at 0ad165d; IDLE)
**Phase type:** BUILD (git action only; the build itself is already accepted)
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Push the already-reviewed local branch `build/phase-4` at commit `0ad165dc71a471c03fde776b9f9098110d830389` to `origin`, and open exactly one pull request into `main`. Do not merge. Do not change any file.

## Prerequisites
- Dispatch `phase-4-build-018` is COMPLETE and accepted (DECISIONS.md 2026-11-25T05:40:00Z). The reviewed head is local `build/phase-4` at `0ad165dc71a471c03fde776b9f9098110d830389`.
- This push and PR are authorized by DECISIONS.md 2026-11-25T05:42:00Z, state RESERVED, dispatch `phase-4-push-019`. Read the handoff and that entry from `origin/cursor/phase-4-handoff-fc41` after `git fetch origin cursor/phase-4-handoff-fc41`. Do not check out or edit that branch.
- Confirm `git rev-parse build/phase-4` prints `0ad165dc71a471c03fde776b9f9098110d830389`. The branch was created in the shared repository, including the worktree at `/tmp/ampligen-phase4` if that still exists. If that commit is not present, stop and report BLOCKED. Do not rebuild, cherry-pick, amend, or create a new commit. A different SHA voids this approval.

## Steps
1. `git fetch origin main` and `git fetch origin build/phase-4` (the second may fail if the branch was never pushed; that is expected). Confirm the local head is exactly `0ad165dc71a471c03fde776b9f9098110d830389`. Do not commit.
2. Push once: `git push -u origin 0ad165dc71a471c03fde776b9f9098110d830389:refs/heads/build/phase-4`. If `origin/build/phase-4` already exists at a different commit, stop and report BLOCKED. Do not force-push.
3. Open exactly one pull request, not a draft, base `main`, head `build/phase-4`. Title: `Add Statsig experiment, gate, and pricing notice`. Body: this adds `@statsig/js-client` behind one guarded init; experiment `pricing_cta_copy` changes only the pricing button labels; gate `metrics_account_breakdown` shows or hides one sentence on the product page; dynamic config `pricing_notice` can replace the pricing notice; the two existing events are also sent to Statsig; exposures are logged to Statsig only; merging deploys the public site and starts Statsig evaluation when the client key is present, and this pull request does not merge. Do not enable auto-merge.
4. Do not edit `PHASE_LOG.md` or any other file. A new commit would change the approved SHA.
5. Report the pull request URL, the remote SHA of `build/phase-4`, and confirm the push did not start a Pages deployment. The workflow runs only on `main`.

## Git permissions
- Push: yes, once, ref `build/phase-4` at `0ad165dc71a471c03fde776b9f9098110d830389` only.
- PR creation: yes, exactly one pull request into `main`. Not a draft. No second pull request.
- Branch creation: no. Commit: no. Merge: no. Deployment: no. Force-push: no. Destructive git operations: no.
- A push of `build/phase-4` does not deploy. Merging into `main` would deploy the site. If `NEXT_PUBLIC_STATSIG_CLIENT_KEY` is present, that deploy initializes Statsig and sends the two business actions and the exposures. That merge is not approved.

## Stop
After the pull request is open, stop. Do not start Phase 5. Do not merge.
