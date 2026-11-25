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
