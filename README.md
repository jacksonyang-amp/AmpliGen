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

## Deployment

`.github/workflows/deploy-pages.yml` runs on pushes to `main`:

1. `build` job: `npm ci`, `npm run typecheck`, `npm run build`, then uploads `dist/` as the Pages artifact.
2. `deploy` job: deploys the artifact to the `github-pages` environment. It is the only job with `pages: write` and `id-token: write`.

Pull requests do not trigger the workflow.

### Required repository setup (human-owned)

- In **Settings > Pages**, set the source to **GitHub Actions**.
- Optionally add repository secrets `NEXT_PUBLIC_AMPLITUDE_API_KEY` and `NEXT_PUBLIC_STATSIG_CLIENT_KEY`. Use only browser-safe client keys. Never use Amplitude Secret Keys or Statsig Server/Console keys. The Phase 0 build does not require them.

The build step maps these secrets to `VITE_AMPLITUDE_API_KEY` and `VITE_STATSIG_CLIENT_KEY`. Browser keys are visible in the published bundle.
