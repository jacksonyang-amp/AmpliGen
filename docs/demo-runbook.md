# AmpliGen demo runbook (draft)

Status: DRAFT from phase-5-verify-024. Statements marked UNVERIFIED have not been checked against the live Amplitude or Statsig consoles. No key value appears in this file; keys are named by their GitHub secret.

## 1. Public site

- URL: https://jacksonyang-amp.github.io/AmpliGen/
- Hosting: GitHub Pages, deployed by `.github/workflows/deploy-pages.yml` on every push to `main`. Vite base path is `/AmpliGen/`.
- Routes (each is a static page, so direct navigation and reload work):

| Route | Use in the demo |
| --- | --- |
| `/AmpliGen/` | Entry page |
| `/AmpliGen/product/` | Gateway, Metrics, Connect. The Metrics card can show an extra sentence when the Statsig gate `metrics_account_breakdown` passes (UNVERIFIED: the gate is not confirmed in the console) |
| `/AmpliGen/pricing/` | Three plans. Control labels: "Start a trial" (Starter, Growth) and "Request a demo" (Enterprise). The Statsig experiment `pricing_cta_copy` may swap the labels to "Start a free trial" and "Talk to sales"; the Statsig config `pricing_notice` may replace the notice "Plans for teams of every size." (both UNVERIFIED) |
| `/AmpliGen/demo-request/` | Demo request form. A valid submit logs `Demo Request Submitted` and goes to the success page |
| `/AmpliGen/demo-request/success/` | Confirmation page |
| `/AmpliGen/sign-up/` | Sign-up form. A valid submit logs `Sign Up Completed` and goes to the welcome page |
| `/AmpliGen/welcome/` | Mock landing page after sign-up, with "Reset sample visitor" |

Both forms validate in the browser and show an error under each bad field. An invalid submit sends nothing and does not leave the page.

## 2. Test personas and test values

The "Sample visitor (optional)" list on both forms offers four personas. Picking one fills the name and email and sets the user identity.

| Persona | Account mapping |
| --- | --- |
| Priya Nair, Northwind Labs | mapped to `acct_northwind_labs` |
| Marcus Lee, Globex Retail | mapped to `acct_globex_retail` |
| Sam Ortiz, Initech Systems | mapped to `acct_initech_systems` |
| Dana Wu (free-mail address) | unmapped, never gets an `account_id` |

Rules to remember:

- Identity follows the email that is actually submitted. If you pick a persona and then change the email to a different address, the persona is dropped for that submission and the visitor is identified by the anonymous visitor ID (and by the company domain only if it matches a known account). The phase-5 walkthrough did exactly this with `walkthrough+desktop@example.com` and `walkthrough+mobile@example.com`, so those two submissions are unmapped visitors with no `account_id`.
- Use only addresses ending in `.example` or `example.com`. Never type a real person's name or email: Session Replay records form fields unmasked (see section 4).
- The event contract is in `docs/custom-events.yml`. Event names are exactly `Demo Request Submitted` and `Sign Up Completed`; each carries `event_id`, `user_id`, `is_synthetic`, `account_id` when mapped, and product and plan properties. No raw email or name is sent as an event property.

## 3. Reset steps

Between demo runs:

1. On any form page or the welcome page, press "Reset sample visitor". This clears the persona and account for the current visitor and keeps the anonymous visitor ID. The page says "Sample visitor reset."
2. For a completely fresh visitor, use a new private window, or clear this site's local storage (the identity key is `ampligen.identity.v1`; the Amplitude and Statsig clients keep their own device IDs there too) and cookies for `jacksonyang-amp.github.io`.
3. Do not reload the success page to "resubmit": it is a static page and logs no conversion event. To demonstrate another conversion, go back to the form and submit again.

## 4. Integration configuration

Keys are baked into the build at deploy time. Nothing is read at run time.

| Secret (GitHub repository secret) | Build variable | Used for |
| --- | --- | --- |
| `NEXT_PUBLIC_AMPLITUDE_API_KEY` | `VITE_AMPLITUDE_API_KEY` | Amplitude analytics, autocapture, Session Replay, one `initAll()` call |
| `NEXT_PUBLIC_STATSIG_CLIENT_KEY` | `VITE_STATSIG_CLIENT_KEY` | Statsig client: experiment, gate, config, and the two business events |

- If a variable is empty at build time, that integration does nothing and the site still works.
- Amplitude: autocapture covers page views, sessions, form interactions and element clicks; network tracking, web vitals and frustration interactions are off. Session Replay records 100% of sessions with form fields unmasked (human decision recorded in DECISIONS.md 2026-11-25T04:38:00Z). A mask level set in the Amplitude project overrides this (UNVERIFIED whether one is set). Account-level reporting needs the Accounts add-on (UNVERIFIED).
- Statsig console entities that the code expects, exact names: experiment `pricing_cta_copy` (parameter `label_mode`: `control` or `specific`), feature gate `metrics_account_breakdown`, dynamic config `pricing_notice` (string parameter `notice`, at most 120 characters). Whether they exist in the console, are started, and return real values is UNVERIFIED. With a missing entity the site shows the control content.
- Statsig console integration "Amplitude Native" (forwards Statsig exposures to Amplitude) is NOT enabled. The site has no client code that forwards exposures. Enabling it is a console step for the human and is UNVERIFIED until then.
- Bots: `npm run bot:dry-run` prints the four scripted journeys and sends nothing. There is no live bot mode in the repository. Any live synthetic traffic needs its own approval in DECISIONS.md.

## 5. Analysis links (placeholders, all UNVERIFIED)

Fill these in after the consoles are checked. Do not paste keys.

- Amplitude project: `<AMPLITUDE_PROJECT_URL>`
- Amplitude funnel `Demo Request Submitted` by account: `<AMPLITUDE_CHART_URL>`
- Amplitude Session Replay list: `<AMPLITUDE_REPLAY_URL>`
- Statsig experiment `pricing_cta_copy` results: `<STATSIG_EXPERIMENT_URL>`
- Statsig gate `metrics_account_breakdown`: `<STATSIG_GATE_URL>`
- Statsig dynamic config `pricing_notice`: `<STATSIG_CONFIG_URL>`
- Statsig user exposures and event stream: `<STATSIG_DIAGNOSTICS_URL>`

## 6. Deferred

- Amplitude Guides and Surveys: the welcome page carries an empty `#guide-anchor` element, and the engagement plugin loads with the Amplitude SDK. No guide or survey has been authored, and none is verified. Setup is deferred to a later phase.
- Synthetic traffic volume for funnel, journey, experiment and gate analysis (criteria 3 and 4 of the plan) needs a separate approval that names the project, the volume and the time window.

## 7. Pre-demo checklist

1. Open the public URL and confirm the dark theme loads and `/AmpliGen/pricing/` shows three plans.
2. Confirm the latest "Deploy to GitHub Pages" run on `main` is green.
3. Pick a persona, submit one valid demo request, confirm the success page, then press "Reset sample visitor".
4. Check the Amplitude and Statsig consoles for the two events (UNVERIFIED until done).
