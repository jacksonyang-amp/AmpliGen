# Decisions and blockers

## 2026-11-25 | Planner kickoff review | BLOCKED
- Confirmed: BUILDER_HANDOFF.md has Status START, Phase 0, dispatch phase-0-build-001, "Commit: Yes | Merge: No". Phase order in PROJECT_PLAN.md is unchanged.
- Not dispatched: no Builder was started and BUILDER_HANDOFF.md still has the Builder agent ID placeholder. No Builder link is recorded in PROJECT_PLAN.md.

### Blockers (owner: configured approver unless stated)
1. PROJECT_BRIEF.md is missing from the repository. PLANNER.md and BUILDER.md both require reading it, and the Builder would log BLOCKED immediately. Resolution: add PROJECT_BRIEF.md (or point to its location), then the Planner re-reviews the plan against it.
2. Slack channel name and approver are unspecified. The request used the placeholders `#<channel>` and `@<approver>`; PLANNER.md still holds `<SLACK_CHANNEL_ID>` and `<APPROVER_SLACK_USER_ID>`. Per PLANNER.md, Slack-dependent work is stopped until both are configured. Resolution: supply the channel name and the approver's name or Slack user ID.
3. The Slack MCP server requires authentication (status needsAuth) in this environment, so the channel cannot be looked up, subscribed to, or posted in. Resolution: authenticate the Slack MCP connection.
4. Git target branch is unclear. The only branch is `main`, which deploys to GitHub Pages. The handoff grants Commit but not branch creation or switching, and tells the Builder to log BLOCKED if the current branch is unsuitable. Resolution: approver or Planner decides whether the Builder may create a phase branch (a separate explicit permission), or commit locally on `main` without push.
5. PLANNER.md restricts the Planner to writing PROJECT_PLAN.md, DECISIONS.md and BUILDER_HANDOFF.md, but the request asks to record the channel ID in PLANNER.md. Resolution: approver authorizes that edit, or the ID is recorded in DECISIONS.md instead.

### Approvals and processed Slack messages
- No Slack messages processed. No approvals recorded. No merge or deployment is authorized.

## 2026-11-25T02:44:00Z | Cursor chat replaces Slack | USED
- Source timestamp: 2026-11-24 18:44 America/Los_Angeles, recorded as 2026-11-25T02:44:00Z. No Slack timestamp.
- PR: none. This is not a pull-request action approval. It does not approve PR #1 or any other PR.
- Reviewed commit: `791e587aa8cc945e7354578df27b1dabc21243ae` (origin/main at the time the latest remote files were read). Branch tip at authorization was `db668efd5fa8e27801f49a57fca0a8c2014ce36d`; origin/main was merged before editing.
- Actor: Planner. Dispatch ID: none. Builder ID: none. Not dispatched to a Builder.
- State: USED. Execution evidence is commit `bdc8a6472ba99e84029f66db6ba7b320c41882d0`. This approval cannot be reused.

### Exact approval text
```
Use this Cursor chat as the human communication and approval channel. Slack is not required.

I authorize you to update PLANNER.md, BUILDER.md, and BUILDER_HANDOFF.md to reflect this change. Remove requirements to read Slack, receive Slack mentions, or record Slack timestamps. Record approvals in DECISIONS.md with the exact approval text, UTC timestamp, PR, reviewed commit, and authorized action. Preserve single-use approvals.

Read the latest remote files before editing; preserve existing work.

Add PROJECT_BRIEF.md using the approved brief I provide. Do not start the Builder until it exists.

Grant the Phase 0 Builder permission to create and switch to build/phase-0 and commit there. Push, merge, and deployment remain disallowed until separately authorized.

Keep one Builder. Only the Planner communicates with me; the Builder reports through PHASE_LOG.md and the agent channel.

Keep the handoff IDLE until the prerequisites are resolved and the actual Builder ID is recorded.
```
The attached brief was supplied as `PROJECT_BRIEF.md`.

### Authorized action
1. Use this Cursor chat as the human communication and approval channel. Remove requirements to read Slack, receive Slack mentions, or record Slack timestamps from PLANNER.md, BUILDER.md, and BUILDER_HANDOFF.md.
2. Record approvals in DECISIONS.md with the exact approval text, UTC timestamp, PR, reviewed commit, and authorized action. Keep approvals single-use.
3. Add PROJECT_BRIEF.md from the provided brief, preserving existing remote work.
4. Grant the Phase 0 Builder permission to create and switch to `build/phase-0` and commit there. Push, PR creation, merge, and deployment stay disallowed.
5. Keep one Builder. Only the Planner communicates with the human. The Builder reports through PHASE_LOG.md and the agent channel.
6. Keep BUILDER_HANDOFF.md Status IDLE until its prerequisites are resolved and the actual Builder ID is recorded. Do not start the Builder before PROJECT_BRIEF.md exists.

