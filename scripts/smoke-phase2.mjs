import { spawnSync } from 'node:child_process';
import http from 'node:http';
import https from 'node:https';
import { syncBuiltinESMExports } from 'node:module';
import net from 'node:net';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ACTION_NAMES, checkActionContract } from '../src/contract/actions.ts';
import { ROUTES } from '../src/contract/paths.ts';
import { actionRegistry, createActionRegistry } from '../src/contract/registry.ts';
import { validateDemoRequest, validateSignUp } from '../src/contract/validation.ts';
import { PERSONAS } from '../src/fixtures/personas.ts';
import {
  activatePersona,
  readIdentity,
  resetSampleVisitor,
  submitDemoRequest,
  submitSignUp,
} from '../src/flow/handlers.ts';
import { IDENTITY_STORAGE_KEY } from '../src/identity/identity.ts';
import { createSequentialIds } from '../src/identity/ids.ts';
import { NAVIGATION_STORAGE_KEY, currentEntryPoint, recordPageView } from '../src/identity/navigation.ts';
import { createMemoryStorage } from '../src/identity/storage.ts';
import { runBotJourneys } from './bot-runner.mjs';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST = join(ROOT, 'dist');
const BASE_PATH = '/AmpliGen/';
const BOT_RUNNER = join(ROOT, 'scripts', 'bot-runner.mjs');

const CONTENT_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
};

const failures = [];
let passCount = 0;

