import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { appPath, ROUTES } from '../src/contract/paths.ts';
import { createActionRegistry } from '../src/contract/registry.ts';
import { BOT_JOURNEYS } from '../src/fixtures/bot-journeys.ts';
import { findPersona } from '../src/fixtures/personas.ts';
import { activatePersona, submitDemoRequest, submitSignUp } from '../src/flow/handlers.ts';
import { IDENTITY_STORAGE_KEY } from '../src/identity/identity.ts';
import { createSequentialIds } from '../src/identity/ids.ts';
import { recordPageView } from '../src/identity/navigation.ts';
import { createMemoryStorage } from '../src/identity/storage.ts';

const INVALID_EMAIL = 'not-an-email';

function summarizeSubmission(result) {
  if (!result.ok) return { status: 'invalid', error_fields: Object.keys(result.errors) };
  return { status: result.emit.status, destination: result.destination, action: result.action };
}

function runStep(ctx, journey, step) {
  switch (step.type) {
    case 'select_persona':
      return { selected: activatePersona(ctx, step.personaId) };
    case 'visit':
      recordPageView(ctx.navigationStorage, appPath(step.path));
      return { path: appPath(step.path) };
    case 'submit_demo_request': {
      recordPageView(ctx.navigationStorage, ROUTES.demoRequest);
      const persona = findPersona(journeyPersonaId(journey));
      return summarizeSubmission(
        submitDemoRequest(ctx, {
          name: persona.name,
          email: persona.email,
          productId: step.productId,
          planId: step.planId,
        }),
      );
    }
    case 'submit_sign_up': {
      recordPageView(ctx.navigationStorage, ROUTES.signUp);
      const persona = findPersona(journeyPersonaId(journey));
      return summarizeSubmission(
        submitSignUp(ctx, {
          name: persona.name,
          email: step.input === 'invalid_email' ? INVALID_EMAIL : persona.email,
          productId: step.productId,
          planId: step.planId,
        }),
      );
    }
    default:
      throw new Error('unknown bot step');
  }
}

function journeyPersonaId(journey) {
  const first = journey.steps.find((step) => step.type === 'select_persona');
  return first.personaId;
}

export function runBotJourneys() {
  const ids = createSequentialIds();
  const registry = createActionRegistry();
  registry.addSink({ name: 'bot_dry_run_collector', send: () => {} });

  const lines = [];
  let seq = 0;
  for (const journey of BOT_JOURNEYS) {
    const ctx = {
      identityStorage: createMemoryStorage({
        [IDENTITY_STORAGE_KEY]: JSON.stringify({ visitorId: journey.botId }),
      }),
      navigationStorage: createMemoryStorage(),
      ids,
      registry,
      origin: 'bot',
    };
    for (const step of journey.steps) {
      const result = runStep(ctx, journey, step);
      seq += 1;
      const line = { seq, journey_id: journey.id, bot_id: journey.botId, step: step.type };
      if (result !== undefined) line.result = result;
      lines.push(line);
    }
  }
  return lines;
}

function main(argv) {
  const modeOk = argv.length === 0 || (argv.length === 1 && argv[0] === '--dry-run');
  if (!modeOk) {
    console.error('bot-runner: only --dry-run is authorized. No other mode is available.');
    return 2;
  }
  for (const line of runBotJourneys()) console.log(JSON.stringify(line));
  return 0;
}

const isEntryPoint =
  process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isEntryPoint) process.exit(main(process.argv.slice(2)));
