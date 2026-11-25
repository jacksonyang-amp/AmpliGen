# BUILDER_HANDOFF
**Status:** START
**Phase:** 4 — Statsig experiments and controls
**Dispatch ID:** phase-4-design-020
**Phase type:** BUILD (visual theme and visible copy only)
**Builder agent ID:** bc-26af2fe0-92fa-5211-810f-eb3a21fea559

Objective: Restyle the site as a dark theme with high-contrast accents, and remove the visible copy that says the site or its forms are simulated, illustrative, or not real. Keep every route, form field, event, and Statsig entity as it is. Commit on the existing local branch `build/phase-4`. Do not push.

## Prerequisites
- `build/phase-4` is `0ad165dc71a471c03fde776b9f9098110d830389`, which is also `origin/build/phase-4` and the head of PR #20. Add commits on top of that commit. If the local branch is not that commit, stop and report BLOCKED. Do not rebase, reset, or create another branch.
- Read this handoff and DECISIONS.md 2026-11-25T05:46:00Z from `origin/cursor/phase-4-handoff-fc41` after `git fetch origin cursor/phase-4-handoff-fc41`. Do not check out or edit that branch.
- Human decisions in that entry: exposure forwarding stays a Statsig console setting the human will enable later, so do not add forwarding code. Amplitude events are already arriving; do not change the Amplitude integration.

## Theme (do not invent a second palette)
Edit `src/style.css` only for the visual change. One dark theme. No theme toggle, no new font file, no image, and no layout redesign. Set `color-scheme: dark` on `:root`. Use these values:

- Canvas `#0b1020`, surface `#151b2e`, ink `#f4f7fb`, muted `#b7c0d4`
- Border `#2c3854`
- Primary accent `#3ee0c5` with button text `#06221c`
- Focus `#ffb020`
- Links `#7dffe8`

Header, cards, and footer use the surface color, not white. Primary buttons use the accent fill and the dark button text. Secondary buttons use a transparent fill, an accent border, and accent text. Body text stays the ink color on the canvas. Keep the existing focus outline. Do not rely on color alone for errors; keep the current error text.

## Copy (use these strings)
Remove every visible and meta occurrence of: simulated, illustrative, "not offered", "nothing is sent", "nothing was sent", "no real customers", and the eyebrow "Static site". Keep "Request a demo", the Demo request nav label, and the `/demo-request/` route. They name the action.

- Footer, every page: `AmpliGen. Gateway, metrics, and connections for API programs.`
- Home eyebrow: `API platform`
- Delete the home "About this site" section and its on-page link. Do not replace it with a disclaimer.
- Pricing meta description: `AmpliGen pricing for Starter, Growth, and Enterprise.`
- Pricing notice, the `[data-pricing-label]` text and the Statsig fallback: `Plans for teams of every size.`
- Demo request meta description: `Request an AmpliGen demo.`
- Demo request notice: `Tell us about your team and the product you want to see.`
- Demo request success meta description: `Your AmpliGen demo request is confirmed.`
- Demo request success notice: `Your demo request is in. We will follow up at the work email you entered.`
- Sign-up meta description: `Create an AmpliGen account.`
- Sign-up notice: `Create your AmpliGen account.`
- Welcome meta description: `Welcome to AmpliGen.`
- Welcome notice: `Your AmpliGen account is ready.`

Update `src/content/phase1.fixtures.json` to the same strings. Update the Statsig fallback constant if it still contains the old pricing sentence. Treatment CTA labels stay "Start a free trial" and "Talk to sales".

## Allowed files
- `src/style.css`
- `index.html`, `product/index.html`, `pricing/index.html`, `demo-request/index.html`, `demo-request/success/index.html`, `sign-up/index.html`, `welcome/index.html`
- `src/content/phase1.fixtures.json`
- `src/statsig/config.ts` only if it contains the old pricing sentence
- `scripts/smoke-phase1.mjs`, `scripts/smoke-phase2.mjs`, and `scripts/smoke-phase4.mjs`, only where they require the old disclaimer strings or the old colors. Point them at the new strings. Add a check that the built HTML contains none of: `simulated`, `illustrative`, `not offered`, `nothing is sent`, `nothing was sent`, `no real customers`, `Static site`. Keep the existing bans on `fictional`, `demonstration`, and `demo-banner`.
- `README.md` only if it quotes a removed sentence
- `PHASE_LOG.md` (append only)

## Forbidden
- No change to form fields, validation, hrefs, routes, event names, identity, Statsig entity names, or Amplitude settings.
- No new dependency, no forwarding code, no workflow edit, no push, no new branch.
- Do not edit `scripts/smoke-phase0.mjs` or `scripts/bot-runner.mjs`. If `smoke:phase0` or `bot:dry-run` fails because of this change, log BLOCKED.

## Steps
1. Confirm `git rev-parse build/phase-4` is `0ad165dc71a471c03fde776b9f9098110d830389`.
2. Make the theme and copy edits on that branch.
3. From the repository root, all of these exit 0: `npm run typecheck`, `npm run build`, `npm run smoke:phase4`, `npm run smoke:phase3`, `npm run smoke:phase2`, `npm run smoke:phase1`, `npm run smoke:phase0`, `npm run bot:dry-run`. The bot output stays the same as on `0ad165d`.
4. Commit locally. Do not push. Do not open a PR. Do not merge.
5. Append one PHASE_LOG.md entry with the commit SHA, the commands, and PASS or FAIL for the theme and the copy. Commit that entry. Report COMPLETE or BLOCKED and stop.

## Git permissions
- Commit: yes, new commits on the existing local `build/phase-4` only.
- Branch creation: no. Push: no. PR creation: no. Merge: no. Deployment: no. Force-push: no. Rebase: no.
- PR #20 stays at `0ad165d` until a later push approval names the new head. This dispatch does not authorize that push.

## Stop
After logging COMPLETE or BLOCKED, stop. Do not start Phase 5.
