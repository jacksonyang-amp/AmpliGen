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

## 2026-11-25T03:57:00Z | Scope authorization: start Phase 2 | RECORDED (scope only; no git action)
- Exact text: "Start Phase 2"
- Source: Cursor chat, 2026-11-24 19:56 America/Los_Angeles, recorded as 2026-11-25T03:57:00Z.
- Authorized: Planner dispatches `phase-2-build-012` (BUILD, simulated conversions and identities) to Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`. The Builder may create `build/phase-2` from `origin/main`, commit locally there, and run the listed checks.
- Authorized with it, as a necessary consequence of replacing the placeholder notices with forms: edits to `scripts/smoke-phase1.mjs` and `src/content/phase1.fixtures.json`, limited to (a) the "no form controls" check, which must no longer apply to `/demo-request/` and `/sign-up/`, and (b) the placeholder-notice checks and fixture copy for those two pages. Every other Phase 1 check stays.
- Not authorized by this entry: push, PR creation, merge, deployment, live bot traffic, or any vendor SDK.

## 2026-11-25T03:57:00Z | Planner selections for Phase 2 | RECORDED
- Contract basis: `docs/custom-events.yml`, written by the human (commit `91dc9b7`). Phase 2's action and identity contract mirrors its two business actions and its identity properties. This is NOT final approval of the Phase 3 event contract; the Planner will ask the human to approve it before Phase 3.
- Identity and mapping rules, privacy rules, synthetic labeling, and routes are fixed in PROJECT_PLAN.md Phase 2 and BUILDER_HANDOFF.md. Reason: the plan requires the Planner to define email-to-account mapping, unknown-domain behavior, and synthetic labeling before dispatch.
- Departure from a first draft: user IDs are not derived from an email hash. The contract file says `user_id` is a stable visitor ID preserved through sign-up, which is also safer.
- Scope check: no excluded feature is added. There is no real authentication, no password field, no backend, no lead delivery, and no payments.

## 2026-11-25T04:20:00Z | Review of dispatch phase-2-build-012 | ACCEPTED
- Handoff set to IDLE before review, as PLANNER.md requires.
- Evidence: Planner clean-worktree run at `fd8bae63dae88216f376c5668ba095daff20c8c1`: typecheck 0, build 0 (seven routes), smoke:phase2 0 (132 passed), bot:dry-run 0 (16 lines, identical across runs, no email or persona name in output), smoke:phase1 0 (146 passed), smoke:phase0 0 (28 passed). Source read: contract, identity, flow, UI wiring, navigation, bot runner, and page markup match the handoff. Scope check: 35 changed files, none outside the allowed list.
- Result: Phase 2 criteria 1-3 PASS. Phase 2 is NOT COMPLETE: push, PR, merge, and deployment are not yet authorized. Browser behavior of the forms is UNVERIFIED and deferred to Phase 5.
- Decision on the Builder's flag: persona user IDs containing a fictional name token are accepted (they are fixture labels, not personal data). Reversible later.
- Next: request the human's push and PR approval bound to `fd8bae63dae88216f376c5668ba095daff20c8c1`. No approval is recorded yet.

## 2026-11-25T04:16:00Z | Approval: push build/phase-2 and open one PR | USED
- Exact text: "Approve pushing build/phase-2 at commit fd8bae63dae88216f376c5668ba095daff20c8c1 and opening one PR into main, no merge"
- Source: Cursor chat, 2026-11-24 20:14 America/Los_Angeles, recorded as 2026-11-25T04:16:00Z.
- Reviewed commit: `fd8bae63dae88216f376c5668ba095daff20c8c1` (branch `build/phase-2` head, verified by the Planner before this record). Review: Phase 2 criteria 1-3 PASS (DECISIONS.md 2026-11-25T04:20:00Z).
- Authorized action: dispatch `phase-2-push-013` to Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`. Push `build/phase-2` once, at that commit, to `origin` as `build/phase-2`, and open exactly one PR into `main`. No merge.
- Consequence: a push to a non-main branch does not deploy. Merging the PR later re-runs the Pages workflow and redeploys the public site. That merge is not approved.
- State: USED at 2026-11-25T04:18:00Z. Planner verified: `origin/build/phase-2` is `fd8bae63dae88216f376c5668ba095daff20c8c1`; PR #14 (https://github.com/jacksonyang-amp/AmpliGen/pull/14) is OPEN, not a draft, base `main`, head that SHA, auto-merge off; GitHub reports it mergeable. The Builder did not edit or commit any file. A push of `build/phase-2` does not deploy, because `.github/workflows/deploy-pages.yml` runs only on `main`.
- Still not authorized: merging PR #14. That needs a separate named Approve bound to head `fd8bae63dae88216f376c5668ba095daff20c8c1`. Merging redeploys the public site.

## 2026-11-25T04:21:00Z | Approval: merge PR #14 | RESERVED
- Exact text: "Approve https://github.com/jacksonyang-amp/AmpliGen/pull/14 merge of commit fd8bae63dae88216f376c5668ba095daff20c8c1"
- Source: Cursor chat, 2026-11-24 20:20 America/Los_Angeles, recorded as 2026-11-25T04:21:00Z.
- PR: https://github.com/jacksonyang-amp/AmpliGen/pull/14 (OPEN, not a draft, base `main`). Reviewed head: `fd8bae63dae88216f376c5668ba095daff20c8c1`, confirmed on `origin/build/phase-2`.
- Base moved: `origin/main` is `0f21228c0fafb3b26043942fd8375554710dec5d`, the squash of PR #13 (BUILDER_HANDOFF.md, DECISIONS.md, PROJECT_PLAN.md only). Merge-tree of PR #14 onto that main has no conflicts. The approved head did not change.
- Authorized action: dispatch `phase-2-merge-014` to Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`. Merge PR #14 once, as a merge commit, pinned to that head. Nothing else.
- Consequence: the merge runs the Pages workflow and redeploys the public site with the simulated demo-request and sign-up forms.
- State: USED at 2026-11-25T04:22:28Z. Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559` merged PR #14 once, with a merge commit, pinned to `fd8bae63dae88216f376c5668ba095daff20c8c1`. Merge commit `cc19af9d9c625249dc7283d2eefbdff15ada0f2d`, which is the new `origin/main`. Pages run https://github.com/jacksonyang-amp/AmpliGen/actions/runs/45546338461 concluded success on that commit.
- Planner verified: `origin/main` contains `demo-request/success/index.html` and `scripts/smoke-phase2.mjs`. The live site returns HTTP 200 for `/`, `/product/`, `/pricing/`, `/demo-request/`, `/demo-request/success/`, `/sign-up/`, and `/welcome/`. `/sign-up/` shows the simulated notice and has no password input.
- Nothing else is authorized: no further merge, no deployment, no live bot traffic, and no vendor SDK.

## 2026-11-25T04:24:00Z | Review of dispatch phase-2-merge-014 | ACCEPTED
- Handoff set to IDLE before review, as PLANNER.md requires.
- Evidence: PR #14 merged at `cc19af9d9c625249dc7283d2eefbdff15ada0f2d`; Pages run 45546338461 succeeded; live pages return HTTP 200 with the expected titles; sign-up shows the simulated notice; no password input on the live sign-up page.
- Result: Phase 2 criteria 1-3 PASS and the live deployment check PASS. Phase 2 is COMPLETE. Browser behavior of the forms (focus after an error, persona prefill, storage, real navigation, reload not emitting) is still UNVERIFIED and is assigned to the Phase 5 verify phase.
- Next: Phase 3 needs a human-approved Amplitude event contract and its own scope authorization before any dispatch. None is recorded yet.

