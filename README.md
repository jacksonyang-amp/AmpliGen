# API Platform Demo

A fictional B2B API and software platform demo. It is a static site with repository-held mock data and no backend. All companies, products, and data are simulated.

## Local commands

Requires Node.js 22.12 or later and npm.

```bash
npm ci                # install locked dependencies
npm run typecheck     # TypeScript type check (tsc --noEmit)
npm run build         # static production build into dist/
npm run smoke:phase0  # non-browser check of dist/ under /AmpliGen/ and the deploy workflow
npm run smoke:phase1  # non-browser check of the five routes against src/content/phase1.fixtures.json
npm run dev           # local dev server at http://localhost:5173/AmpliGen/
```

The Vite base path is `/AmpliGen/` (see `vite.config.ts`), which matches the GitHub project Pages URL for this repository.

`npm run smoke:phase0` requires `npm run build` to have run first. It serves `dist/` on a temporary local port, checks that the home page and its local assets return HTTP 200 with expected content types, and checks `.github/workflows/deploy-pages.yml` for the build command, the `dist` upload path, and the two secret-to-Vite mappings. It prints check names only, never secret values.

## Routes

Each route is its own static HTML entry registered in `vite.config.ts` (`build.rollupOptions.input`) and served under the `/AmpliGen/` base path.

| Route | Source | Purpose |
| --- | --- | --- |
| `/AmpliGen/` | `index.html` | Home page |
| `/AmpliGen/product/` | `product/index.html` | Fictional Lumora Gateway, Metrics, and Connect products |
| `/AmpliGen/pricing/` | `pricing/index.html` | Illustrative demo pricing (not offered) with demo and trial CTAs |
| `/AmpliGen/demo-request/` | `demo-request/index.html` | Placeholder notice; no form, nothing is sent |
| `/AmpliGen/sign-up/` | `sign-up/index.html` | Placeholder notice; no account is created |

Product names, plan prices, CTA labels and destinations, and the temporary copy live in `src/content/phase1.fixtures.json`. `npm run smoke:phase1` compares the built HTML against that file, so edit the fixture and the page together. Like `smoke:phase0`, it requires `npm run build` to have run first.

## Deployment

`.github/workflows/deploy-pages.yml` runs on pushes to `main`:

1. `build` job: `npm ci`, `npm run typecheck`, `npm run build`, then uploads `dist/` as the Pages artifact.
2. `deploy` job: deploys the artifact to the `github-pages` environment. It is the only job with `pages: write` and `id-token: write`.

Pull requests do not trigger the workflow.

### Required repository setup (human-owned)

- In **Settings > Pages**, set the source to **GitHub Actions**.
- Optionally add repository secrets `NEXT_PUBLIC_AMPLITUDE_API_KEY` and `NEXT_PUBLIC_STATSIG_CLIENT_KEY`. Use only browser-safe client keys. Never use Amplitude Secret Keys or Statsig Server/Console keys. The Phase 0 build does not require them.

The build step maps these secrets to `VITE_AMPLITUDE_API_KEY` and `VITE_STATSIG_CLIENT_KEY`. Browser keys are visible in the published bundle.
