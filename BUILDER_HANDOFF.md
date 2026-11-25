# BUILDER_HANDOFF
**Status:** IDLE
**Phase:** 5 — Final verification and demo readiness
**Dispatch ID:** phase-5-verify-024 (reviewed 2026-11-25T06:25:00Z; criteria 1, 2, 5 local; IDLE)
**Phase type:** VERIFY (evidence and runbook only; local commits on `build/phase-5`)
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Verify the live site, record evidence, and draft the demo runbook. Scope is set by DECISIONS.md 2026-11-25T06:16:00Z (AUTHORIZED, limited). Do not fix product defects. Report them.

## Prerequisites
- Read this handoff and DECISIONS.md 2026-11-25T06:16:00Z from `origin/cursor/phase-4-handoff-fc41` after `git fetch origin cursor/phase-4-handoff-fc41`. Do not check out or edit that branch.
- `git fetch origin main`. `origin/main` must be `dece677e712168b7312e88df05115b315a93f56f`. If not, stop and report BLOCKED.
- Create `build/phase-5` from `origin/main` in a new worktree, for example `git worktree add /tmp/ampligen-phase5 -b build/phase-5 origin/main`. Do not touch `/tmp/ampligen-phase4` or the shared checkout.

## Steps
1. Criterion 1. In the worktree run `npm ci`, `npm run typecheck`, `npm run build`, `npm run smoke:phase0`, `smoke:phase1`, `smoke:phase2`, `smoke:phase3`, `smoke:phase4`, and `npm run bot:dry-run`. Check `package.json` for any other test script and run it too. Record each exit code and the pass count. Check that the public Actions run for `dece677` (Deploy to GitHub Pages, run 45559034290) is success and that the served home page contains the dark-theme stylesheet reference.
2. Criterion 2. Walk the live site at `https://jacksonyang-amp.github.io/AmpliGen/` at 1280x800 (desktop) and 390x844 (mobile). Cover product browsing, pricing, an invalid demo request (client validation shows; do not submit), a valid demo request, sign-up, the mock landing (welcome) page, direct navigation and reload on each route, keyboard-only operation (Tab, Shift+Tab, Enter), and visible focus. Use a sample visitor where the form offers one. Use only test values such as `walkthrough+desktop@example.com`. Submit at most one valid demo request and one valid sign-up in total across both widths. Save screenshots under `/tmp/phase5/`, one per journey per width, and record their md5 sums. Do not commit binaries.
3. Criterion 5, runbook draft. Create `docs/demo-runbook.md` on `build/phase-5`. It covers the public URL, the test personas, reset steps, the integration configuration (keys named by secret, not value; Statsig console integration Amplitude Native not enabled), the analysis links as placeholders marked UNVERIFIED, and the later guide and survey setup as deferred. Do not paste any key value.
4. Append one `PHASE_LOG.md` entry for this dispatch with the commands, exit codes, pass counts, the walkthrough results per journey and width, the screenshot paths and md5 sums, any defect with its reproduction steps, and the criteria status (PASS, FAIL, or UNVERIFIED with the reason).
5. Commit locally on `build/phase-5`, in one commit for the runbook and one for the log.

## Not authorized
- Live bot runs, or any run of `scripts/bot-runner.mjs` that is not dry-run.
- Synthetic traffic beyond the walkthrough limits above.
- Any change to the Amplitude or Statsig console, the GitHub secrets, or the Pages settings.
- Any product code change, any change to a smoke script, or any change to the events, identity, or Statsig code.
- Push of any ref, PR creation or edits, merge, deployment, force-push, or rebase.

## Stop
After the commit, report COMPLETE or BLOCKED with the evidence summary and the worktree path, then stop. Do not start criteria 3 or 4.
