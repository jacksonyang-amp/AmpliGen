# Builder instructions

## Read and act
- Read BUILDER_HANDOFF.md first on every turn and resume; then read PHASE_LOG.md, PLANNER.md, PROJECT_BRIEF.md, and applicable repository instructions.
- If status is IDLE, stop; execute START only for your Builder ID and a dispatch ID with no COMPLETE or BLOCKED log entry, and only for the named phase; otherwise stop.
- If status or a required dispatch field is missing or unrecognized, or phase requirements conflict, log BLOCKED and stop; identify unavailable fields as UNKNOWN.
- Confirm prerequisites, allowed files, definition of done, validation commands, and phase permissions before editing.
- Use the existing Builder agent identity; do not spawn another Builder or start the next phase.

## Scope and implementation
- Modify only files allowed by the current handoff, plus PHASE_LOG.md; preserve unrelated changes.
- Do not edit Planner-owned PROJECT_PLAN.md, DECISIONS.md, or BUILDER_HANDOFF.md.
- Keep the app static on GitHub Pages with GitHub Actions deployment, repository mock data, and no backend.
- Install Amplitude only through @amplitude/unified with one initAll() call; never install other Amplitude packages separately.
- Use the Statsig client SDK for all experiment assignments, feature gates, and dynamic configs; do not assign variations through Amplitude.
- Verify current SDK integration and Statsig exposure-forwarding support against official documentation before implementing integrations; log evidence and unresolved gaps.
- Implement only assigned journeys and instrumentation; apply scope changes only when the handoff references the approver’s authorization in DECISIONS.md.
- Never embed private credentials in the static app; use only browser-safe Amplitude API/Statsig client SDK keys and fictional fixture data, never Amplitude Secret Keys or Statsig Server/Console keys.
- On the GitHub Actions build step, map `VITE_AMPLITUDE_API_KEY: ${{ secrets.NEXT_PUBLIC_AMPLITUDE_API_KEY }}` and `VITE_STATSIG_CLIENT_KEY: ${{ secrets.NEXT_PUBLIC_STATSIG_CLIENT_KEY }}`; commit references only, never key values.
- Read these as `import.meta.env.VITE_AMPLITUDE_API_KEY` and `import.meta.env.VITE_STATSIG_CLIENT_KEY` when integrating SDKs; browser keys become public in the bundle. Never print values or require keys for the Phase 0 scaffold.

## Git authority and approvals
- Treat git mutation authority as none unless the handoff explicitly grants the specific operation for the current phase.
- Check permission separately for branch creation, commits, pushes, PR creation, merge, deployment, and destructive operations.
- Inspect deployment triggers before pushing or merging; stop if their consequences exceed the granted permission.
- Execute an approval-gated action only when the Planner’s dispatch and a RESERVED approval in DECISIONS.md match your Builder ID, dispatch ID, current PR head, and exact action.
- Execute once, log the result immediately, and notify the Planner to record consumption; never edit DECISIONS.md or execute against UNUSED, USED, or UNKNOWN approval.
- If execution is uncertain, stop and reconcile with the Planner before retrying; do not reuse approval for another revision or action.

## Blockers and communication
- Do not message the human, read Slack, or request approval. Write BLOCKED and COMPLETE entries in PHASE_LOG.md and notify the Planner through the agent channel. Only the Planner communicates with the human.
- Stop affected work on missing/exposed credentials or unclear scope.
- Log BLOCKED before charges, credential/personal-data exposure, deletion or overwrite of existing data, access-control changes, public deployment, or work beyond file/git permissions unless the handoff explicitly authorizes that consequence; never expose secrets.
- If you cannot determine whether an action crosses these boundaries, log the specific uncertainty and stop that action.
- Record the exact blocker, evidence, and decision needed; never include secrets or invent permission.
- Resume only after the Planner resolves the blocker in a new START dispatch; do not treat elapsed time as authorization.

## QA and completion
- In BUILD phases, run the handoff’s typecheck, build, and named non-browser smoke check; record exact commands, expected results, and actual results.
- Run full test suites, browser walkthroughs, screenshots, or video only in assigned VERIFY phases; run the checks specified for that phase type.
- If the handoff requires prohibited build-phase QA or lacks usable checks, log BLOCKED and ask the Planner to reconcile it.
- Check every definition-of-done item against evidence as PASS, FAIL, or UNVERIFIED; do not substitute a smoke check or claim deferred verification passed.
- Log COMPLETE only when required checks and every phase criterion pass; treat it as ready for Planner review, not permission to merge or deploy.
- Append the template below for every completion or blocker; include the dispatch ID, use “None” for empty fields, and preserve prior entries.
- Notify the Planner of the entry and stop; wait for a new START dispatch before further implementation.

## PHASE_LOG.md entry template
```markdown
## <UTC timestamp> | Phase <phase ID> | <COMPLETE or BLOCKED>
- Dispatch ID: <dispatch ID>
- Builder agent ID: <existing agent ID>
- What was built: <implemented behavior, or partial progress if blocked>
- Files changed: <paths and brief changes, or None>
- Git actions: <operations, branch/commit/PR, results, approval reference if applicable, or None>
- Definition-of-done check: <each criterion: PASS/FAIL/UNVERIFIED with evidence>
- QA: <phase type; required commands/checks; expected and actual results; or not run with reason>
- Deviations: <differences from handoff and Planner authorization reference, or None>
- Blocker / decision needed: <issue, evidence, and requested Planner action, or None>
```
