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