### Not authorized
- Starting the Builder, merge, push of product work, deployment, or any PR action.
- A second edit under this same approval.

### Kickoff blocker resolution
1. PROJECT_BRIEF.md is added under this authorization.
2. Slack setup is withdrawn. This chat replaces it. The Slack IDs previously committed on origin/main `791e587aa8cc945e7354578df27b1dabc21243ae` are not the approval channel.
3. Slack MCP authentication is not required for planning.
4. Phase 0 may use `build/phase-0` for local commits once a START handoff with a real Builder ID exists. Push, merge, and deployment remain unauthorized.
5. This authorization covers the instruction-file edits. No Slack channel ID is recorded.

### Still blocked
- Builder agent ID remains `<EXISTING_BUILDER_AGENT_ID>`. Handoff status stays IDLE. No Builder was started. No Builder link is recorded in PROJECT_PLAN.md. No merge or deployment is authorized.

## 2026-11-25T02:51:00Z | Phase 0 dispatch phase-0-build-001 | PROCESSED
- Request source: Cursor chat, 2026-11-24 18:51 America/Los_Angeles (UTC 2026-11-25T02:51:00Z). Not a PR action approval; no approval is created.
- Exact request text (summary of fields that matter): "Merged. You are the Planner. ... 1. Confirm BUILDER_HANDOFF.md says Status: START with Commit: Yes, Merge: No. 2. Start one Builder agent on that handoff. Record its agent link in PROJECT_PLAN.md. 3. Find channel #<channel> with the Slack MCP, note its ID in PLANNER.md, subscribe to new top-level messages only, and act only on messages that mention @PLANNER. 4. Post a short message mentioning @<approver>: the active phase and what you need from them, if anything. Do not merge to main without my named Approve in Slack."
- Steps 3 and 4 not executed: the channel and approver were again unspecified placeholders, and the USED 2026-11-25T02:44:00Z authorization replaced Slack with this chat (PLANNER.md "Human communication"). The Slack requirement for merge approval is likewise replaced by a named Approve in this chat. No Slack channel ID is recorded in PLANNER.md.
- Executed: one Builder created with an IDLE assignment, returned agent ID `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`, recorded in BUILDER_HANDOFF.md and PROJECT_PLAN.md. Handoff set to START for dispatch `phase-0-build-001` (Commit: Yes, Merge: No; branch `build/phase-0` only; push, PR creation, merge, deployment: No).
- Processed once; do not execute again.
- Merge and deployment remain unauthorized. Merging to main needs a named Approve in this chat naming exactly one PR, its reviewed head commit, and the action.

## 2026-11-25T02:58:00Z | Review of phase-0-build-001 | BLOCKED (awaiting permissions)
- Builder [bc-26af2fe0-92fa-5211-810f-eb3a21fea559] reported BLOCKED via PHASE_LOG.md (branch `build/phase-0`, head `45cf208ae0ea` as logged; code commit `253badcf20a5a232fc5150a33fdab3c7e2251ba8`). Dispatch status set to IDLE.
- Review: DoD 1-3 PASS (Planner re-ran typecheck, build, smoke:phase0 in a clean worktree; all exit 0, 23/23). DoD 4 UNVERIFIED. Scope and secret scan clean.
- Observations: stack is new (Vite ^8.3.8, TypeScript ^5.9.3, Node >=22.12, npm); base path `/AmpliGen/` matches Pages URL https://jacksonyang-amp.github.io/AmpliGen/. `build/phase-0` is branched from the Planner branch `cursor/dispatch-phase-0-builder-fc41` (PR #2), so it carries those commits; PR #2 should merge first or the Phase 0 PR will include them.
- Deployment consequence: `.github/workflows/deploy-pages.yml` runs on push to `main`; merging the Phase 0 PR publishes the public site.
- No approval recorded. Push, PR creation, merge, deployment remain unauthorized pending the human.

## 2026-11-25T02:56:00Z | Three planning decisions | PARTIAL
- Source timestamp: 2026-11-24 18:56 America/Los_Angeles, recorded as 2026-11-25T02:56:00Z.
- Exact approval text: `I approve all three of these decisions`
- PR: none. The message names no PR URL or repository-qualified PR number.
- Reviewed commit: none. This is not bound to a pull-request head.
- This is approval of a plan. It is not a PR action approval, because it does not contain “Approve”, exactly one PR, and the authorized action.

