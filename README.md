# AmpliGen

A B2B API and software platform site. It is a static site with repository-held mock data and no backend.

## Local commands

Requires Node.js 22.12 or later and npm.

```bash
npm ci                # install locked dependencies
npm run typecheck     # TypeScript type check (tsc --noEmit)
npm run build         # static production build into dist/
npm run smoke:phase0  # non-browser check of dist/ under /AmpliGen/ and the deploy workflow
npm run smoke:phase1  # non-browser check of the five routes against src/content/phase1.fixtures.json
npm run smoke:phase2  # non-browser check of forms, identity, actions, bot dry-run and built routes
npm run smoke:phase3  # non-browser check of the Amplitude adapter, sink, config and delivery with a fake SDK
npm run smoke:phase4  # non-browser check of the Statsig experiment, gate, config, events and delivery with a fake client
npm run bot:dry-run   # replay the four bot journeys in memory and print JSON Lines (dry-run only)
npm run dev           # local dev server at http://localhost:5173/AmpliGen/
```

The Vite base path is `/AmpliGen/` (see `vite.config.ts`), which matches the GitHub project Pages URL for this repository.

`npm run smoke:phase0` requires `npm run build` to have run first. It serves `dist/` on a temporary local port, checks that the home page and its local assets return HTTP 200 with expected content types, and checks `.github/workflows/deploy-pages.yml` for the build command, the `dist` upload path, and the two secret-to-Vite mappings. It prints check names only, never secret values.

## Routes

Each route is its own static HTML entry registered in `vite.config.ts` (`build.rollupOptions.input`) and served under the `/AmpliGen/` base path.

| Route | Source | Purpose |
| --- | --- | --- |
| `/AmpliGen/` | `index.html` | Home page |
| `/AmpliGen/product/` | `product/index.html` | AmpliGen Gateway, Metrics, and Connect products |
| `/AmpliGen/pricing/` | `pricing/index.html` | Pricing with demo and trial CTAs |
| `/AmpliGen/demo-request/` | `demo-request/index.html` | Simulated demo request form; nothing is sent |
| `/AmpliGen/demo-request/success/` | `demo-request/success/index.html` | Simulated confirmation after a valid demo request |
| `/AmpliGen/sign-up/` | `sign-up/index.html` | Simulated sign-up form; no password, no account is created |
| `/AmpliGen/welcome/` | `welcome/index.html` | Simulated confirmation after a valid sign-up, with an empty `data-guide-anchor` |

Product names, plan prices, CTA labels and destinations, and the temporary copy live in `src/content/phase1.fixtures.json`. `npm run smoke:phase1` compares the built HTML against that file, so edit the fixture and the page together. Like `smoke:phase0`, it requires `npm run build` to have run first.

## Simulated conversions and identities (Phase 2)

The two forms validate input in script, build one contract action per valid submission, and navigate to a confirmation page. Nothing is sent: there is no network call, no SDK, and no sink attached by default. `src/contract/registry.ts` holds an `ActionSink` registry with no default sink. Emitting with no sink does nothing, and a repeated `event_id` is ignored.

Shared, framework-free TypeScript modules are used by the pages, `scripts/bot-runner.mjs`, and `scripts/smoke-phase2.mjs`:

- `src/contract/`: IDs and enums, route paths, email normalization, validation, and the `Demo Request Submitted` and `Sign Up Completed` builders from `docs/custom-events.yml`, with `checkActionContract`.
- `src/identity/`: injected storage and ID generators, account mapping, navigation tracking, and identity state.
- `src/flow/handlers.ts`: the submit, persona and reset handlers that the forms call.
- `src/fixtures/`: sample accounts, personas, free-mail domains, and the four bot journeys. Every address uses the reserved `.example` domain.

Identity rules:

