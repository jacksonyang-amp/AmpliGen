# BUILDER_HANDOFF
**Status:** START
**Phase:** 0 — Static scaffold and deployment
**Dispatch ID:** phase-0-build-001
**Phase type:** BUILD
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Create a minimal static site that GitHub Actions can build and deploy to GitHub Pages.

## Prerequisites
- Prerequisites are resolved: PROJECT_BRIEF.md exists in the repository and the one Builder exists with the agent ID above. Do not start a replacement thread; if this ID is unavailable, log BLOCKED.
- Execute only if you are agent `bc-26af2fe0-92fa-5211-810f-eb3a21fea559` and this dispatch ID has no COMPLETE or BLOCKED entry in PHASE_LOG.md.
- Create `build/phase-0` from the current HEAD (the checkout's present commit); do not rebase, reset, or touch other branches. Commit only the allowed files below, never BUILDER_HANDOFF.md, PROJECT_PLAN.md, DECISIONS.md, PLANNER.md, or BUILDER.md.
- Read BUILDER.md, PROJECT_BRIEF.md, PROJECT_PLAN.md, and PHASE_LOG.md. Stop if this dispatch already has a COMPLETE or BLOCKED entry.
- Inspect the repository, current branch, existing stack, package manager, and deployment configuration. Preserve unrelated work; log BLOCKED if required repository details or permissions cannot be determined.

## Allowed files
- Scaffold source and styles under src/, static assets under public/, and root index.html.
- Package manifest and the repository’s single package-manager lockfile; TypeScript and build-tool configuration; .gitignore.
- scripts/smoke-phase0.* and .github/workflows/deploy-pages.yml.
- README.md for local build/deployment instructions and PHASE_LOG.md for evidence.
- Request a revised handoff before changing other paths; do not edit Planner-owned files.

## Steps
1. Confirm the repository’s owner/name, default branch, and Pages URL/base path from existing configuration or read-only repository metadata. Record the target and any setup blockers in PHASE_LOG.md; do not change repository settings.
2. Reuse the existing static stack. If the repository is empty, scaffold a minimal TypeScript static app with Vite and npm. If an existing package manager requires different validation commands, return the exact equivalents to the Planner for a revised handoff before implementation.
3. Create a visible home page with a header, main content, footer, and working in-page navigation. Use a neutral “API Platform Demo” title and label it as a fictional demo. Do not add product/pricing pages, forms, SDKs, or backend functionality in this phase.
4. Add `npm run typecheck` and `npm run build`; make the build produce static output and use the confirmed Pages base path for asset URLs. Keep generated output out of commits.
5. Add the GitHub Actions workflow: install locked dependencies, run typecheck and the same build command, upload the static output, and deploy through the GitHub Pages environment after a push to the confirmed default branch. Restrict deployment permissions to the job that needs them; do not enable PR-triggered deployment or run the workflow now.
   Set these environment mappings on the build step (the existing GitHub repository secret names remain unchanged):
   ```yaml
   - name: Build
     run: npm run build
     env:
       VITE_AMPLITUDE_API_KEY: ${{ secrets.NEXT_PUBLIC_AMPLITUDE_API_KEY }}
       VITE_STATSIG_CLIENT_KEY: ${{ secrets.NEXT_PUBLIC_STATSIG_CLIENT_KEY }}
   ```
   Commit only these references, never actual key values. Do not print values. The Phase 0 scaffold must build without keys; defer SDK installation and app reads through `import.meta.env.VITE_AMPLITUDE_API_KEY` / `import.meta.env.VITE_STATSIG_CLIENT_KEY` to their assigned phases.
6. Implement `npm run smoke:phase0` as one non-browser check: serve the built output under the configured base path, request the home page and referenced local assets, assert HTTP 200 and expected content types, check the workflow’s build command/output path and both exact secret-to-Vite mappings without resolving or printing values, then stop the temporary server. Exit nonzero on failure.
7. Run typecheck, build, and the smoke command. Fix failures within scope. Do not run full test suites, browser walkthroughs, screenshots, or video.
8. Document local commands and required Pages/Actions setup in README.md. Create and switch to `build/phase-0` if not already on it, then commit only phase-owned changes there. Do not push. Log BLOCKED using the BUILDER.md template with local evidence and “Awaiting authorized PR, merge, and deployment verification” as the remaining blocker; notify the Planner through PHASE_LOG.md and the agent channel, and stop.
9. After the Planner reviews local evidence, obtain a new Phase 0 dispatch through the same Builder thread for any authorized push/PR work and approval-bound merge/deployment. Do not execute those operations under this dispatch.
10. Under the follow-up dispatch, check that the approved revision has a successful Pages Actions run and the public URL returns HTTP 200 with the expected home-page content. Record the clickable URL, deployed revision, run link, and command result in PHASE_LOG.md; only then log COMPLETE for Phase 0 and notify the Planner.

## Definition of done
- [ ] `npm run typecheck` exits 0.
- [ ] `npm run build` exits 0 and generates the home page/navigation shell as static output with no server runtime requirement.
- [ ] `npm run smoke:phase0` exits 0: the built home page and referenced local assets resolve under the configured base path, and the workflow builds/uploads the matching output with both exact secret-to-Vite mappings.
- [ ] After separately authorized merge/deployment, the successful Actions run corresponds to the approved revision and the public URL returns HTTP 200 with the expected home page; the URL and evidence are recorded in PHASE_LOG.md.

Git permissions: Commit: Yes | Merge: No

- Branch creation/switching: Yes, only to create and switch to `build/phase-0`. Push: No. PR creation: No. Deployment execution: No. Destructive git operations: No.
- Commit permission applies only on `build/phase-0` and only to this phase’s allowed changes. Inspect staged files before committing and exclude unrelated changes.
- Push, merge, and deployment remain disallowed until separately authorized. The Planner must issue separate permissions for pushing or opening a PR, and an approval-bound dispatch for merge or deployment.
- Log BLOCKED for missing credentials, unapproved cost, unclear scope, or missing permissions. Report only through PHASE_LOG.md and the agent channel. Do not contact the human.
- Report passing local checks as ready for merge review, with deployment verification still BLOCKED. Keep Phase 0 open until the follow-up live check passes; do not begin Phase 1 beforehand. This HTTP check does not authorize a full browser walkthrough.

Do NOT proceed past this phase without checking in.