function record(name, ok, detail = '') {
  if (ok) passCount += 1;
  else failures.push(name);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` (${detail})` : ''}`);
}

function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const realFetch = globalThis.fetch.bind(globalThis);
const networkCalls = [];
const restoreNetwork = [];

function stubProperty(target, key, value) {
  const hadOwn = Object.prototype.hasOwnProperty.call(target, key);
  const descriptor = hadOwn ? Object.getOwnPropertyDescriptor(target, key) : undefined;
  Object.defineProperty(target, key, { value, configurable: true, writable: true, enumerable: true });
  restoreNetwork.push(() => {
    if (descriptor) Object.defineProperty(target, key, descriptor);
    else delete target[key];
  });
}

function installNetworkStubs() {
  const spy = (label) => (...args) => {
    networkCalls.push({ label, argCount: args.length });
    throw new Error(`network call blocked: ${label}`);
  };
  stubProperty(globalThis, 'fetch', spy('fetch'));
  stubProperty(globalThis, 'XMLHttpRequest', function XMLHttpRequest() {
    spy('XMLHttpRequest')();
  });
  stubProperty(globalThis, 'WebSocket', function WebSocket() {
    spy('WebSocket')();
  });
  stubProperty(globalThis.navigator, 'sendBeacon', spy('sendBeacon'));
  for (const [label, target] of [
    ['http', http],
    ['https', https],
  ]) {
    stubProperty(target, 'request', spy(`${label}.request`));
    stubProperty(target, 'get', spy(`${label}.get`));
  }
  stubProperty(net, 'connect', spy('net.connect'));
  stubProperty(net, 'createConnection', spy('net.createConnection'));
  syncBuiltinESMExports();
}

function removeNetworkStubs() {
  while (restoreNetwork.length > 0) restoreNetwork.pop()();
  syncBuiltinESMExports();
}

function makeContext({ origin = 'browser', identityStorage, navigationStorage } = {}) {
  const events = [];
  const registry = createActionRegistry();
  registry.addSink({ name: 'smoke_collector', send: (action) => events.push(action) });
  return {
    events,
    ctx: {
      identityStorage: identityStorage ?? createMemoryStorage(),
      navigationStorage: navigationStorage ?? createMemoryStorage(),
      ids: createSequentialIds(),
      registry,
      origin,
    },
  };
}

const VALID = { name: 'Test Person', productId: 'ampligen_metrics', planId: 'growth' };
const JOINED = (local, domain) => `${local}@${domain}`;

function checkValidationMatrix() {
  const longEmail = JOINED('a'.repeat(60), `${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(63)}.example`);
  const good = { ...VALID, email: 'new.contact@northwind-labs.example' };

  const cases = [
    ['demo', 'empty name', { ...good, name: '' }, 'name', 'required'],
    ['demo', 'blank name', { ...good, name: '   ' }, 'name', 'required'],
    ['demo', 'name over 80 characters', { ...good, name: 'n'.repeat(81) }, 'name', 'too_long'],
    ['demo', 'missing email', { ...good, email: '' }, 'email', 'required'],
    ['demo', 'malformed email', { ...good, email: 'not-an-email' }, 'email', 'invalid_format'],
    ['demo', 'email without a dotted domain', { ...good, email: 'someone@nodot' }, 'email', 'invalid_format'],
    ['demo', 'email over 254 characters', { ...good, email: longEmail }, 'email', 'too_long'],
    ['demo', 'missing product', { ...good, productId: '' }, 'product_id', 'required'],
    ['demo', 'unknown product', { ...good, productId: 'ampligen_unknown' }, 'product_id', 'unknown_value'],
    ['demo', 'unknown plan', { ...good, planId: 'platinum' }, 'plan_id', 'unknown_value'],
    ['sign-up', 'empty name', { ...good, name: '' }, 'name', 'required'],
    ['sign-up', 'name over 80 characters', { ...good, name: 'n'.repeat(81) }, 'name', 'too_long'],
    ['sign-up', 'missing email', { ...good, email: '' }, 'email', 'required'],
    ['sign-up', 'malformed email', { ...good, email: 'not-an-email' }, 'email', 'invalid_format'],
    ['sign-up', 'email over 254 characters', { ...good, email: longEmail }, 'email', 'too_long'],
    ['sign-up', 'missing product', { ...good, productId: '' }, 'product_id', 'required'],
    ['sign-up', 'unknown product', { ...good, productId: 'ampligen_unknown' }, 'product_id', 'unknown_value'],
    ['sign-up', 'no plan', { ...good, planId: '' }, 'plan_id', 'required'],
    ['sign-up', 'enterprise plan', { ...good, planId: 'enterprise' }, 'plan_id', 'not_allowed'],
  ];

  for (const [kind, label, raw, field, code] of cases) {
    const { ctx, events } = makeContext();
    const before = ctx.identityStorage.dump();
    const result = kind === 'demo' ? submitDemoRequest(ctx, raw) : submitSignUp(ctx, raw);
    record(
      `${kind}: ${label} is rejected with ${field} ${code}, emits nothing and has no destination`,
      result.ok === false &&
        result.errors[field] === code &&
        !('destination' in result) &&
        events.length === 0 &&
        same(ctx.identityStorage.dump(), before),
    );
  }

  const boundary = validateDemoRequest({ ...good, name: 'n'.repeat(80) });
  record('demo: an 80-character name is accepted', boundary.ok === true);
  record('demo: plan is optional', validateDemoRequest({ ...good, planId: '' }).ok === true);
  record('sign-up: starter and growth are accepted', ['starter', 'growth'].every((planId) => validateSignUp({ ...good, planId }).ok));
  record('demo: all three plans are accepted', ['starter', 'growth', 'enterprise'].every((planId) => validateDemoRequest({ ...good, planId }).ok));
  const normalized = validateSignUp({ ...good, email: '  New.Contact@Northwind-Labs.EXAMPLE ' });
  record(
    'validation trims and lowercases the email',
    normalized.ok === true && normalized.value.email === 'new.contact@northwind-labs.example',
  );
}

function expectAction(action, expected) {
  return Object.entries(expected).every(([key, value]) => action.properties[key] === value);
}

function checkIdentityScenarios(collected) {
  const priya = PERSONAS[0];
  const dana = PERSONAS[3];

  {
    const { ctx, events } = makeContext();
    const visitorId = readIdentity(ctx).visitorId;
    record('visitor ID is vis_ plus 12 hex characters', /^vis_[0-9a-f]{12}$/.test(visitorId), visitorId);
    activatePersona(ctx, priya.id);
    const result = submitSignUp(ctx, { ...VALID, name: priya.name, email: priya.email });
    collected.push(...events);
    record('persona sign-up: success destination is /AmpliGen/welcome/', result.ok && result.destination === '/AmpliGen/welcome/');
    record(
      'persona sign-up: fixed user ID, predefined_persona, mapped account, manual_demo, synthetic',
      result.ok &&
        result.action.name === ACTION_NAMES.signUpCompleted &&
        expectAction(result.action, {
          user_id: 'persona_priya_nair',
          account_id: 'acct_northwind_labs',
          identity_method: 'predefined_persona',
          account_mapping_status: 'mapped',
          traffic_source: 'manual_demo',
          is_synthetic: true,
          is_simulated: true,
          plan_id: 'growth',
        }),
    );
    record('persona sign-up emits exactly one action', events.length === 1 && result.emit.status === 'emitted');
    const demo = submitDemoRequest(ctx, { ...VALID, planId: '', name: priya.name, email: priya.email });
    collected.push(...events.slice(1));
    record('persona demo request: success destination is /AmpliGen/demo-request/success/', demo.ok && demo.destination === '/AmpliGen/demo-request/success/');
    record(
      'persona demo request: fixed user ID, mapped account, manual_demo, plan_id omitted when blank',
      demo.ok &&
        demo.action.name === ACTION_NAMES.demoRequestSubmitted &&
        demo.action.properties.user_id === 'persona_priya_nair' &&
        demo.action.properties.account_id === 'acct_northwind_labs' &&
        demo.action.properties.traffic_source === 'manual_demo' &&
        !('plan_id' in demo.action.properties) &&
        typeof demo.action.properties.submission_id === 'string',
    );
  }

  {
    const { ctx, events } = makeContext();
    activatePersona(ctx, dana.id);
    const result = submitSignUp(ctx, { ...VALID, name: dana.name, email: dana.email });
    collected.push(...events);
    record(
      'Dana persona: predefined_persona, unmapped, no account_id key, manual_demo, synthetic',
      result.ok &&
        result.action.properties.user_id === 'persona_dana_wu' &&
        result.action.properties.identity_method === 'predefined_persona' &&
        result.action.properties.account_mapping_status === 'unmapped' &&
        !('account_id' in result.action.properties) &&
        result.action.properties.traffic_source === 'manual_demo' &&
        result.action.properties.is_synthetic === true,
    );
  }

  {
    const { ctx, events } = makeContext();
    const visitorId = readIdentity(ctx).visitorId;
    const result = submitSignUp(ctx, { ...VALID, email: 'new.contact@northwind-labs.example' });
    collected.push(...events);
    record(
      '.example company email without persona: visitor ID, company_email, mapped, manual_demo, synthetic',
      result.ok &&
        result.action.properties.user_id === visitorId &&
        result.action.properties.identity_method === 'company_email' &&
        result.action.properties.account_id === 'acct_northwind_labs' &&
        result.action.properties.account_mapping_status === 'mapped' &&
        result.action.properties.traffic_source === 'manual_demo' &&
        result.action.properties.is_synthetic === true,
    );
    const mixed = submitSignUp(ctx, { ...VALID, email: ' New.Contact@NORTHWIND-LABS.example ' });
    record('mapping trims and lowercases the email', mixed.ok && mixed.action.properties.account_id === 'acct_northwind_labs');
  }

  const unmappedCases = [
    ['unknown .example domain', 'contact@unlisted-company.example', 'manual_demo', true],
    ['free-mail .example domain', 'contact@freemail.example', 'manual_demo', true],
    ['unknown non-.example domain', 'contact@unlisted-company.test', 'visitor', false],
    ['free-mail non-.example domain', JOINED('sample-user-zero', ['gmail', 'com'].join('.')), 'visitor', false],
    ['lookalike subdomain of a fixture domain', 'contact@mail.northwind-labs.example', 'manual_demo', true],
  ];
  for (const [label, email, trafficSource, isSynthetic] of unmappedCases) {
    const { ctx, events } = makeContext();
    const visitorId = readIdentity(ctx).visitorId;
    const result = submitSignUp(ctx, { ...VALID, email });
    collected.push(...events);
    record(
      `${label}: unmapped with no account_id key, ${trafficSource}, is_synthetic ${isSynthetic}`,
      result.ok &&
        result.action.properties.account_mapping_status === 'unmapped' &&
        !('account_id' in result.action.properties) &&
        result.action.properties.user_id === visitorId &&
        result.action.properties.traffic_source === trafficSource &&
        result.action.properties.is_synthetic === isSynthetic,
    );
  }

  {
    const { ctx, events } = makeContext();
    const visitorId = readIdentity(ctx).visitorId;
    activatePersona(ctx, PERSONAS[1].id);
    const result = submitSignUp(ctx, { ...VALID, email: 'other.person@initech-systems.example' });
    collected.push(...events);
    const stored = readIdentity(ctx);
    record(
      'persona with a different entered email is cleared and gives company_email',
      result.ok &&
        result.action.properties.identity_method === 'company_email' &&
        result.action.properties.user_id === visitorId &&
        result.action.properties.account_id === 'acct_initech_systems' &&
        stored.personaId === undefined &&
        stored.visitorId === visitorId,
    );
  }
}

function checkStabilityAndReset(collected) {
  const priya = PERSONAS[0];
  const identityStorage = createMemoryStorage();
  const first = makeContext({ identityStorage });
  const visitorId = readIdentity(first.ctx).visitorId;

  const firstResult = submitSignUp(first.ctx, { ...VALID, email: 'new.contact@northwind-labs.example' });
  const secondResult = submitDemoRequest(first.ctx, { ...VALID, email: 'new.contact@northwind-labs.example' });
  collected.push(...first.events);
  const second = makeContext({ identityStorage });
  const thirdResult = submitSignUp(second.ctx, { ...VALID, email: 'new.contact@northwind-labs.example' });
  collected.push(...second.events);
  record(
    'user ID and account ID are stable across repeated submissions and a new session on the same storage',
    [firstResult, secondResult, thirdResult].every(
      (result) =>
        result.ok &&
        result.action.properties.user_id === visitorId &&
        result.action.properties.account_id === 'acct_northwind_labs',
    ) && readIdentity(second.ctx).visitorId === visitorId,
  );

  const runOne = makeContext();
  const runTwo = makeContext();
  const flow = (context) => {
    activatePersona(context.ctx, priya.id);
    return submitSignUp(context.ctx, { ...VALID, email: priya.email });
  };
  record('two independent runs of the same flow produce identical actions', same(flow(runOne).action, flow(runTwo).action));

  const reset = makeContext();
  const originalVisitor = readIdentity(reset.ctx).visitorId;
  activatePersona(reset.ctx, priya.id);
  const withPersona = readIdentity(reset.ctx);
  record(
    'persona selection stores persona and account and keeps the visitor ID',
    withPersona.personaId === priya.id &&
      withPersona.accountId === 'acct_northwind_labs' &&
      withPersona.visitorId === originalVisitor,
  );
  const afterReset = resetSampleVisitor(reset.ctx);
  const stored = JSON.parse(reset.ctx.identityStorage.getItem(IDENTITY_STORAGE_KEY));
  record(
    'persona reset clears persona, account and mapping and does not rotate the visitor ID',
    afterReset.personaId === undefined &&
      afterReset.accountId === undefined &&
      afterReset.mappingStatus === undefined &&
      afterReset.visitorId === originalVisitor &&
      same(stored, { visitorId: originalVisitor }),
  );
  const afterResetSubmit = submitSignUp(reset.ctx, { ...VALID, email: 'contact@unlisted-company.test' });
  collected.push(...reset.events);
  record(
    'submission after reset uses the original visitor ID',
    afterResetSubmit.ok && afterResetSubmit.action.properties.user_id === originalVisitor,
  );

  const corrupt = makeContext({ identityStorage: createMemoryStorage({ [IDENTITY_STORAGE_KEY]: '{not json' }) });
  const recovered = readIdentity(corrupt.ctx).visitorId;
  record('corrupt stored identity is replaced with a fresh visitor ID', /^vis_[0-9a-f]{12}$/.test(recovered));
}

function checkEntryPoints() {
  const cases = [
    ['no earlier page', [], 'direct'],
    ['pricing before the form', ['/AmpliGen/pricing/', ROUTES.demoRequest], 'pricing'],
    ['product before the form', ['/AmpliGen/product/', ROUTES.signUp], 'product'],
    ['home before the form', ['/AmpliGen/', ROUTES.demoRequest], 'navigation'],
    ['form reloaded with the same path', ['/AmpliGen/pricing/', ROUTES.demoRequest, ROUTES.demoRequest], 'pricing'],
    ['index.html path is normalized', ['/AmpliGen/pricing/index.html', '/AmpliGen/sign-up/index.html'], 'pricing'],
  ];
  for (const [label, path, expected] of cases) {
    const storage = createMemoryStorage();
    for (const pathname of path) recordPageView(storage, pathname);
    record(`entry_point: ${label} gives ${expected}`, currentEntryPoint(storage) === expected);
  }

  const { ctx, events } = makeContext();
  recordPageView(ctx.navigationStorage, '/AmpliGen/product/');
  recordPageView(ctx.navigationStorage, ROUTES.demoRequest);
  const result = submitDemoRequest(ctx, { ...VALID, email: 'new.contact@northwind-labs.example' });
  record(
    'handlers read entry_point from navigation storage',
    result.ok && result.action.properties.entry_point === 'product' && events.length === 1,
  );
  record('navigation storage uses the documented key', ctx.navigationStorage.getItem(NAVIGATION_STORAGE_KEY) !== null);
}

function checkEmission() {
  const { ctx, events } = makeContext();
  const first = submitSignUp(ctx, { ...VALID, email: 'new.contact@northwind-labs.example' });
  record('a valid submission emits exactly one action', first.ok && first.emit.status === 'emitted' && events.length === 1);

  const invalid = submitSignUp(ctx, { ...VALID, email: 'bad' });
  record('an invalid submission emits none', !invalid.ok && events.length === 1);

  const replay = first.ok ? ctx.registry.emit(first.action) : undefined;
  record('re-emitting the same event_id is ignored', replay?.status === 'duplicate' && events.length === 1);

  const empty = createActionRegistry();
  const unsunk = first.ok ? empty.emit(first.action) : undefined;
  record('emitting with no sink does nothing', unsunk?.status === 'no_sink' && empty.sinkCount() === 0);
  record('the shared action registry has no default sink', actionRegistry.sinkCount() === 0);

  const tampered = first.ok ? structuredClone(first.action) : undefined;
  if (tampered) tampered.properties.email = 'x';
  record(
    'the registry rejects an action with an extra property',
    tampered !== undefined && ctx.registry.emit(tampered).status === 'invalid',
  );

  const leaking = first.ok ? structuredClone(first.action) : undefined;
  if (leaking) {
    leaking.properties.event_id = 'evt_leak';
    leaking.properties.user_id = JOINED('someone', 'unlisted-company.example');
  }
  record(
    'contract check flags an email-like value',
    leaking !== undefined && checkActionContract(leaking).some((violation) => violation.includes('email-like')),
  );
}

function checkNoPii(collected, botLines) {
  const needles = ['@', ...PERSONAS.map((persona) => persona.name), VALID.name];
  const surfaces = [
    ['emitted actions', JSON.stringify(collected)],
    ['bot output', JSON.stringify(botLines)],
  ];
  const { ctx } = makeContext();
  activatePersona(ctx, PERSONAS[0].id);
  submitSignUp(ctx, { ...VALID, name: PERSONAS[0].name, email: PERSONAS[0].email });
  surfaces.push(['stored identity and navigation records', JSON.stringify([ctx.identityStorage.dump(), ctx.navigationStorage.dump()])]);

  record('PII scan covers at least one action of each kind', collected.some((action) => action.name === ACTION_NAMES.demoRequestSubmitted) && collected.some((action) => action.name === ACTION_NAMES.signUpCompleted), `${collected.length} actions`);
  for (const [label, text] of surfaces) {
    const found = needles.filter((needle) => text.includes(needle));
    record(`${label} contain no email or name`, found.length === 0, found.join(', '));
  }
  record(
    'every collected action satisfies the contract check',
    collected.every((action) => checkActionContract(action).length === 0),
  );
}

function expectedBotLines() {
  const line = (seq, journey, bot, step, result) => ({
    seq,
    journey_id: journey,
    bot_id: bot,
    step,
    ...(result === undefined ? {} : { result }),
  });
  const visit = (path) => ({ path });
  const selected = { selected: true };
  const common = (eventId, userId, extras) => ({
    event_id: eventId,
    user_id: userId,
    ...extras.account,
    is_synthetic: true,
    traffic_source: 'bot',
    product_id: extras.product,
    ...extras.plan,
    entry_point: extras.entry,
    is_simulated: true,
    ...extras.tail,
  });

  return [
    line(1, 'northwind_demo_request', 'bot_visitor_001', 'select_persona', selected),
    line(2, 'northwind_demo_request', 'bot_visitor_001', 'visit', visit('/AmpliGen/')),
    line(3, 'northwind_demo_request', 'bot_visitor_001', 'visit', visit('/AmpliGen/product/')),
    line(4, 'northwind_demo_request', 'bot_visitor_001', 'visit', visit('/AmpliGen/pricing/')),
    line(5, 'northwind_demo_request', 'bot_visitor_001', 'submit_demo_request', {
      status: 'emitted',
      destination: '/AmpliGen/demo-request/success/',
      action: {
        name: 'Demo Request Submitted',
        properties: common('evt_000000000001', 'persona_priya_nair', {
          account: { account_id: 'acct_northwind_labs' },
          product: 'ampligen_gateway',
          plan: { plan_id: 'enterprise' },
          entry: 'pricing',
          tail: { submission_id: 'sub_000000000001' },
        }),
      },
    }),
    line(6, 'globex_sign_up', 'bot_visitor_002', 'select_persona', selected),
    line(7, 'globex_sign_up', 'bot_visitor_002', 'visit', visit('/AmpliGen/')),
    line(8, 'globex_sign_up', 'bot_visitor_002', 'visit', visit('/AmpliGen/pricing/')),
    line(9, 'globex_sign_up', 'bot_visitor_002', 'submit_sign_up', {
      status: 'emitted',
      destination: '/AmpliGen/welcome/',
      action: {
        name: 'Sign Up Completed',
        properties: common('evt_000000000002', 'persona_marcus_lee', {
          account: { account_id: 'acct_globex_retail' },
          product: 'ampligen_metrics',
          plan: { plan_id: 'growth' },
          entry: 'pricing',
          tail: { identity_method: 'predefined_persona', account_mapping_status: 'mapped' },
        }),
      },
    }),
    line(10, 'initech_browse_only', 'bot_visitor_003', 'select_persona', selected),
    line(11, 'initech_browse_only', 'bot_visitor_003', 'visit', visit('/AmpliGen/product/')),
    line(12, 'initech_browse_only', 'bot_visitor_003', 'visit', visit('/AmpliGen/pricing/')),
    line(13, 'dana_invalid_then_sign_up', 'bot_visitor_004', 'select_persona', selected),
    line(14, 'dana_invalid_then_sign_up', 'bot_visitor_004', 'visit', visit('/AmpliGen/')),
    line(15, 'dana_invalid_then_sign_up', 'bot_visitor_004', 'submit_sign_up', {
      status: 'invalid',
      error_fields: ['email'],
    }),
    line(16, 'dana_invalid_then_sign_up', 'bot_visitor_004', 'submit_sign_up', {
      status: 'emitted',
      destination: '/AmpliGen/welcome/',
      action: {
        name: 'Sign Up Completed',
        properties: common('evt_000000000003', 'persona_dana_wu', {
          account: {},
          product: 'ampligen_connect',
          plan: { plan_id: 'starter' },
          entry: 'navigation',
          tail: { identity_method: 'predefined_persona', account_mapping_status: 'unmapped' },
        }),
      },
    }),
  ];
}

function checkBot() {
  const expected = expectedBotLines();
  const first = runBotJourneys();
  const second = runBotJourneys();
  record('bot dry-run returns the expected 16 ordered lines', same(first, expected), `${first.length} lines`);
  record('bot dry-run is identical across two runs', same(first, second));

  const actions = first.flatMap((entry) => (entry.result?.action ? [entry.result.action] : []));
  record(
    'bot dry-run emits three actions with sequential event IDs',
    same(actions.map((action) => action.properties.event_id), ['evt_000000000001', 'evt_000000000002', 'evt_000000000003']),
  );
  record(
    'bot actions are all bot traffic, synthetic and simulated',
    actions.every((action) => action.properties.traffic_source === 'bot' && action.properties.is_synthetic && action.properties.is_simulated),
  );
  record('the Initech journey browses without a conversion', !first.some((entry) => entry.journey_id === 'initech_browse_only' && entry.result?.action));
  record('the invalid Dana sign-up reports only the email field and emits nothing', same(first[14].result, { status: 'invalid', error_fields: ['email'] }));

  const cli = spawnSync(process.execPath, ['--experimental-strip-types', BOT_RUNNER, '--dry-run'], {
    encoding: 'utf8',
    env: {},
  });
  const cliLines = cli.stdout.trim().split('\n').map((text) => JSON.parse(text));
  record('bot CLI --dry-run exits 0 and prints the same JSON Lines', cli.status === 0 && same(cliLines, expected), `exit ${cli.status}`);

  const bare = spawnSync(process.execPath, ['--experimental-strip-types', BOT_RUNNER], { encoding: 'utf8', env: {} });
  record('bot CLI defaults to dry-run', bare.status === 0 && bare.stdout === cli.stdout);

  for (const args of [['--live'], ['--dry-run', '--live'], ['live']]) {
    const result = spawnSync(process.execPath, ['--experimental-strip-types', BOT_RUNNER, ...args], { encoding: 'utf8', env: {} });
    record(
      `bot CLI ${args.join(' ')} exits nonzero with no output`,
      result.status !== 0 && result.stdout === '' && /not authorized|only --dry-run/.test(result.stderr),
      `exit ${result.status}`,
    );
  }
  return first;
}

async function listFiles(dir) {
  const entries = await readdir(dir, { recursive: true });
  return entries.map((name) => join(dir, name));
}

async function checkSources() {
  const sourceFiles = (await listFiles(join(ROOT, 'src'))).filter((file) => /\.(ts|js)$/.test(file));
  const ANALYTICS_DIR = join(ROOT, 'src', 'analytics') + sep;
  const STATSIG_DIR = join(ROOT, 'src', 'statsig') + sep;
  const ALLOWED_KEY_READ = 'import.meta.env.VITE_AMPLITUDE_API_KEY';
  const ALLOWED_STATSIG_KEY_READ = 'import.meta.env.VITE_STATSIG_CLIENT_KEY';
  const STATSIG_ENTRY_IMPORT = './statsig/entry.ts';
  const banned = [
    ['fetch call', /\bfetch\s*\(/, false],
    ['XMLHttpRequest', /XMLHttpRequest/, false],
    ['sendBeacon', /sendBeacon/, false],
    ['WebSocket', /WebSocket/, false],
    ['EventSource', /EventSource/, false],
    ['Amplitude', /amplitude/i, true],
    ['Statsig', /statsig/i, false],
    ['initAll', /initAll/, true],
    ['password', /password/i, false],
    ['environment access', /process\.env|import\.meta\.env/, true],
  ];
  const offenders = [];
  for (const file of sourceFiles) {
    const text = await readFile(file, 'utf8');
    const inAnalytics = file.startsWith(ANALYTICS_DIR);
    const inStatsig = file.startsWith(STATSIG_DIR);
    for (const [label, pattern, allowedInAnalytics] of banned) {
      if (label === 'Statsig') {
        if (inStatsig) continue;
        if (pattern.test(text.split(STATSIG_ENTRY_IMPORT).join(''))) offenders.push(`${file.replace(ROOT + sep, '')}: ${label}`);
        continue;
      }
      if (label === 'environment access' && inStatsig) {
        if (pattern.test(text.split(ALLOWED_STATSIG_KEY_READ).join(''))) {
          offenders.push(`${file.replace(ROOT + sep, '')}: ${label} beyond ${ALLOWED_STATSIG_KEY_READ}`);
        }
        continue;
      }
      if (allowedInAnalytics && inAnalytics) {
        if (label === 'environment access' && pattern.test(text.split(ALLOWED_KEY_READ).join(''))) {
          offenders.push(`${file.replace(ROOT + sep, '')}: ${label} beyond ${ALLOWED_KEY_READ}`);
        }
        continue;
      }
      if (pattern.test(text)) offenders.push(`${file.replace(ROOT + sep, '')}: ${label}`);
    }
  }
  record(
    'src/ has no network API, password or environment access, and Statsig only inside src/statsig/ (Amplitude, initAll and the one Amplitude key read only inside src/analytics/; the one Statsig key read only inside src/statsig/)',
    sourceFiles.length > 0 && offenders.length === 0,
    offenders.join('; '),
  );

  const runner = await readFile(BOT_RUNNER, 'utf8');
  record(
    'bot runner imports no network module and reads no environment value',
    !/node:(http|https|net|dns|tls|dgram)/.test(runner) && !/process\.env|\bfetch\s*\(/.test(runner),
  );

  const manifest = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'));
  record(
    'the only runtime dependencies in package.json are @amplitude/unified and @statsig/js-client',
    same(Object.keys(manifest.dependencies ?? {}).sort(), ['@amplitude/unified', '@statsig/js-client']),
  );
  record(
    'package.json dev dependencies are only typescript and vite',
    same(Object.keys(manifest.devDependencies ?? {}).sort(), ['typescript', 'vite']),
  );
}

function routeFile(route) {
  return join(DIST, route.slice(BASE_PATH.length), 'index.html');
}

function startServer() {
  return new Promise((resolveServer, rejectServer) => {
    const server = http.createServer(async (req, res) => {
      const { pathname } = new URL(req.url ?? '/', 'http://127.0.0.1');
      if (!pathname.startsWith(BASE_PATH)) {
        res.writeHead(404);
        res.end('not found');
        return;
      }
      let filePath = resolve(DIST, pathname.slice(BASE_PATH.length) || 'index.html');
      if (filePath !== DIST && !filePath.startsWith(DIST + sep)) {
        res.writeHead(403);
        res.end();
        return;
      }
      try {
        const info = await stat(filePath);
        if (info.isDirectory()) filePath = join(filePath, 'index.html');
        const body = await readFile(filePath);
        res.writeHead(200, { 'content-type': CONTENT_TYPES[extname(filePath)] ?? 'application/octet-stream' });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end('not found');
      }
    });
    server.once('error', rejectServer);
    server.listen(0, '127.0.0.1', () => resolveServer(server));
  });
}

const ROUTE_LIST = [
  '/AmpliGen/',
  '/AmpliGen/product/',
  '/AmpliGen/pricing/',
  '/AmpliGen/demo-request/',
  '/AmpliGen/demo-request/success/',
  '/AmpliGen/sign-up/',
  '/AmpliGen/welcome/',
];

function labelledControls(html) {
  const labels = [...html.matchAll(/<label\b[^>]*\bfor="([^"]+)"/g)].map((match) => match[1]);
  const controls = [...html.matchAll(/<(input|select|textarea)\b([^>]*)>/g)].map((match) => ({
    tag: match[1],
    id: /\bid="([^"]+)"/.exec(match[2])?.[1],
    type: /\btype="([^"]+)"/.exec(match[2])?.[1],
    autocomplete: /\bautocomplete="([^"]+)"/.exec(match[2])?.[1],
  }));
  return { labels, controls };
}

async function checkBuiltOutput() {
  let missing = 0;
  for (const route of ROUTE_LIST) {
    try {
      const info = await stat(routeFile(route));
      record(`build output exists for ${route}`, info.isFile());
    } catch {
      missing += 1;
      record(`build output exists for ${route}`, false, 'run npm run build first');
    }
  }
  if (missing > 0) return;

  const server = await startServer();
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    const pages = {};
    for (const route of ROUTE_LIST) {
      const response = await realFetch(`${origin}${route}`);
      pages[route] = await response.text();
      record(`built route ${route} returns HTTP 200 under /AmpliGen/`, response.status === 200, `status ${response.status}`);
    }

    const forbidden = [
      ['Lumora', /lumora/i],
      ['fictional', /fictional/i],
      ['Fictional demo', /fictional demo/i],
    ];
    for (const route of ['/AmpliGen/demo-request/', '/AmpliGen/demo-request/success/', '/AmpliGen/sign-up/', '/AmpliGen/welcome/']) {
      for (const [label, pattern] of forbidden) {
        record(`built route ${route} does not contain "${label}"`, !pattern.test(pages[route]));
      }
    }

    for (const route of ['/AmpliGen/demo-request/', '/AmpliGen/sign-up/']) {
      const html = pages[route];
      const { labels, controls } = labelledControls(html);
      const formTag = /<form\b([^>]*)>/.exec(html)?.[1] ?? '';
      record(`built route ${route} has one form`, (html.match(/<form\b/g) ?? []).length === 1);
      record(`built route ${route} form has no action attribute`, formTag !== '' && !/\baction\s*=/i.test(formTag));
      record(`built route ${route} form uses script validation (novalidate)`, /\bnovalidate\b/.test(formTag));
      record(`built route ${route} has no password input`, !/type="password"/i.test(html) && !/password/i.test(html));
      record(
        `built route ${route} fields are all labelled`,
        controls.length >= 5 && controls.every((control) => control.id !== undefined && labels.includes(control.id)),
        `${controls.length} controls, ${labels.length} labels`,
      );
      record(
        `built route ${route} text and email inputs set autocomplete`,
        controls.filter((control) => control.tag === 'input').every((control) => control.autocomplete !== undefined),
      );
      record(`built route ${route} has the sample visitor select and reset button`, /id="field-persona"/.test(html) && /Reset sample visitor/.test(html));
      record(`built route ${route} has a no-script note`, /<noscript>[\s\S]*JavaScript[\s\S]*<\/noscript>/.test(html));
      record(`built route ${route} has inline error containers with role alert`, (html.match(/class="field-error" role="alert"/g) ?? []).length >= 4);
    }

    const signUpPlans = [...(/id="field-plan"[\s\S]*?<\/select>/.exec(pages['/AmpliGen/sign-up/'])?.[0] ?? '').matchAll(/<option value="([^"]*)"/g)].map((match) => match[1]);
    record('built sign-up plan select offers only starter and growth', same(signUpPlans.filter(Boolean), ['starter', 'growth']));

    const welcome = pages['/AmpliGen/welcome/'];
    record('built welcome page has an empty data-guide-anchor div', /<div id="guide-anchor" data-guide-anchor><\/div>/.test(welcome));
    record('built welcome page links to the product page', /href="\/AmpliGen\/product\/"/.test(welcome));
    record('built welcome page has a Reset sample visitor button', /Reset sample visitor/.test(welcome));
    record('built success page states the request is simulated', /simulated/.test(pages['/AmpliGen/demo-request/success/']) && /Nothing was sent/.test(pages['/AmpliGen/demo-request/success/']));

    const scripts = [...new Set(Object.values(pages).flatMap((html) => [...html.matchAll(/src="(\/AmpliGen\/assets\/[^"]+\.js)"/g)].map((match) => match[1])))];
    let scriptsOk = scripts.length > 0;
    for (const ref of scripts) {
      const asset = await realFetch(`${origin}${ref}`);
      await asset.arrayBuffer();
      if (asset.status !== 200) scriptsOk = false;
    }
    record('built page scripts are served under /AmpliGen/assets/', scriptsOk, `${scripts.length} scripts`);
  } finally {
    await new Promise((done) => server.close(done));
  }
}

async function main() {
  const collected = [];
  let botLines = [];

  installNetworkStubs();
  try {
    await realFetchSanity();
    checkValidationMatrix();
    checkIdentityScenarios(collected);
    checkStabilityAndReset(collected);
    checkEntryPoints();
    checkEmission();
    botLines = checkBot();
    checkNoPii(collected, botLines);
    record('stubbed network APIs were never called during handler and bot work', networkCalls.length === 0, `${networkCalls.length} calls`);
  } finally {
    removeNetworkStubs();
  }

  await checkSources();
  await checkBuiltOutput();

  console.log(`\n${passCount} passed, ${failures.length} failed.`);
  if (failures.length > 0) console.log(`Failed: ${failures.join('; ')}`);
  process.exit(failures.length === 0 ? 0 : 1);
}

async function realFetchSanity() {
  const before = networkCalls.length;
  try {
    await globalThis.fetch('http://127.0.0.1:9/');
  } catch {
    // The stub throws by design.
  }
  const recorded = networkCalls.length === before + 1;
  networkCalls.length = before;
  record('network stubs record and block a fetch attempt', recorded);
}

main().catch((error) => {
  console.error('Smoke check crashed:', error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