- A visitor ID (`vis_` plus 12 hex characters) is created once and stored in `localStorage` under `ampligen.identity.v1`. It is never derived from an email.
- Choosing a sample visitor persona replaces `user_id` with the persona ID and prefills the form. "Reset sample visitor" clears the persona, account and mapping and keeps the same visitor ID.
- `identity_method` is `predefined_persona` only when a persona is active and the entered email equals the persona's email. Otherwise it is `company_email` and the persona is cleared first.
- Account mapping trims and lowercases the email and matches the exact domain against the fixture accounts. Free-mail and unknown domains are `unmapped` and send no `account_id`.
- `is_synthetic` is true for any persona, any bot, or any `.example` domain. `traffic_source` is `bot` for the bot runner, `manual_demo` for a persona or `.example` email entered by a person, and `visitor` otherwise.
- `entry_point` comes from the previous internal page kept in `sessionStorage`: product, pricing, any other internal page (`navigation`), or `direct`.
- Actions and stored records contain no email, name or free text.

`npm run bot:dry-run` replays the bot journeys through the same handlers with in-memory storage and a deterministic counter. Dry-run is the only mode; any other argument exits nonzero. `npm run smoke:phase2` requires `npm run build` first and checks the built routes too. Browser behavior of the forms is not covered by these scripts.

## Amplitude analytics and replay (Phase 3)

The site uses the Amplitude Unified SDK (`@amplitude/unified`, the only Amplitude package in `package.json`) through one guarded `initAll()` call in `src/analytics/amplitude-adapter.ts`. All SDK imports live in that file. Everything else uses the small interface in `src/analytics/sdk.ts`, so `npm run smoke:phase3` runs with a fake SDK and never loads the real package.

**Supplying the key.** The key is read only as `import.meta.env.VITE_AMPLITUDE_API_KEY` in `src/analytics/entry.ts`. In CI, `.github/workflows/deploy-pages.yml` maps it from the repository secret `NEXT_PUBLIC_AMPLITUDE_API_KEY`. Use only an Amplitude browser API key; it becomes public in the bundle. Locally you can put `VITE_AMPLITUDE_API_KEY=...` in an untracked `.env.local`. Never commit a key.

**No key, no analytics.** With no key (or an empty one) the SDK is never created or called, no sink is registered, and no request is made. The site behaves as in Phase 2. If setup throws or rejects, the error is caught and the sink is removed.

**What is sent.**

- Two custom actions from `docs/custom-events.yml`, through an `ActionSink` named `amplitude` on the action registry: `Demo Request Submitted` and `Sign Up Completed`, with the properties `src/contract/actions.ts` builds. `event_id` is also sent as `insert_id`. The bot runner and `smoke:phase2` attach no sink.
- The Amplitude user ID is the contract `user_id` (visitor ID, or the persona ID while a persona is active). It is set at startup, after a persona swap or reset, and again from the action immediately before each `track`. User properties are `is_synthetic` and, only when mapped, `account_id`. When mapped, the user is also put in an `account` group (account reporting needs the Accounts add-on in Amplitude).
- Autocapture sends page views, sessions and clicks (plus the SDK defaults for attribution and form interactions). Network tracking, web vitals and frustration interactions are off. Autocapture records no text typed into fields.
- Session Replay records 100% of sessions with no masking of form inputs (human decision, DECISIONS.md 2026-11-25T04:38:00Z). The settings are in `src/analytics/config.ts`. Because the replay is unmasked, it can record a name or email typed into the forms, even though the form pages say nothing is sent. A mask level set in the Amplitude project overrides these local settings.
- Feature Experiment and Guides and Surveys are initialized by `initAll()` as capabilities only. The Experiment client is configured to fetch no variants and track no exposure, and no guide or survey content exists.

**Before navigation.** Forms fire the action and then navigate. When a sink exists, the form flushes the SDK and waits at most 1000 ms before navigating (`src/analytics/navigation.ts`). With no sink it navigates immediately.

Real delivery to Amplitude, replay capture, account reporting and browser behavior are not covered by `smoke:phase3`.

## Statsig experiments and controls (Phase 4)