## 2026-11-25T04:35:00Z | Human answers on the Phase 3 contract and replay settings | RECORDED (no dispatch; Phase 3 not started)
- Exact text, replying to the Planner's four questions: "1. Yes, right / 2. Leave it unmasked for now and capture 100% of sessions / 3. Yes / 4. I did put the key in Github"
- Source: Cursor chat, 2026-11-24 20:35 America/Los_Angeles, recorded as 2026-11-25T04:35:00Z.
- Q1 accepted: Phase 3 sends only the two custom actions in `docs/custom-events.yml` (`Demo Request Submitted`, `Sign Up Completed`) and relies on Amplitude Autocapture for page views and clicks. The contract file is approved as the Phase 3 Amplitude event contract, unchanged. This is not approval of the Statsig side (Phase 4).
- Q3 accepted: the Builder may rely on `account_id` as an event property and must verify, against current official Amplitude documentation, whether account-level reporting needs account groups and what entitlement it needs. It logs BLOCKED, not a workaround, if the plan lacks the entitlement.
- Q4 recorded as the human's statement only: the Amplitude browser key is in GitHub secrets. The Planner cannot read repository secrets (HTTP 403 on the secrets API with its token), so this is NOT VERIFIED. The workflow reads `secrets.NEXT_PUBLIC_AMPLITUDE_API_KEY`, so the secret must have exactly that name. The Builder checks for a key in the build and reports; it never prints the value.
- Q2 recorded, with a conflict that is OPEN: the human chose unmasked replay and 100% of sessions. The live forms say "Nothing you enter is sent anywhere" and "nothing is sent". Unmasked replay would record the name and email a visitor types into those fields and send them to Amplitude, so that copy would become false, and a real visitor on the public site could enter a real address. The plan's own check requires the Planner to look for real-user-data exposure. The Planner asked the human to choose between masking only the form fields, changing the form copy, or accepting the mismatch. No Phase 3 replay setting is fixed until the human answers.
- Not authorized by this entry: starting Phase 3, any dispatch, push, PR, merge, deployment, or any Amplitude or Statsig setup. Scope authorization for Phase 3 ("Start Phase 3" or equivalent) is still needed.

