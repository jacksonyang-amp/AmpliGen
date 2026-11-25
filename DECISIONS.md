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
