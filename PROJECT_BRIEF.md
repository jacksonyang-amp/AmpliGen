# B2B software demo project brief

## 1. Audience and goal

**Audience:** Product managers and growth marketing teams evaluating analytics and engagement tools, with engineering examples for feature gates and dynamic configs.

**Goal:** Demonstrate how a fictional B2B API/software platform measures prospect and account journeys, captures leads, and improves conversion through experiments.

## 2. Core user journeys

- **Browse products:** Explore software product pages, using UST’s general visual style as inspiration.
- **View pricing:** Compare plans and choose between requesting a demo and starting a trial.
- **Request a demo:** Complete a lead form and reach a simulated success page.
- **Sign up:** Create a mock account and reach a product landing page prepared for an embedded guide.
- **Explore variations:** Encounter content experiments, gated features, and experiences controlled by dynamic configs.

## 3. What the demo must show in Amplitude and in Statsig

**Amplitude**

- Install `@amplitude/unified` for Analytics, Session Replay, Feature Experiment, and Guides & Surveys; Statsig owns variation assignment.
- Show funnels, journey analysis, session replay, and account-level reporting.
- Connect visitor activity to company accounts through predefined mock identities and company email entry.
- Analyze conversion by account, audience, and experiment exposure forwarded from Statsig.
- Support later guide and survey creation without requiring them for the initial demo.

**Statsig**

- Use the client SDK to assign content experiments, manage feature gates, and apply dynamic configs.
- Demonstrate enabling features for selected audiences and changing content settings.
- Analyze experiment outcomes in Statsig using relevant conversion events.

Bots generate synthetic activity using mock data stored in the repository.

## 4. Out of scope

- Real authentication, provisioning, lead delivery, or product functionality.
- Backend services, databases, payments, and business-system integrations.
- Initial guide and survey creation; the owner will handle these later.
- AI chatbot until V2.
- Amplitude-controlled experiment assignments.

Build with one Cursor Planner agent and one Builder agent. Host on GitHub Pages and deploy through GitHub Actions. Any future cloud work is restricted to AWS, GCP, or Azure.

## 5. Risks and open questions

- Confirm SDK compatibility, entitlements, and Statsig exposure forwarding.
- Define shared identities, account mapping, events, and metrics; prevent duplicate tracking.
- Keep bot activity and fictional emails separate from real visitor data.
- Client-side gates cannot protect secrets; clearly label simulated sign-up.
- Choose the platform name, products, pricing plans, and initial experiment hypothesis.