### Decision 1 — push `build/phase-0` and open a PR
- State: UNUSED. Single-use. Not dispatched.
- Authorized action: the Planner may issue one new START dispatch to Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559` to push local branch `build/phase-0` at `45cf2089a3d903f09061d5717b873c39f0037b12` and open one pull request into `main`.
- Not included: merge, deployment, or a second push.
- Hold: do not dispatch until `main` no longer contains `node_modules/` or `dist/`. PR #2 is on `main`, but its merged tree still has those paths.

## 2026-11-25T02:59:00Z | Report that PR #2 merged | VERIFIED, PUSH STILL HELD
- Source timestamp: 2026-11-24 18:59 America/Los_Angeles, recorded as 2026-11-25T02:59:00Z.
- Exact text: `PR #2 has been merged`
- PR: https://github.com/jacksonyang-amp/AmpliGen/pull/2
- This is a status report. It is not an approval: it does not contain “Approve” or an authorized action. The Planner did not merge it.
- Verified: merged at 2026-11-25T02:58:12Z by jacksonyang-amp. Merge commit `e23ba7df1b9721d5cc12371fdc35f28083261778`. The merged head is `6d9c558ec2dae13a57e675195e5109c313d55c62`, not `89f282f694154a2f6455b89a85759f3d6838135a`. `origin/main` contains `node_modules/` and `dist/`. No Pages workflow is on `main`, so this merge did not deploy the site.
- Decision 1 stays UNUSED. The Builder was not asked to push.
- Cleanup of `node_modules/` and `dist/` is in this branch and needs its own named Approve before it merges. That merge does not deploy.

### Decision 2 — merge PR #2 before the Phase 0 pull request
- State: NOT AUTHORIZED. No merge was performed.
- The intended order is recorded. Merging https://github.com/jacksonyang-amp/AmpliGen/pull/2 still needs a later message that contains “Approve”, that one PR URL, and the action. The Planner will bind it to the head commit at that time.
- Defect found before any merge: commit `6d9c558ec2dae13a57e675195e5109c313d55c62` accidentally added `node_modules/` and `dist/`. Those paths are removed in the following commit. Do not approve `6d9c558`.

### Decision 3 — a Phase 0 merge publishes the site
- State: recorded as confirmation of the existing rule. No Phase 0 pull request exists, so there is no reviewed commit and no merge or deployment authorization.

## 2026-11-25T03:04:00Z | Report that PR #3 merged | HELD: fresh approval needed for the push
- Source timestamp: 2026-11-24 19:04 America/Los_Angeles, recorded as 2026-11-25T03:04:00Z.
- Exact text: `PR #3 is Merged, continue`
- PR: https://github.com/jacksonyang-amp/AmpliGen/pull/3, merged 2026-11-25T03:03:30Z as `7db28fa3699bf958a31d6f514b83b84a66d2246d`. Reviewed head `e21f0ee72d06977a209c2d3cd2e3163722f33fdb`.
- Verified on `origin/main`: no `node_modules/` or `dist/`; PR #2 Planner files intact.
- This is a status report plus “continue”. It is not an approval for a new commit, so it does not bind any SHA.

### Decision 1 (push `build/phase-0` and open one PR) stays UNUSED and is not dispatched
- Reason: `build/phase-0` at `45cf2089a3d903f09061d5717b873c39f0037b12` is based on `b267dbd`, which predates the Planner decisions now on `main`. Its PR diff against `main` would delete 37 lines of `DECISIONS.md`, 3 lines of `PROJECT_PLAN.md`, and restore the START handoff. Merging `main` into it conflicts in `DECISIONS.md` and `PROJECT_PLAN.md`, and resolving those is Planner work the Builder may not do.
- Proposed fix (not yet executed): on a new branch from `origin/main`, cherry-pick the Builder's commits `253badcf20a5a232fc5150a33fdab3c7e2251ba8` (scaffold) and `45cf2089a3d903f09061d5717b873c39f0037b12` (PHASE_LOG BLOCKED entry). Dry run: the scaffold applies cleanly to `main`; the log entry touches only `PHASE_LOG.md`, which is empty on both bases.
- The cherry-picked commits get new SHAs, so the original approval for `45cf208` does not cover them. Fresh approval is required (PLANNER.md: “Require fresh approval for a changed scope or commit”).
- Still not authorized: merge, deployment, and any merge of this proposed Phase 0 PR. A merge to `main` deploys the site via `.github/workflows/deploy-pages.yml`.
- Required approval text (named Approve, one PR-or-branch, one action): to be issued in chat after the proposed branch exists and its head SHA is reported.