## 2026-11-25T04:38:00Z | Human decisions: replay settings and start Phase 3 | AUTHORIZED (scope only; no git action beyond local commits)
- Exact text, from the Cursor chat form: "Question replay: Selected option(s) unmasked_keep_copy" and "Question start: Selected option(s) start". The options were: "Fully unmasked, 100% of sessions, and leave the copy as it is." and "Yes, start Phase 3".
- Source: Cursor chat, 2026-11-24 20:37 America/Los_Angeles, recorded as 2026-11-25T04:38:00Z. Question text shown to the human: "The live forms say 'Nothing you enter is sent anywhere' and 'nothing is sent'. Unmasked session replay would record the name and email typed into them and send that to Amplitude, and a real visitor on the public site could type a real address." and "Authorize starting Phase 3 (Amplitude analytics and replay) as a BUILD dispatch to the Builder, local commits only, once the replay choice above is recorded? Push, PR and merge would each still need their own approval."
- Resolves the open conflict in the 2026-11-25T04:35:00Z entry as the human's informed choice: Session Replay captures 100% of sessions with no masking, and the form copy is not changed. The Planner records one consequence for the human to weigh at merge time: once deployed with the key, replay can record what a visitor types into the name and email fields, while those pages say nothing is sent. The Planner will restate this in the merge approval request. Replay settings stay in one place so masking can be turned on later without a rewrite.
- Authorized: dispatch `phase-3-build-015` (BUILD) to Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`. The Builder may create `build/phase-3` from `origin/main`, commit locally there, run `npm install @amplitude/unified` and the listed checks, and read official Amplitude documentation.
- Authorized with it, as a necessary consequence of adding the SDK: narrow edits to `scripts/smoke-phase1.mjs` and `scripts/smoke-phase2.mjs`. Those scripts assert that no Amplitude SDK, no `initAll`, no environment access, and no runtime dependency exist; those assertions change to allow only `@amplitude/unified` and only `src/analytics/`, as listed in BUILDER_HANDOFF.md. Every other check stays.
- Planner selections for Phase 3 (also in BUILDER_HANDOFF.md): only the two contract actions are sent as custom events; Autocapture covers page views and clicks unless a feature would record typed values; the user ID is the contract `user_id`; one guarded `initAll()`; no key means no SDK calls and no sink; the Feature Experiment module is configured but assigns nothing; the bot runner stays sinkless and network-free; a bounded flush of at most 1000 ms runs before form navigation if the SDK does not guarantee delivery.
- Not authorized by this entry: push, PR creation, merge, deployment, any Statsig work, guide or survey content, any live Amplitude traffic, or any change to the workflow or the key.
- Credential note: the Amplitude key is the human's statement (04:35:00Z entry). The Planner cannot see repository secrets. Live delivery to Amplitude is UNVERIFIED until a deployed build is checked in a VERIFY step.

## 2026-11-25T04:50:00Z | Review of dispatch phase-3-build-015 | ACCEPTED (build only; push, PR, and merge NOT approved)
- Handoff set to IDLE before review, as PLANNER.md requires.
- Reviewed head: local `build/phase-3` at `8127b0dc321ba56d206f8ead26b739afdeaf5705` (base `origin/main` at `a27066f`). The Builder logged COMPLETE in PHASE_LOG.md at `5befd0f`; the later commit `8127b0d` corrects one unverified sentence in that entry.
- Evidence: a clean worktree at `8127b0d` ran `npm ci` (0), `typecheck` (0), `build` (0), `smoke:phase3` (0, 101 passed), `smoke:phase2` (0, 132 passed), `smoke:phase1` (0, 151 passed), `smoke:phase0` (0, 30 passed), and `bot:dry-run` (0, 20 lines).
- Scope: 17 changed files, all on the allowed list. Runtime dependency is only `@amplitude/unified` (^1.2.6). Dev dependencies are unchanged (`typescript`, `vite`). `package.json` description still reads "Fictional API Platform Demo" (outside the allowed edits; noted, not blocking).
- Single guarded init: `initAll(` is called only in `src/analytics/amplitude-adapter.ts`, and only from `src/analytics/controller.ts` when `VITE_AMPLITUDE_API_KEY` is a non-empty string. Without a key, the active handle is a no-op and no sink is attached. No key-like literal in `src/` or `dist/`. The SDK code is present in the bundle but never initialized without a key.
- Replay: `sampleRate: 1`, `defaultMaskLevel: 'light'`, `unmaskSelector: ['input','select','textarea']`, per the human's 04:38:00Z decision. The SDK's behavior for these options is UNVERIFIED in a browser.
- Sink: only the two contract actions are sent, with `insert_id` = `event_id`. Page views and clicks come from Autocapture. Feature Experiment is configured with fetch, polling, automatic exposure, and automatic fetch all off. Guides and Surveys is enabled as a capability with no content.
- Form wiring: `forms.ts` changes are identity-sync calls and the bounded 1000 ms flush before navigation. No field, copy, or validation changed.
- Non-blocking notes for the merge decision: (a) on page load, `syncIdentity` sets `is_synthetic` from persona or account only, so a returning visitor with a `.example` address shows `false` until their next submission sets it correctly; the per-event value is correct. (b) The sink attaches when `initAll()` is called, not when it resolves; the SDK queues calls, and the sink is removed if init rejects. (c) The Builder added a `setGroup` method beyond the five listed in the handoff; the account group is set only when an account is mapped.
- UNVERIFIED (carried to the merge decision and Phase 5): live delivery to Amplitude; replay capture; whether the Amplitude project sets its own mask level, which would override these local settings; account-level reporting and the Accounts add-on; browser behavior of the forms, the identity sync, the bounded flush, and Autocapture; and whether the `NEXT_PUBLIC_AMPLITUDE_API_KEY` secret exists as a valid browser key.
- Result: Phase 3 build criteria 1-3 PASS on local `build/phase-3`. Phase 3 is NOT COMPLETE: push, PR, and merge are not authorized. Merging deploys the site with the key and starts recording sessions unmasked at 100%.
- Next: request the human's push and PR approval bound to `8127b0dc321ba56d206f8ead26b739afdeaf5705`. No such approval is recorded yet.

## 2026-11-25T04:59:00Z | Approval: push build/phase-3 and open one PR | RESERVED
- Exact text: "Approve pushing build/phase-3 at commit 8127b0dc321ba56d206f8ead26b739afdeaf5705 and opening one PR into main, no merge"
- Source: Cursor chat, 2026-11-24 20:59 America/Los_Angeles, recorded as 2026-11-25T04:59:00Z.
- Reviewed commit: `8127b0dc321ba56d206f8ead26b739afdeaf5705` (local branch `build/phase-3` head, verified by the Planner before this record). Review: Phase 3 criteria 1-3 PASS (DECISIONS.md 2026-11-25T04:50:00Z).
- Authorized action: dispatch `phase-3-push-016` to Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`. Push `build/phase-3` once, at that commit, to `origin` as `build/phase-3`, and open exactly one PR into `main`. No merge.
- Consequence: a push to a non-main branch does not deploy. Merging the PR later re-runs the Pages workflow, redeploys the public site with the Amplitude key, and starts recording sessions unmasked at 100%. That merge is not approved.
- State: USED at 2026-11-25T05:01:00Z by dispatch `phase-3-push-016`. Planner verified: `origin/build/phase-3` is `8127b0dc321ba56d206f8ead26b739afdeaf5705`; PR #17 (https://github.com/jacksonyang-amp/AmpliGen/pull/17) is OPEN, not a draft, base `main`, head that SHA, auto-merge off. The Builder changed no files. No Pages run started for `build/phase-3`.
- Still not authorized: merging the resulting PR, any new commit, any force-push, deployment, Statsig, or live verification.

## 2026-11-25T05:01:00Z | Review of dispatch phase-3-push-016 | ACCEPTED (push and PR only; merge NOT approved)
- Handoff set to IDLE before review, as PLANNER.md requires.
- Evidence: `git ls-remote` shows `refs/heads/build/phase-3` at `8127b0dc321ba56d206f8ead26b739afdeaf5705`. PR #17 is open, not a draft, base `main`, head `build/phase-3` at that SHA, auto-merge off, and its body states that merging deploys and starts recording.
- Result: the push and the one PR are complete. Phase 3 remains BUILD REVIEWED, not COMPLETE. Merge needs its own RESERVED approval naming PR #17 and head `8127b0dc321ba56d206f8ead26b739afdeaf5705`, with the replay consequence restated.
- Next: none without the human's merge approval.

## 2026-11-25T05:05:00Z | Approval: merge PR #17 | RESERVED
- Exact text: "Approve https://github.com/jacksonyang-amp/AmpliGen/pull/17 merge of commit 8127b0dc321ba56d206f8ead26b739afdeaf5705"
- Source: Cursor chat, 2026-11-24 21:05 America/Los_Angeles, recorded as 2026-11-25T05:05:00Z.
- PR: https://github.com/jacksonyang-amp/AmpliGen/pull/17 (OPEN, not a draft, base `main`, auto-merge off). Reviewed head: `8127b0dc321ba56d206f8ead26b739afdeaf5705`, confirmed on `origin/build/phase-3`.
- Base moved: `origin/main` is `e8cb9ba`, the squash of PR #16 (planning files only). `git merge-tree --write-tree origin/main origin/build/phase-3` exits 0. The approved head did not change. Do not rebase or add a commit.
- Authorized action: dispatch `phase-3-merge-017` to Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`. Merge PR #17 once, as a merge commit, pinned to that head. Nothing else.
- Consequence, accepted with this approval: the merge runs the Pages workflow and redeploys the public site with the Amplitude key. Session Replay then records every session with form fields unmasked, so a name or email typed into the demo-request or sign-up form can be sent to Amplitude while those pages say nothing is sent.
- State: USED at 2026-11-25T05:06:43Z by dispatch `phase-3-merge-017`. Planner verified: PR #17 merged as merge commit `b982f973d3e5fc93c1e9cb953a3fe61356670317` (parents `e8cb9ba` and `8127b0dc321ba56d206f8ead26b739afdeaf5705`); `origin/main` is that commit.

## 2026-11-25T05:10:00Z | Review of dispatch phase-3-merge-017 | ACCEPTED
- Handoff set to IDLE before review, as PLANNER.md requires.
- Evidence: `origin/main` is `b982f973d3e5fc93c1e9cb953a3fe61356670317`, a merge commit whose second parent is the approved `8127b0dc321ba56d206f8ead26b739afdeaf5705`. Pages run 45551295975 (push to `b982f97`) completed with build and deploy both successful. Live HTTP 200 for `/AmpliGen/`, `/product/`, `/pricing/`, `/demo-request/`, `/demo-request/success/`, `/sign-up/`, and `/welcome/`. The deployed main bundle contains the Amplitude Unified SDK and its US endpoints. The key value was not inspected or printed.
- Result: Phase 3 build and deployment checks PASS. Live Amplitude delivery, replay capture, the Amplitude project's own mask setting, account reporting, and browser form behavior are UNVERIFIED. The SDK's bundled defaults include `fetchOnStart: true`; this build passes `false` for Feature Experiment, which Phase 5 must confirm at runtime.
- Consequence now live: Session Replay records every session at 100% with form fields unmasked. The form pages say nothing is sent. This is the accepted choice from DECISIONS.md 2026-11-25T04:38:00Z and 2026-11-25T05:05:00Z.
- Next: Phase 5 VERIFY, which must test the live site with the key before the project is declared complete. Phase 4 is not started and needs its own scope authorization.

## 2026-11-25T05:18:00Z | Human instruction: continue to Phase 4 | AUTHORIZED (scope only; local commits only)
- Exact text: "continue to Phase 4"
- Source: Cursor chat, 2026-11-24 21:18 America/Los_Angeles, recorded as 2026-11-25T05:18:00Z.
- Accepted as scope authorization to start Phase 4 (Statsig experiments and controls). This does not approve a push, a pull request, a merge, or a deployment.
- Authorized: dispatch `phase-4-build-018` (BUILD) to Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`. The Builder may create `build/phase-4` from `origin/main`, commit locally there, install `@statsig/js-client`, and run the checks in BUILDER_HANDOFF.md.
- Authorized with it, as a necessary consequence of adding the SDK: narrow edits to `scripts/smoke-phase1.mjs`, `scripts/smoke-phase2.mjs`, and `scripts/smoke-phase3.mjs`. Those scripts assert that no Statsig package or code exists. The assertions change to allow only `@statsig/js-client`, imported only from `src/statsig/statsig-adapter.ts`, as listed in the handoff. Every other check stays.
- Planner selections, fixed for this phase:
  - Assignment unit: the contract `user_id`, shared with Amplitude. Custom attributes are `is_synthetic` and, when mapped, `account_id`. No email, name, or free text.
  - Experiment `pricing_cta_copy`, parameter `label_mode`. Control keeps the current labels. Treatment `specific` changes Starter and Growth to "Start a free trial" and Enterprise to "Talk to sales". Hrefs do not change. Hypothesis: more specific labels increase `Sign Up Completed` among visitors who see pricing. `Demo Request Submitted` is the secondary metric. Synthetic results are not causal evidence.
  - Gate `metrics_account_breakdown` on the product page. The section "Account breakdown shows usage and conversion for the mapped account." is hidden unless the gate passes. It shows no account name or email.
  - Dynamic config `pricing_notice`, string parameter `notice`, rendered as text into the existing pricing label. Fallback remains "Illustrative pricing. Not offered." Values that are not a string, or are longer than 120 characters, use the fallback.
  - One exposure per evaluation, logged by the Statsig client. No `Experiment Exposure` business event, and no Amplitude `track` call for an exposure. The documented forwarding path is the Statsig console integration Amplitude Native, which this repository cannot turn on. Live forwarding is UNVERIFIED.
  - The two contract events are logged once to Statsig and once to Amplitude, with the same `event_id`.
- Consequence, recorded now and to be restated at merge: with a client key, the deployed site sends those two events and the exposures to Statsig, while the form and welcome pages still say nothing is sent. That matches the earlier choice to keep the copy.
- Not authorized: push, PR creation, merge, deployment, live bot traffic, a second Statsig package, Amplitude-controlled assignment, guide or survey content, or any console change.
- Credential note: live evaluation needs the GitHub secret `NEXT_PUBLIC_STATSIG_CLIENT_KEY` to be the project's browser client key. The Planner cannot see repository secrets. The three console entities above also have to exist before live assignment works. Neither is verified. The build must work with the fallbacks when the key is absent.

## 2026-11-25T05:40:00Z | Review of dispatch phase-4-build-018 | ACCEPTED (build only; push, PR, and merge NOT approved)
- Handoff set to IDLE before review, as PLANNER.md requires.
- Reviewed head: local `build/phase-4` at `0ad165dc71a471c03fde776b9f9098110d830389`, based on `origin/main` `cf86b14`. Commits: `0bde841` (Statsig client, evaluations, event log, shared flush), `08af3a4` (`smoke:phase4` and narrow smoke edits), `8321cb2` (README), `0ad165d` (PHASE_LOG.md entry).
- Evidence: a clean worktree at `0ad165d` ran `npm ci` (0), `typecheck` (0), `build` (0), `smoke:phase4` (0, 157 passed), `smoke:phase3` (0, 101 passed), `smoke:phase2` (0, 132 passed), `smoke:phase1` (0, 151 passed), `smoke:phase0` (0, 30 passed), and `bot:dry-run` (0). No key-like literal in `src/` or `dist/`.
- Scope: 23 changed files, all on the allowed list. Runtime dependencies are `@amplitude/unified` `^1.2.6` and `@statsig/js-client` `^3.33.8`. Dev dependencies are unchanged. The only Statsig import is in `src/statsig/statsig-adapter.ts`. One `StatsigClient` construction, guarded by a non-empty key and run once per page load.
- Entities and fallbacks match the handoff: experiment `pricing_cta_copy` (`label_mode`), gate `metrics_account_breakdown`, config `pricing_notice` (`notice`). Each is evaluated once per page load, only on the page that shows it. Treatment labels change only the three CTA texts. Hrefs and control labels are unchanged. The gate section is added by script only and hidden in the markup.
- Scope deviations accepted: (a) `src/analytics/handle.ts` and one line of `controller.ts` changed so one flush wait covers both services. With no Statsig client it delegates to the Amplitude handle as before. (b) `smoke-phase2` also allows the exact `VITE_STATSIG_CLIENT_KEY` read inside `src/statsig/`. (c) `product/index.html` gained one empty hidden paragraph and `style.css` one spacing rule. (d) An empty or blank `notice` falls back too. All four are small and reasoned in PHASE_LOG.md.
- Result: Phase 4 build criteria 1-3 PASS on local `build/phase-4`. Phase 4 is NOT COMPLETE: push, PR, and merge are not authorized.
- Known behavior to check in Phase 5: with a client key, the pricing and product pages render control content first and apply the treatment labels, notice, or gate section after Statsig initializes, which can take up to 3000 ms. The page can change visibly after load.
- Privacy change to restate at merge: with a key, the deployed site sends the user ID, the two business events (with `event_id`, `user_id`, `is_synthetic`, `account_id` when mapped, and product and plan properties), and the exposures to Statsig. The Statsig client also stores a device ID in `localStorage`, sends its own diagnostics, attaches the page URL, and exposes the request IP and user agent to Statsig servers. The form and welcome pages still say nothing is sent. No email, name, or free text is sent by this repository.
- UNVERIFIED: live Statsig assignment; exposure forwarding to Amplitude through the console integration; delivery of the two events to Statsig; that the three console entities exist; that `NEXT_PUBLIC_STATSIG_CLIENT_KEY` is a valid browser client key; browser behavior, including the label switch after load and the flush before navigation.
- Next: request the human's push and PR approval bound to `0ad165dc71a471c03fde776b9f9098110d830389`. No such approval is recorded yet.

## 2026-11-25T05:42:00Z | Approval: push build/phase-4 and open one PR | RESERVED
- Exact text: "Approve pushing build/phase-4 at commit 0ad165dc71a471c03fde776b9f9098110d830389 and opening one PR into main, no merge"
- Source: Cursor chat, 2026-11-24 21:39 America/Los_Angeles, recorded as 2026-11-25T05:42:00Z.
- Reviewed commit: `0ad165dc71a471c03fde776b9f9098110d830389` (local branch `build/phase-4` head, verified by the Planner before this record). Review: Phase 4 criteria 1-3 PASS (DECISIONS.md 2026-11-25T05:40:00Z).
- Authorized action: dispatch `phase-4-push-019` to Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`. Push `build/phase-4` once, at that commit, to `origin` as `build/phase-4`, and open exactly one PR into `main`. No merge.
- Consequence: a push to a non-main branch does not deploy. Merging the PR later re-runs the Pages workflow and redeploys the public site. If the Statsig client key is present, that deploy initializes Statsig and sends the two business actions and the exposures. That merge is not approved.
- State: USED at 2026-11-25T05:41:00Z by dispatch `phase-4-push-019`. Planner verified: `origin/build/phase-4` is `0ad165dc71a471c03fde776b9f9098110d830389`; PR #20 is the one PR into `main` for that head (OPEN, not a draft, auto-merge off). The Builder changed no files. No Pages run started for `build/phase-4`.
- Still not authorized: merging the resulting PR, any new commit, any force-push, deployment, or live verification.

## 2026-11-25T05:43:00Z | Review of dispatch phase-4-push-019 | ACCEPTED (push and PR only; merge NOT approved)
- Handoff set to IDLE before review, as PLANNER.md requires.
- Evidence: `git ls-remote` shows `refs/heads/build/phase-4` at `0ad165dc71a471c03fde776b9f9098110d830389`. PR #20 is open, not a draft, base `main`, head `build/phase-4` at that SHA, auto-merge off. The Builder changed no files and made no commit.
- Result: the push and the one PR are complete. Phase 4 remains BUILD REVIEWED, not COMPLETE. Merge needs its own RESERVED approval naming PR #20 and head `0ad165dc71a471c03fde776b9f9098110d830389`.
- Next: none without the human's merge approval.

## 2026-11-25T05:46:00Z | Human direction: theme, copy, and later exposure forwarding | AUTHORIZED (local commits only)
- Exact text: "The exposure forwarding will be handled later when I enable it. The data is starting to show up in Amplitude. I want a less bland design for the site (think dark mode with contrasting colors) and remove the text on the site that says things are simulated - no public traffic is actually going to engage with this site in any sort of real way, it's clear that it's fake and will only be used by bots and internal testing"
- Source: Cursor chat, 2026-11-24 21:46 America/Los_Angeles, recorded as 2026-11-25T05:46:00Z.
- Exposure forwarding: the human will enable it later in the Statsig console. No client-side forwarder is authorized. The Phase 4 choice to log exposures only to Statsig stands.
- Amplitude delivery: the human reports that data is appearing in the Amplitude project. The Planner has not opened that project. Recorded as the human's statement. Replay, account reporting, and browser behavior stay UNVERIFIED.
- Copy: this replaces the earlier choice to keep the "nothing is sent" and "simulated" sentences (DECISIONS.md 2026-11-25T04:38:00Z). Those sentences, and the pricing and footer lines that say the content is illustrative or not offered, come off the site. "Request a demo" and the demo-request route stay. The audience is bots and internal testing; the pages should read as the product.
- Theme: one dark theme with the contrasting accent colors named in BUILDER_HANDOFF.md. No theme toggle and no new layout.
- Authorized: dispatch `phase-4-design-020` to Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`. New local commits on the existing `build/phase-4`, on top of `0ad165dc71a471c03fde776b9f9098110d830389`.
- Not authorized: push, a new pull request, merge, deployment, or any change to events, identity, or Statsig assignment. PR #20 remains at the reviewed head until a later approval names the new commit.

## 2026-11-25T05:55:00Z | Result of dispatch phase-4-design-020 | BLOCKED; correction authorized as phase-4-design-021
- Handoff set to IDLE for the block, then re-issued below, as PLANNER.md requires.
- Builder report: BLOCKED. Local `build/phase-4` is `4ff641332950719ba41309b60258a4ce50b7b746` (commits `181ec64` theme and copy, `4ff6413` PHASE_LOG.md). `typecheck`, `build`, `smoke:phase4` (157), `smoke:phase3` (101), `smoke:phase2` (132), `smoke:phase1` (185), and `bot:dry-run` exit 0. `smoke:phase0` exits 1 with 29 passed and 1 failed: "home page has in-page navigation targets".
- Verified by the Planner: `scripts/smoke-phase0.mjs` requires `id="about"` on the home page. `origin/build/phase-4` is still `0ad165dc71a471c03fde776b9f9098110d830389`, so PR #20 is unchanged.
- Cause: a Planner error. The 05:46:00Z handoff required removing the About section and forbade editing `smoke-phase0`, which cannot both hold.
- Decision: the human's direction removes the About section, so the Phase 0 check loses its `id="about"` condition. Authorized as a necessary consequence of that direction: one edit to `scripts/smoke-phase0.mjs`, removing only the `id="about"` condition from that one check. No hidden placeholder element, and no other change to that file. This follows the same pattern as the earlier narrow smoke edits.
- Authorized: dispatch `phase-4-design-021` to Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`, new local commits on `build/phase-4` on top of `4ff6413`.
- Not authorized: push, a new pull request, merge, deployment. The theme and copy are not accepted yet; the Planner reviews the whole revision after this correction.

## 2026-11-25T06:05:00Z | Review of dispatch phase-4-design-021 | ACCEPTED (local only; push and merge NOT approved)
- Handoff set to IDLE before review, as PLANNER.md requires.
- Reviewed head: local `build/phase-4` at `49b8aac462658b6a96481ac4158467a6b972641a` (commits `181ec64` theme and copy, `4ff6413` log, `d040d98` smoke:phase0 edit, `49b8aac` log), on top of `0ad165dc71a471c03fde776b9f9098110d830389`. `origin/build/phase-4` is still `0ad165d`, so PR #20 is unchanged.
- Verified by the Planner in a clean worktree at `49b8aac`: `npm ci`, `typecheck`, and `build` exit 0. `smoke:phase4` 157, `smoke:phase3` 101, `smoke:phase2` 132, `smoke:phase1` 185, and `smoke:phase0` 30 all pass with 0 failures. `bot:dry-run` exits 0 and its output hash is identical to `0ad165d`, so events, identity, and fixtures are unchanged.
- Scope: 15 files changed against `0ad165d`, all inside the allowed set (`src/style.css`, the seven HTML pages, `src/content/phase1.fixtures.json`, `smoke-phase0/1/2/4`, `README.md`, `PHASE_LOG.md`). No source under `src/analytics`, `src/statsig`, `src/events`, or `src/identity` changed. The `smoke-phase0.mjs` diff is the single authorized line: the `id="about"` condition removed. No hidden About element exists.
- Copy: the built HTML contains none of `simulat`, `illustrative`, `not offered`, `nothing is sent`, `nothing was sent`, `no real customers`, `static site`, `fictional`, or `lumora`. `smoke:phase1` now fails if any of them returns.
- Theme: the stylesheet uses the nine handoff colors with `color-scheme: dark`. Error text and the invalid-field border use the focus amber `#ffb020` (the handoff named no error color); accepted.
- Browser check by the Planner (headless Chrome against `vite preview`, no analytics keys): home, pricing, product, sign-up, and demo-request success rendered at 1280 px and 390 px. Dark canvas, teal primary buttons, outlined secondary buttons, readable text, no overflow, no disclaimer copy; pricing shows "Plans for teams of every size." and control CTA labels. Not exercised: form submission, the label switch after Statsig initializes, and keyed behavior. Those stay UNVERIFIED until Phase 5.
- Open items for the human, none blocking: `README.md` route table and Phase 2 lines still say "Simulated" and "Nothing is sent" because they describe code behavior; the `package.json` description still reads "Fictional API Platform Demo".
- Result: the design revision is ACCEPTED as local commits. Phase 4 is NOT COMPLETE. Push of `49b8aac` to update PR #20 needs its own RESERVED approval. Merge needs a separate one.

## 2026-11-25T06:09:00Z | Record: PR #19 merged as a docs-only squash | RECORDED
- PR #19 (https://github.com/jacksonyang-amp/AmpliGen/pull/19) merged to `main` as squash `48cac6c07931721af6adc3339cbd6edcd960c60c` at 2026-11-25T06:08:59Z. The merge carried planning files only and re-ran the Pages workflow: run 45558474311 succeeded on `48cac6c`. It redeployed current `main` and added no Phase 4 code or theme.
- Planner verified: `origin/main` is `48cac6c`, and its planning files match `cursor/phase-4-handoff-fc41` at `aebc7f7`.

## 2026-11-25T06:09:00Z | Approval: push build/phase-4 to update PR #20 | RESERVED
- Exact text: "Approve pushing build/phase-4 at commit 49b8aac462658b6a96481ac4158467a6b972641a to update PR #20, no merge"
- Source: Cursor chat, 2026-11-24 22:09 America/Los_Angeles, recorded as 2026-11-25T06:09:00Z.
- PR: https://github.com/jacksonyang-amp/AmpliGen/pull/20 (OPEN, not a draft, base `main`, auto-merge off, head `0ad165dc71a471c03fde776b9f9098110d830389`). This approval updates that PR. It does not authorize a second PR.
- Reviewed commit: `49b8aac462658b6a96481ac4158467a6b972641a` (local `build/phase-4` head, reviewed at DECISIONS.md 2026-11-25T06:05:00Z). It is a fast-forward of `0ad165dc71a471c03fde776b9f9098110d830389`.
- Authorized action: dispatch `phase-4-push-022` to Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`. Push `build/phase-4` once, at that commit, to `origin` as `build/phase-4`, as a plain fast-forward. Nothing else.
- Consequence: a push to a non-main branch does not deploy. PR #20 then carries the dark theme, the copy removal, and the `smoke-phase0` edit. Merging PR #20 later would deploy the dark theme and the Statsig code, and with the client key present it would start Statsig evaluation and event logging. That merge is not approved and needs its own RESERVED approval naming PR #20 and its head SHA.
- Still not authorized: merging PR #20, any new commit, any force-push, PR creation or edits, deployment, or live verification.
- State: USED at 2026-11-25T06:12:00Z by dispatch `phase-4-push-022`. Planner verified: `origin/build/phase-4` is `49b8aac462658b6a96481ac4158467a6b972641a`, and PR #20 (OPEN, not a draft, base `main`, auto-merge off) shows that head.

## 2026-11-25T06:12:00Z | Review of dispatch phase-4-push-022 | ACCEPTED (push only; merge NOT approved)
- Handoff set to IDLE before review, as PLANNER.md requires.
- Evidence: the Builder ran one plain push of `build/phase-4` from `0ad165d` to `49b8aac` (fast-forward, output `0ad165d..49b8aac`). The Planner re-checked: `git ls-remote origin refs/heads/build/phase-4` is `49b8aac462658b6a96481ac4158467a6b972641a`. PR #20 is OPEN, not a draft, base `main`, head `49b8aac`, mergeable, auto-merge off, and not merged. No Pages run started for `build/phase-4`. The Builder changed no file and made no commit.
- Result: the push and the PR update are complete. Phase 4 remains BUILD REVIEWED, not COMPLETE. The merge of PR #20 needs its own RESERVED approval naming PR #20 and head `49b8aac462658b6a96481ac4158467a6b972641a`, with the deploy and Statsig consequences restated.
- Next: none without the human's merge approval. Live verification of the dark theme and the Statsig boundary remains Phase 5.

## 2026-11-25T06:13:00Z | Approval: merge PR #20 | RESERVED
- Exact text: "Approve https://github.com/jacksonyang-amp/AmpliGen/pull/20 merge of commit 49b8aac462658b6a96481ac4158467a6b972641a"
- Source: Cursor chat, 2026-11-24 22:12 America/Los_Angeles, recorded as 2026-11-25T06:13:00Z. An earlier message reading only "approved" was not treated as this approval; the Planner asked for the exact text first.
- PR: https://github.com/jacksonyang-amp/AmpliGen/pull/20 (OPEN, not a draft, base `main` at `48cac6c`, mergeable, auto-merge off). Reviewed head: `49b8aac462658b6a96481ac4158467a6b972641a` (review at DECISIONS.md 2026-11-25T06:05:00Z; push at 2026-11-25T06:12:00Z).
- Authorized action: dispatch `phase-4-merge-023` to Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`. Merge PR #20 once, as a merge commit, only while its head is exactly `49b8aac462658b6a96481ac4158467a6b972641a`. Nothing else.
- Consequences, accepted with this approval:
  1. The merge runs the Pages workflow and redeploys the public site with the dark theme and the removal of the disclaimer copy.
  2. If the `NEXT_PUBLIC_STATSIG_CLIENT_KEY` secret is set, the deployed site initializes Statsig. It assigns the pricing experiment, the product gate, and the pricing notice config, and logs one exposure per evaluation to Statsig.
  3. With the key, the two business events `Demo Request Submitted` and `Sign Up Completed` are also sent to Statsig, carrying `event_id`, `user_id`, `is_synthetic`, `account_id` when mapped, and product and plan properties.
  4. The Statsig client stores a device ID in `localStorage`, sends its own diagnostics, attaches the page URL, and exposes the request IP and user agent to Statsig.
  5. Amplitude replay has recorded every session since the Phase 3 deploy (DECISIONS.md 2026-11-25T05:10:00Z), with form fields unmasked at 100%. This merge does not change that.
  6. The three Statsig console entities and a valid browser client key are UNVERIFIED. Exposure forwarding to Amplitude stays off until the human enables it in the console.
- Still not authorized: any new commit, force-push, rebase, a second PR, Phase 5 work, or live bot traffic.
- State: USED at 2026-11-25T06:14:00Z by dispatch `phase-4-merge-023`. Planner verified: PR #20 merged as merge commit `dece677e712168b7312e88df05115b315a93f56f` at 2026-11-25T06:13:37Z; its parents are `48cac6c` and `49b8aac462658b6a96481ac4158467a6b972641a`; `origin/main` is `dece677`.

## 2026-11-25T06:14:00Z | Review of dispatch phase-4-merge-023 | ACCEPTED (merge only)
- Handoff set to IDLE before review, as PLANNER.md requires.
- Evidence: `origin/main` is `dece677e712168b7312e88df05115b315a93f56f`, a merge commit with parents `48cac6c` and the approved `49b8aac462658b6a96481ac4158467a6b972641a`. PR #20 is MERGED at 2026-11-25T06:13:37Z. Pages run 45559034290 on `dece677` completed with success (build and deploy). The Builder changed no file, made no commit, and pushed no ref.
- Live check by the Planner: `/AmpliGen/`, `/product/`, `/pricing/`, `/demo-request/`, and `/sign-up/` return HTTP 200. The home page contains none of `simulated`, `nothing is sent`, or `illustrative`.
- Consequence now live: the dark theme and copy removal are deployed. The site initializes Statsig only if `NEXT_PUBLIC_STATSIG_CLIENT_KEY` is set. Whether that secret exists, whether the three console entities exist, and whether live assignment and event delivery to Statsig work are UNVERIFIED. Exposure forwarding to Amplitude is off until the human enables it in the console. Amplitude replay has recorded at 100% since the Phase 3 deploy.
- Result: Phase 4 build and merge are complete. Phase 4 is NOT COMPLETE until Phase 5 verifies the live Statsig and Amplitude behavior and the browser flows.
- Next: Phase 5 (VERIFY) needs a separate human start. No further action is authorized now.

## 2026-11-25T06:16:00Z | Human instruction: Go ahead (Phase 5 start) | AUTHORIZED (scope limited)
- Exact text: "Go ahead"
- Source: Cursor chat, 2026-11-24 22:16 America/Los_Angeles, recorded as 2026-11-25T06:16:00Z. The Planner had asked for this go-ahead to start Phase 5 (DECISIONS.md 2026-11-25T06:14:00Z).
- Scope: start Phase 5 (VERIFY) by dispatch `phase-5-verify-024` to Builder `bc-26af2fe0-92fa-5211-810f-eb3a21fea559`. Covered: criterion 1 (checks), criterion 2 (browser walkthrough of the live site), and criterion 5 (runbook draft), with evidence recorded in PHASE_LOG.md. Commits only on a local `build/phase-5` branch from `origin/main` at `dece677`.
- Limits: the live walkthrough is internal testing only. It runs two sessions, one desktop and one mobile, each with a sample visitor selected, and at most one valid demo request and one valid sign-up across both. No live bot runs. No console change. No product code change; a defect is reported as BLOCKED, not fixed.
- Not authorized by this entry: synthetic traffic volume for criteria 3 and 4 (funnel, journey, experiment, and gate analysis). Those need a separate RESERVED approval that names the target project, the volume, and the time window. Also not authorized: push, PR, merge, deployment, or any change to Statsig or Amplitude configuration.
- State: AUTHORIZED at 2026-11-25T06:16:00Z for dispatch `phase-5-verify-024`.

## 2026-11-25T06:19:00Z | Finding: Statsig console read-only check | RECORDED (criterion 4 BLOCKED)
- Human action: "Connected Statsig" (Cursor chat, 2026-11-24 22:17 America/Los_Angeles, recorded as 2026-11-25T06:17:00Z). The Statsig MCP connection is read-only (`canWrite: false`, `mcpReadOnly: true`).
- Connected project: `AmpliGen` (project id `5IyUpVQB2DLse1abn3E2Oh`, organization `The Statsig Org`).
- Result: the project lists 0 experiments, 0 feature gates, and 0 dynamic configs. The three entities the plan requires, `pricing_cta_copy`, `metrics_account_breakdown`, and `pricing_notice`, do not exist in this project.
- Effect on the live site: none on the public pages. Without assignment, the pricing, product, and notice pages show control content, as the fallbacks specify. Statsig exposures and conversion events from the live site cannot be matched to any entity in this project.
- Not verified: whether the GitHub secret `NEXT_PUBLIC_STATSIG_CLIENT_KEY` belongs to this project. The Planner cannot read secrets. If it belongs to another project, the entities may exist there.
- Criterion 4 is BLOCKED until a human either creates the three entities in this project, or confirms which project the client key belongs to. Creating entities is a console change, which the Phase 5 scope does not authorize. It needs a separate human instruction.
- Amplitude MCP is not yet connected; criterion 3 remains UNVERIFIED.

## 2026-11-25T06:19:00Z | Finding: Amplitude console read-only check | RECORDED (criterion 3 PARTIAL)
- Human action: "Connected Amplitude" (Cursor chat, 2026-11-24 22:18 America/Los_Angeles, recorded as 2026-11-25T06:18:00Z). The Amplitude MCP connection was used read-only.
- Connected org: `EE SE Custom Sandbox`. Project: `AmpliGen` (appId `906170`), `main` branch.
- Ingestion has started. In the last 30 days, the project has 7 unplanned (`unexpected`) events: `session_start` (3), `[Amplitude] Page Viewed` (9), `[Amplitude] Viewport Content Updated` (11), `[Amplitude] Element Clicked` (6), `[Amplitude] Replay Captured` (2), `[Guides-Surveys] Engagement Booted` (9), and `session_end` (1). The first arrival is 2026-11-25T05:12:55Z, the Phase 3 deploy. Every row is unplanned: none is in the tracking plan.
- The contract events `Demo Request Submitted` and `Sign Up Completed` have NOT been ingested. They are absent from `main`. The Phase 5 walkthrough has not submitted a valid form yet, so this is expected at this point; it is not a finding about the code.
- Replay: the project has 2 replays in the last 24 hours (sessions `96349fd0...`, 2,060 s, and `34cb407e...`, 0 s). Masking of sensitive fields has NOT been checked. Criterion 3 requires playable replay with masking verified in the replay itself. That check is UNVERIFIED.
- Unplanned events to resolve before criterion 3 passes: the SDK sends these automatically, so the tracking plan needs either an explicit decision to accept them or a filter. The Planner recommends accepting the `[Amplitude]` and `session_*` events and deciding on `[Guides-Surveys] Engagement Booted`. This is for a human decision, not a Builder change.
- Next: after the walkthrough submits one valid demo request and one valid sign-up, re-read the events. The two contract events must appear with the sample visitor's `vis_` user id and `is_synthetic` set.
- Still not authorized: any change to the Amplitude taxonomy, replay settings, or data. Any synthetic volume beyond the walkthrough limit.

## 2026-11-25T06:25:00Z | Review of dispatch phase-5-verify-024 | ACCEPTED for criteria 1, 2, and 5 (criteria 3 and 4 open)
- Handoff set to IDLE before review, as PLANNER.md requires.
- Evidence: local `build/phase-5` in `/tmp/ampligen-phase5`, on `dece677`, with two commits: `f30dfcd` (`docs/demo-runbook.md`) and `4bf3e26` (`PHASE_LOG.md`, append only). Nothing was pushed, no PR was opened, and nothing was merged or deployed. The Planner confirmed the scope: 2 files, no product, smoke, workflow, or secret change. A secret-pattern scan found no key value in the runbook; the only 32-hex strings in the log are screenshot md5 sums.
- Criterion 1 (PASS): `npm ci`, `typecheck`, and `build` exit 0. `smoke:phase0` 30, `phase1` 185, `phase2` 132, `phase3` 101, and `phase4` 157 pass with no failures. `bot:dry-run` exits 0 with hash `205798d3580a275d7f1c05f9761d6a2f`. There is no other test script. Pages run 45559034290 succeeded on `dece677`, and the served CSS declares `color-scheme: dark`.
- Criterion 2 (PASS for the scripted walkthrough, 52 of 52 checks): desktop 1280x800 and mobile 390x844, headless Chrome. Covered: product, pricing, invalid and valid forms, sign-up, welcome, direct navigation and reload on all seven routes, keyboard order, and focus. One valid demo request (desktop) and one valid sign-up (mobile) were submitted, within the two-session limit. No console errors or failed site requests. 32 screenshots are in `/tmp/phase5/`, not committed. One cosmetic item is left unfixed: on the pricing page at 1280 px, the Enterprise secondary button sits about 1 px lower than the primary buttons.
- Criterion 5 (PASS for the draft): `docs/demo-runbook.md` covers the URL and routes, personas and identity rules, reset steps, secrets by name, integration status, and placeholder analysis links marked UNVERIFIED. The Planner read it and found no claim beyond the evidence.
- Limits: the Builder had no console access, and the browser was headless Chrome only, with no real phones and no other browsers.

## 2026-11-25T06:25:00Z | Finding: Amplitude read-only check after the walkthrough | RECORDED (criterion 3 PARTIAL)
- Re-read of AmpliGen (`906170`, `main`) after the walkthrough: `Demo Request Submitted` (volume 1) and `Sign Up Completed` (volume 1) have arrived. Both are `unexpected`, meaning they are NOT in the tracking plan. Each carries these properties: `event_id`, `user_id`, `is_synthetic`, `product_id`, `plan_id`, `entry_point`, `submission_id`, `traffic_source`, and `is_simulated`. The `account_id` property is absent, which matches the two unmapped walkthrough visitors.
- The SDK's automatic events also arrive as `unexpected`: `[Amplitude] Form Started`, `Form Submitted`, `Element Changed`, `Element Clicked`, `Page Viewed`, `Replay Captured`, `Viewport Content Updated`, `session_start`, `session_end`, and `[Guides-Surveys] Engagement Booted`.
- Not yet verified: the replay masking itself, the funnel and journey analysis, account mapping (no mapped persona was submitted), and the `is_synthetic` value for the walkthrough submissions.
- Decisions needed from the human before criterion 3 can pass:
  1. Adopt the two contract events, and the SDK events the team accepts, into the tracking plan. Adoption is a taxonomy change, which is not authorized here.
  2. The `is_simulated` property name. It is in the event contract (`docs/custom-events.yml`) and always set to `true`. The site copy no longer says "simulated", so the name is now misleading for the data. Renaming it changes the contract and needs a new BUILD phase, so it is a human choice. Leave it as is until decided.
- Criterion 4 is still BLOCKED by the missing Statsig entities (DECISIONS.md 2026-11-25T06:19:00Z). The walkthrough's Statsig posts returned 202 in the browser. That shows the client sent them, not that Statsig stored them. The Statsig console was not checked.

## 2026-11-25T06:25:00Z | Result: Phase 5 status | RECORDED
- Phase 5 is IN PROGRESS. Criteria 1, 2, and 5 PASS as local evidence on `build/phase-5`. The runbook draft and log are NOT pushed; a push or PR needs its own approval.
- Criterion 3: NOT complete. Events are arriving, but unplanned. Needs the human decisions above and a separate approval for synthetic volume, naming the project, volume, and time window.
- Criterion 4: BLOCKED until the human creates the three entities or confirms the project of the client key.
- Next: none authorized. Awaiting the human's decisions and approvals.

## 2026-11-25T06:31:00Z | Human decisions: key confirmed, adopt contract events, traffic approval | AUTHORIZED (partial; see items)
- Exact text: "yes that's the correct key for the AmpliGen statsig project, adopt the two contract events, don't accept the SDK events yet. is_simulated can stay. Don't worry if something is not yet in the Tracking plan. I approve synthetic volume"
- Source: Cursor chat, 2026-11-24 22:30 America/Los_Angeles, recorded as 2026-11-25T06:31:00Z.
- Item 1, key: the human confirms that the `NEXT_PUBLIC_STATSIG_CLIENT_KEY` secret belongs to the `AmpliGen` Statsig project (`5IyUpVQB2DLse1abn3E2Oh`). That project lists 0 experiments, gates, and dynamic configs (DECISIONS.md 2026-11-25T06:19:00Z). The Statsig connection is read-only, so the Planner cannot create the three entities. Criterion 4 stays BLOCKED until a human creates them.
- Item 2, adopt the two contract events: AUTHORIZED. Add `Demo Request Submitted` and `Sign Up Completed` to the `AmpliGen` tracking plan on `main` (`main` is not protected; naming convention is `none`). Method: `manage_amp_events` action `create`, kind `event`, project `906170`. Only these two events. Properties are not part of this approval.
- Item 3, SDK events: NOT accepted. `[Amplitude] ...`, `session_start`, `session_end`, and `[Guides-Surveys] Engagement Booted` stay unplanned.
- Item 4, `is_simulated`: stays as it is in the contract. No rename.
- Item 5, tracking plan gaps: the human accepts that other items may remain unplanned.
- Item 6, "I approve synthetic volume": the approval covers the principle only. Volume, time window, and driver were not named. Under the Phase 5 rule, traffic needs an approval naming the project, volume, and time window, so it is NOT yet RESERVED. The Planner has asked the human for those three details. The repository has no live bot mode. The human's own bots are a possible driver, which the human would run.
- State: item 2 USED at 2026-11-25T06:32:00Z. The Planner ran `manage_amp_events` create (kind event, project `906170`, branch `main`). Both events moved from Unexpected to Live (`isInSchema: true`, `isQueryable: true`), with category `Demo` and the contract descriptions. A re-read confirmed both are live on `main`. The adoption added no properties and changed no other event.

## 2026-11-25T06:33:00Z | Planner status after human decisions | RECORDED
- Criterion 3 next steps: the two contract events are now in the plan. Funnel, journey, replay masking, and account mapping remain unverified. The "I approve synthetic volume" decision does not yet name the volume, window, or driver, so no traffic is RESERVED. The human has been asked for those three details.
- Criterion 4 is still BLOCKED. The key is confirmed for the `AmpliGen` project, which has no `pricing_cta_copy`, `metrics_account_breakdown`, or `pricing_notice` entity. The Statsig connection is read-only, so a human must create them in the console. The Planner will read them back once they exist.
- SDK events remain unplanned by decision. `is_simulated` is unchanged by decision.

## 2026-11-25T17:25:00Z | Planner status check after re-reading the project files | RECORDED
- Prompt: the human asked the Planner to re-read AGENTS.md, PROJECT_PLAN.md, DECISIONS.md, and the last three PHASE_LOG.md entries (Cursor chat, 2026-11-25 09:24 America/Los_Angeles), state where things stand in two sentences, and act.
- Origin state: `origin/main` is `dece677`. No PR is open. `build/phase-5` is not on the remote (local only, at `4bf3e26`). The planning branch matches origin. Nothing changed since 2026-11-25T06:33:00Z.
- Statsig (`AmpliGen`, read-only, re-read): 0 experiments, 0 gates, 0 dynamic configs. Criterion 4 stays BLOCKED.
- Amplitude (`906170`, `main`, re-read): `Demo Request Submitted` and `Sign Up Completed` are live in the plan, each with volume 1 (the walkthrough). No synthetic traffic has arrived since. SDK events remain unplanned by decision.
- Correction: the top status line in PROJECT_PLAN.md still said PR #20 was open at `0ad165d` and that the theme was local. PR #20 merged at `dece677` (DECISIONS.md 2026-11-25T06:14:00Z). The line now states that.
- Synthetic traffic: not RESERVED. The 2026-11-25T06:31:00Z decision named no driver, volume, or window, and the human cancelled the follow-up questions. Nothing runs without them.
- Authorized next action: none for the Builder. The Builder stays IDLE.
- Needed from the human, in any order: (1) create the three Statsig entities (`pricing_cta_copy` with `label_mode`, `metrics_account_breakdown`, `pricing_notice` with `notice`); (2) name the driver, volume, and window for synthetic traffic; (3) optionally approve pushing `build/phase-5` for the runbook and log.