Statsig assigns one experiment, one feature gate and one dynamic config through the web client SDK (`@statsig/js-client`, the only Statsig package in `package.json`; its own `@statsig/client-core` dependency comes with it). Session Replay and Web Analytics packages are not used, because Amplitude already records sessions and page views. The only file that imports the SDK is `src/statsig/statsig-adapter.ts`. Everything else uses the small interface in `src/statsig/sdk.ts`, so `npm run smoke:phase4` runs with a fake client and never loads the real package.

**Supplying the key.** The key is read only as `import.meta.env.VITE_STATSIG_CLIENT_KEY` in `src/statsig/entry.ts`. In CI, `.github/workflows/deploy-pages.yml` maps it from the repository secret `NEXT_PUBLIC_STATSIG_CLIENT_KEY`. Use only a browser client key. Locally you can put `VITE_STATSIG_CLIENT_KEY=...` in an untracked `.env.local`. Never commit a key.

**No key, control content.** With no key (or an empty one) no Statsig call is made: the pricing page keeps its control labels and notice, and the product page keeps the Account breakdown section hidden. If setup throws or rejects, the same fallbacks stay and the page works.

**The three entities.** They must exist in the Statsig project (production environment) before live assignment works. This repository does not create them.

- Experiment `pricing_cta_copy`, parameter `label_mode`. `control` (and any missing or unrecognized value) keeps the current labels. `specific` changes the visible labels only: Starter and Growth read "Start a free trial", and Enterprise reads "Talk to sales". The links do not change. Hypothesis: more specific pricing labels increase `Sign Up Completed` among visitors who see pricing; `Demo Request Submitted` is the secondary metric. Synthetic results are not causal evidence.
- Gate `metrics_account_breakdown` (product page). When it passes, a line under the AmpliGen Metrics card reads "Account breakdown shows usage and conversion for the mapped account." It is hidden otherwise.
- Dynamic config `pricing_notice`, string parameter `notice`. It replaces the text of the pricing label as plain text. A missing value, a non-string, an empty string, or a string over 120 characters keeps "Illustrative pricing. Not offered."

Each is evaluated once per page load, only on the page that shows it, so each logs one exposure from the Statsig client.

**What is sent.** The Statsig user ID is the contract `user_id` (the visitor ID, or the persona ID while a persona is active), kept in step with the Amplitude identity. Custom attributes are `is_synthetic` and, only when mapped, `account_id`. No email or name is set. The two contract actions, `Demo Request Submitted` and `Sign Up Completed`, are also logged once each to Statsig with the same name and `event_id` that Amplitude receives; metadata values are strings, so booleans arrive as "true" and "false". No other business event is added. The site sends no exposure event to Amplitude and calls no Amplitude method for an exposure; forwarding exposures to Amplitude is a Statsig console integration ("Amplitude Native") that this repository cannot turn on or off. If that integration also forwards custom events, these two would be counted twice in Amplitude.

**Before navigation.** The forms wait at most 1000 ms in total for the Amplitude and Statsig flushes together, then navigate once.

Live Statsig assignment, exposure forwarding, and delivery of the two events to Statsig are not covered by `smoke:phase4`.

## Deployment

`.github/workflows/deploy-pages.yml` runs on pushes to `main`:

1. `build` job: `npm ci`, `npm run typecheck`, `npm run build`, then uploads `dist/` as the Pages artifact.
2. `deploy` job: deploys the artifact to the `github-pages` environment. It is the only job with `pages: write` and `id-token: write`.

Pull requests do not trigger the workflow.

### Required repository setup (human-owned)

- In **Settings > Pages**, set the source to **GitHub Actions**.
- Optionally add repository secrets `NEXT_PUBLIC_AMPLITUDE_API_KEY` and `NEXT_PUBLIC_STATSIG_CLIENT_KEY`. Use only browser-safe client keys. Never use Amplitude Secret Keys or Statsig Server/Console keys. The Phase 0 build does not require them.

The build step maps these secrets to `VITE_AMPLITUDE_API_KEY` and `VITE_STATSIG_CLIENT_KEY`. Browser keys are visible in the published bundle.