## 2026-11-25T03:08:00Z | Approval: push Phase 0 cherry-pick branch and open one PR | RESERVED
- Source timestamp: 2026-11-24 19:08 America/Los_Angeles, recorded as 2026-11-25T03:08:00Z.
- Exact text: `I already merged PR #4, Approve pushing the Phase 0 cherry-pick branch and opening one PR into main, no merge`
- Confirmed: PR #4 merged as `754e818ff77fb0c844bda2900390413ec8943bc8` (2026-11-25T03:07:38Z). `main` contains no `node_modules/` or `dist/`.
- Approval scope: this is an action approval for one new branch and one new PR. It names no existing PR, so the PR binding is to the new branch. Merge and deployment are NOT approved.
- Action: from `origin/main` at `754e818`, cherry-pick `253badcf20a5a232fc5150a33fdab3c7e2251ba8` then `45cf2089a3d903f09061d5717b873c39f0037b12` onto branch `cursor/phase-0-scaffold-fc41`; run the Phase 0 BUILD checks; push that branch; open exactly one PR into `main`.
- Builder: `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`. Dispatch: `phase-0-push-002`.
- Reviewed commit: none existed at approval. The head SHA the Builder reports is not yet approved for merge. A later merge needs a named Approve bound to that SHA.
- State: RESERVED for dispatch `phase-0-push-002`. Becomes USED after the Builder reports the push and PR.

## 2026-11-25T03:10:00Z | Approval for dispatch phase-0-push-002 | USED
- Approval text and scope: see the RESERVED entry above (2026-11-25T03:08:00Z).
- Execution evidence: PR #6, https://github.com/jacksonyang-amp/AmpliGen/pull/6, base `main`, open, not a draft, mergeable. Head `d0621b02c8ddb1b2e8b69088e5190bbe0c2c364f`. Commits: `13bca56` (scaffold, from `253badc`) and `d0621b0` (BLOCKED log, from `45cf208`). Branch `cursor/phase-0-scaffold-fc41`, pushed once.
- Planner verification: `origin/main` at `754e818`; changed files only the 12 Phase 0 files plus `PHASE_LOG.md`; Planner-owned files identical to `main`; no `node_modules/` or `dist/`; no key-like literals. The workflow still triggers only on push to `main`.
- Builder reports: `npm ci`, `npm run typecheck`, `npm run build`, and `npm run smoke:phase0` (23 passed) all exit 0.
- Deviation: the Builder created the PR with the `gh` CLI because its session had no PR tool. The PR content matches the approved action. Recorded here for the audit trail.
- Handoff note: `BUILDER_HANDOFF.md` still reads IDLE on `main`. The dispatch is recorded in this file and in the Builder’s report, not in the handoff.
- Still not approved: merging PR #6, merging any other PR into `main`, and deployment. A merge needs a named Approve bound to head `d0621b02c8ddb1b2e8b69088e5190bbe0c2c364f`.

## 2026-11-25T03:11:00Z | Approval: merge PR #6 | RESERVED
- Source timestamp: 2026-11-24 19:11 America/Los_Angeles, recorded as 2026-11-25T03:11:00Z.
- Exact text: `Approve https://github.com/jacksonyang-amp/AmpliGen/pull/6 merge of commit d0621b02c8ddb1b2e8b69088e5190bbe0c2c364f`
- Checks: contains “Approve”, exactly one PR URL (#6), the action (merge), and head `d0621b02c8ddb1b2e8b69088e5190bbe0c2c364f`, which matches PR #6 at the time of approval (base `main` at `754e818`).
- Consequence accepted by the approver: merging deploys the public site through `.github/workflows/deploy-pages.yml` (push to `main`).
- Action: the Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559` merges PR #6 once, bound to the head SHA, dispatch `phase-0-merge-003`. Method: merge commit. Then the Builder runs read-only deployment verification (Actions run for the merge commit; HTTP 200 at https://jacksonyang-amp.github.io/AmpliGen/ with the expected home-page content).
- No other merge or deploy action is authorized. Phase 0 remains open until the live check passes.
- State: RESERVED. Becomes USED after the merge is reported.

## 2026-11-25T03:14:00Z | Approval: merge PR #6 | USED
- Execution evidence: PR #6 merged 2026-11-25T03:12:01Z as `c8593de06523a07b596a4cef28967ec0d7f49c2b`, via `gh pr merge 6 --merge --match-head-commit d0621b02c8ddb1b2e8b69088e5190bbe0c2c364f` (exit 0, once).
- Planner verification: `origin/main` is `c8593de`; head `d0621b0` is an ancestor; no `node_modules/` or `dist/` on `main`. Pages run 45538301854 is completed/success on `c8593de`. https://jacksonyang-amp.github.io/AmpliGen/ returns HTTP 200 with `<title>API Platform Demo</title>`; `/AmpliGen/assets/index-Dfv1CCUN.css`, `/AmpliGen/assets/index-FVyABazW.js`, and `/AmpliGen/favicon.svg` return 200.
- Phase 0 is COMPLETE in PROJECT_PLAN.md (criterion 4 PASS).
- Open follow-up: `PHASE_LOG.md` on `main` still holds only the earlier BLOCKED entry for `phase-0-build-001`. The Builder-owned completion entry is not yet recorded; request it from the Builder through a new dispatch, not by Planner edit.
- Still not authorized: any other merge, and any Phase 1 work. Phase 1 needs its own START dispatch and approval.

## 2026-11-25T03:20:00Z | Phase 0 review | SENT BACK (narrow fix)
- Request: Cursor chat 2026-11-24 19:15 America/Los_Angeles (2026-11-25T03:15:00Z): `The Builder finished. Review its latest PHASE_LOG.md entry and the PR diff against the phase's definition of done. Check that tests, typecheck, and build passed, and that nothing outside the phase changed. Then do one of: Approve ... Send back ...`. Not a PR action approval.
- Finding: the latest PHASE_LOG.md entry on `main` is still `2026-11-25T02:53:36Z | Phase 0 | BLOCKED`; no newer Builder entry or open PR exists.
- Criterion 1 typecheck: PASS (exit 0 on `main` `9daf225`, Planner re-run).
- Criterion 2 build: PASS (exit 0; static `dist/`).
- Criterion 3 smoke: PASS (exit 0; 23 passed).
- “Tests”: Phase 0 is a BUILD phase; its only named check is `npm run smoke:phase0`. There is no test suite and running one is not permitted until the VERIFY phase.
- Criterion 4: live part PASS (Pages run 45538301854 success on `c8593de`; public URL 200 with expected title and assets). Record part FAIL: the required PHASE_LOG.md record of URL, revision, and run link is absent.
- Scope: PASS. PR #6 changed 13 files, all in the handoff allowed list or PHASE_LOG.md; no `node_modules/`, `dist/`, Planner files, or key literals.
- Correction: `PROJECT_PLAN.md` earlier read Phase 0 COMPLETE (merged PR #5) before the record existed. It now reads OPEN pending the Builder’s entry.
- Dispatch: `phase-0-log-004` to Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`. Allowed: append one entry to PHASE_LOG.md; local branch `cursor/phase-0-complete-log-fc41` and commit only. Push, PR, merge, deployment: not authorized.
- Next approvals needed from the human: push and one PR for that branch; later a merge bound to its head SHA. A docs-only merge does not trigger deployment beyond the existing workflow on `main` (the workflow runs on every push to `main`; a re-deploy of an unchanged site is expected and harmless).

## 2026-11-25T03:22:00Z | Review of dispatch phase-0-log-004 | ACCEPTED, awaiting push approval
- Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559` reported COMPLETE for `phase-0-log-004`. Handoff set to IDLE.
- Reviewed commit: `57ae413a5df1e1f19dfa1b2dc2201ac336e3ae24` on local branch `cursor/phase-0-complete-log-fc41`, based on `origin/main` `9daf225977436ccebb81707e10b3f88a7635ac21`. Not on the remote.
- Planner inspection: diff is `PHASE_LOG.md` only, 21 additions and 0 deletions; the existing BLOCKED entry is byte-identical; no key-like literals.
- Content check: the entry records the public URL, deployed revision `c8593de06523a07b596a4cef28967ec0d7f49c2b`, run link https://github.com/jacksonyang-amp/AmpliGen/actions/runs/45538301854, the SHA mapping (`13bca56` from `253badc`, `d0621b0` from `45cf208`, merge `c8593de`), approval references, deviations, and DoD items 1-4 PASS. Planner had already verified the same facts independently on `main` (typecheck, build, smoke exit 0; run 45538301854 success; URL 200).
- Criterion 4 record part: satisfied once this commit is on `main`. Phase 0 stays OPEN in `PROJECT_PLAN.md` until then.
- Not yet authorized: push, PR creation, and merge for this branch. Requested from the human: a named Approve for push plus one PR bound to commit `57ae413a5df1e1f19dfa1b2dc2201ac336e3ae24`. A later merge needs its own named Approve bound to the PR head. Any merge to `main` re-runs the Pages workflow and redeploys an unchanged site.

## 2026-11-25T03:18:00Z | Approval: push Phase 0 log commit and open one PR | RESERVED
- Source timestamp: 2026-11-24 19:18 America/Los_Angeles, recorded as 2026-11-25T03:18:00Z.
- Exact text: `Approve pushing cursor/phase-0-complete-log-fc41 at commit 57ae413a5df1e1f19dfa1b2dc2201ac336e3ae24 and opening one PR into main, no merge`
- Reviewed commit: `57ae413a5df1e1f19dfa1b2dc2201ac336e3ae24`. Confirmed locally: that SHA is the branch tip; three-dot diff against `origin/main` (`cfa7509afa5a7619a65f59ee99f2740928ad702a`) is `PHASE_LOG.md` only; merge-tree reports no conflicts.
- PR: none yet. The approval authorizes creating exactly one PR. It does not authorize merging it.
- Action: dispatch `phase-0-log-push-005` to Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559` to push that commit once and open one PR into `main`.
- Consequence: the push itself does not deploy. A later merge into `main` would re-run the Pages workflow and redeploy an unchanged site, and that merge is not approved.
- State: RESERVED. Becomes USED after the Builder reports the push and PR URL.

## 2026-11-25T03:22:00Z | Approval: push Phase 0 log commit and open one PR | USED
- Execution evidence: `refs/heads/cursor/phase-0-complete-log-fc41` on `origin` is `57ae413a5df1e1f19dfa1b2dc2201ac336e3ae24`. PR #9, https://github.com/jacksonyang-amp/AmpliGen/pull/9, is OPEN, not a draft, base `main`, head that SHA. It is the only PR for that branch.
- Builder note: the first push attempt was refused locally (exit 1) because the destination ref was not fully qualified. Nothing reached the remote. The second push, to `refs/heads/cursor/phase-0-complete-log-fc41`, succeeded once. The PR was created with `gh pr create` because the Builder had no PR tool. Recorded as a deviation.
- Planner verification: PR diff (three-dot against `main` at `cfa7509`) is `PHASE_LOG.md` only. A trial merge of the branch into current `main` has no conflicts, and the resulting Planner files match `main`.
- Still not authorized: merging PR #9. That needs a named Approve bound to head `57ae413a5df1e1f19dfa1b2dc2201ac336e3ae24`. Merging re-runs the Pages workflow and redeploys an unchanged site.
- Phase 0 stays OPEN in `PROJECT_PLAN.md` until PR #9 is merged and its log entry is on `main`.

## 2026-11-25T03:25:00Z | Approval: merge PR #9 | RESERVED
- Exact text: `Approve https://github.com/jacksonyang-amp/AmpliGen/pull/9 merge of commit 57ae413a5df1e1f19dfa1b2dc2201ac336e3ae24`
- Timestamp: 2026-11-24 19:25 America/Los_Angeles, recorded as 2026-11-25T03:25:00Z.
- PR: https://github.com/jacksonyang-amp/AmpliGen/pull/9 (OPEN, not a draft, base main). Reviewed head: `57ae413a5df1e1f19dfa1b2dc2201ac336e3ae24`. Three-dot diff: PHASE_LOG.md only. Trial merge into main at `596e7ec`: no conflicts.
- Authorized action: merge PR #9 once with a merge commit, pinned to the head above, via dispatch `phase-0-merge-006` to Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`. Nothing else is authorized.
- Consequence: the merge runs the Pages workflow and redeploys an unchanged site. Merging PR #8 earlier (`596e7ec`) also triggered a Pages run on the docs-only change.
- Prior record: PR #8 merged at 2026-11-25T03:24:52Z (`596e7ec`). The push approval 2026-11-25T03:18:00Z is USED (PR #9 open at 57ae413).
- State: USED at 2026-11-25T03:25:58Z. PR #9 merged at `950692b665d86dcf206809a01c5c518592aaa3da`. Pages run https://github.com/jacksonyang-amp/AmpliGen/actions/runs/45539939585 succeeded on that SHA. The Builder ran the merge once, pinned to the approved head, with no auto-merge.
- Post-merge check (Planner, 2026-11-25T03:26Z): https://jacksonyang-amp.github.io/AmpliGen/ returns HTTP 200 with `<title>API Platform Demo</title>`. `main` PHASE_LOG.md holds the COMPLETE entry.

## 2026-11-25T03:35:00Z | Scope authorization: start Phase 1 | RECORDED (scope only; no git action)
- Exact text: "Start with Phase 1"
- Source: Cursor chat with the human, 2026-11-24 19:34 America/Los_Angeles, recorded as 2026-11-25T03:35:00Z.
- Authorized: Planner dispatches `phase-1-build-007` (BUILD, product and pricing pages) to Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`. The Builder may create `build/phase-1`, commit locally there, and run the listed checks.
- Not authorized by this entry: push, PR creation, merge, or deployment. Each needs its own RESERVED approval bound to the reviewed commit and PR.

## 2026-11-25T03:35:00Z | Planner selections for Phase 1 | RECORDED
- Platform: Lumora API Platform (fictional demo name). Products: Lumora Gateway, Lumora Metrics, Lumora Connect.
- Pricing: Starter $49 per month and Growth $249 per month, both "Start a trial" to `/AmpliGen/sign-up/`; Enterprise custom, "Request a demo" to `/AmpliGen/demo-request/`. All labeled "Illustrative demo pricing. Not offered."
- Reason: Phase 1 requires these to be fixed before dispatch. They are fictional and carry no commercial commitment.
- Demo-request and sign-up show temporary notices with no input fields, so no data is collected or sent in this phase.

## 2026-11-25T03:42:00Z | Review of dispatch phase-1-build-007 | SENT BACK FOR ONE PLANNER CORRECTION
- Handoff set to IDLE before review, as PLANNER.md requires.
- Evidence: Planner clean-worktree run at `3a6ba6d4ad639e53ae7ca3e1e4494a857fcf89f1`: typecheck exit 0, build exit 0 (five route files in `dist/`), `smoke:phase1` exit 0 (91 passed), `smoke:phase0` exit 0 (28 passed). Scope and forbidden-content scans clean.
- Criteria: 1 PASS, 2 PASS, 3 PASS.
- Finding: the home page keeps the Phase 0 brand and the sentence "Product, pricing, and account pages will be added in later phases", and its hero CTAs do not link to the new pages. Cause: the Planner's handoff 007 said to keep home content. Decision: correct before any push, because a merge would publish a self-contradicting home page.
- Not authorized: push, PR, merge, or deployment. No approval has been requested for them yet.

## 2026-11-25T03:43:00Z | Dispatch phase-1-fix-008 issued | RECORDED
- Same Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`. Scope: home page alignment only (brand, stale sentence, hero CTAs, fixture, smoke:phase1 checks). It needs no new scope authorization: it is inside the Phase 1 scope authorized at 2026-11-25T03:35:00Z and it leaves `scripts/smoke-phase0.mjs` untouched.
- Git: local commits on the existing `build/phase-1` only. No push, PR, merge, or deployment.

## 2026-11-25T03:45:00Z | Review of dispatch phase-1-fix-008 | ACCEPTED
- Handoff set to IDLE before review.
- Evidence: Planner clean-worktree run at `3a1a163a624d050fbb9906c4e4a1b4f59c286ba8`: typecheck 0, build 0, smoke:phase1 0 (105 passed), smoke:phase0 0 (28 passed). Home page title, brand, CTAs, and absence of the stale sentence checked in `dist/index.html`. Changed files: index.html, fixture, smoke:phase1 script, PHASE_LOG.md, plus Phase 1 files from 007.
- Result: Phase 1 criteria 1-3 PASS on local `build/phase-1`. Phase 1 is NOT COMPLETE: push, PR, merge, and deployment are not yet authorized.
- Next: request the human's push and PR approval bound to `3a1a163a624d050fbb9906c4e4a1b4f59c286ba8`. No approval is recorded yet.

## 2026-11-25T03:43:00Z | Human instruction: rename the product and remove fictional/demo labels | AUTHORIZED (content only; no git action)
- Exact text: "This all looks good, but change "Lumora" to "AmpliGen" - that should be the name of the product moving forward. I also don't want any references on the site to it being "fictional" or "demo" either"
- Source: Cursor chat, 2026-11-24 19:43 America/Los_Angeles, recorded as 2026-11-25T03:43:00Z.
- Authorized: dispatch `phase-1-fix-009` renames the product to AmpliGen across the Phase 1 site, removes the "Fictional demo" banner, and removes "fictional" and "demo" wording that describes the site or its content.
- Authorized edit of `scripts/smoke-phase0.mjs`, lines 83-84 only, because they assert the removed wording. Its other checks are unchanged.
- Kept (Planner interpretation, to be reported to the human): the "Demo request" nav label, the `/demo-request/` route, "Request a demo" CTAs, and the demo-request notice. They name a request feature rather than describing the site. The sign-up notice keeps "Mock", as the brief requires simulated sign-up to be labeled.
- Not authorized by this entry: any change to `PROJECT_BRIEF.md`, which still describes the platform as fictional; push, PR, merge, or deployment.
- Builder: `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`. Dispatch: `phase-1-fix-009`. Local commits on `build/phase-1` only.

## 2026-11-25T03:48:00Z | Review of dispatch phase-1-fix-009 | ACCEPTED
- Handoff set to IDLE before review.
- Evidence: Planner clean-worktree run at `937b0f52d4921b96b8bd898c88c5a87e8b838609`: typecheck 0, build 0, smoke:phase1 0 (144 passed), smoke:phase0 0 (28 passed). Built HTML scan for `lumora|fictional|demonstration|demo-banner|api platform demo` outside attribute values: 0 hits. `git diff` of `scripts/smoke-phase0.mjs` is 4 lines (two assertions replaced).
- Result: Phase 1 criteria 1-3 PASS. Phase 1 is NOT COMPLETE: push, PR, merge, and deployment are not yet authorized.
- Next: request the human's push and PR approval bound to `937b0f52d4921b96b8bd898c88c5a87e8b838609`. No approval is recorded yet.
- Note: PROJECT_BRIEF.md still describes the platform as fictional. It was not edited, because the authorization did not name it.

## 2026-11-25T03:49:00Z | Approval: push build/phase-1 and open one PR | RESERVED
- Exact text: "Approve pushing build/phase-1 at commit 937b0f52d4921b96b8bd898c88c5a87e8b838609 and opening one PR into main, no merge"
- Source: Cursor chat, 2026-11-24 19:48 America/Los_Angeles, recorded as 2026-11-25T03:49:00Z.
- Reviewed commit: `937b0f52d4921b96b8bd898c88c5a87e8b838609` (branch `build/phase-1` head, verified by the Planner). Review: Phase 1 criteria 1-3 PASS (DECISIONS.md 2026-11-25T03:48:00Z).
- Authorized action: dispatch `phase-1-push-010` to Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`. Push `build/phase-1` once, at that commit, to `origin` as `build/phase-1`, and open exactly one PR into `main`. No merge.
- Consequence: a push to a non-main branch does not deploy. Merging the PR later re-runs the Pages workflow and redeploys the public site. That merge is not approved.
- Dispatch: `phase-1-push-010`. State: USED at 2026-11-25T03:50:00Z. Planner verified: `origin/build/phase-1` is `937b0f52d4921b96b8bd898c88c5a87e8b838609`; PR #12 (https://github.com/jacksonyang-amp/AmpliGen/pull/12) is OPEN, not a draft, base `main`, head that SHA; merge-tree against current `main` has no conflicts. The Builder did not append a PHASE_LOG entry for this dispatch, which the handoff made optional.
- Still not authorized: merging PR #12. That needs a separate named Approve bound to head `937b0f52d4921b96b8bd898c88c5a87e8b838609`.

## 2026-11-25T03:51:00Z | Approval: merge PR #12 | RESERVED
- Exact text: "Approve https://github.com/jacksonyang-amp/AmpliGen/pull/12 merge of commit 937b0f52d4921b96b8bd898c88c5a87e8b838609"
- Source: Cursor chat, 2026-11-24 19:49 America/Los_Angeles, recorded as 2026-11-25T03:51:00Z.
- PR: https://github.com/jacksonyang-amp/AmpliGen/pull/12 (OPEN, not a draft, base `main`). Reviewed head: `937b0f52d4921b96b8bd898c88c5a87e8b838609`. Verified by the Planner: merge-tree against `main` at `0dc5df6` has no conflicts.
- Authorized action: dispatch `phase-1-merge-011` to Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`. Merge PR #12 once, as a merge commit, pinned to that head. Nothing else.
- Consequence: the merge runs the Pages workflow and redeploys the public site with the AmpliGen pages.
- State: RESERVED. Becomes USED after the Builder reports the merge commit and Pages run.

## 2026-11-25T03:52:00Z | Approval: merge PR #12 | USED
- Merged at 2026-11-25T03:50:36Z as `2abd6ff9dc6205a884e3ccf0555e452282becf32` (merge commit; `origin/main` now at that SHA). Pinned to head `937b0f52d4921b96b8bd898c88c5a87e8b838609` with `--match-head-commit`, once, no auto-merge.
- Pages run https://github.com/jacksonyang-amp/AmpliGen/actions/runs/45542736922 succeeded on `2abd6ff9dc6205a884e3ccf0555e452282becf32`.
- Planner post-merge check (2026-11-25T03:52Z): https://jacksonyang-amp.github.io/AmpliGen/ returns HTTP 200 with `<title>AmpliGen</title>`; `/product/`, `/pricing/`, `/demo-request/`, and `/sign-up/` return HTTP 200 with titles `Product | AmpliGen`, `Pricing | AmpliGen`, `Request a demo | AmpliGen`, and `Sign up | AmpliGen`. The home page contains no `lumora`, `fictional`, or `demo-banner`.
