import http from 'node:http';
import https from 'node:https';
import { syncBuiltinESMExports } from 'node:module';
import net from 'node:net';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { appPath, ROUTES } from '../src/contract/paths.ts';
import { createActionRegistry } from '../src/contract/registry.ts';
import { BOT_JOURNEYS } from '../src/fixtures/bot-journeys.ts';
import { PERSONAS, findPersona } from '../src/fixtures/personas.ts';
import {
  activatePersona,
  readIdentity,
  resetSampleVisitor,
  submitDemoRequest,
  submitSignUp,
} from '../src/flow/handlers.ts';
import { IDENTITY_STORAGE_KEY } from '../src/identity/identity.ts';
import { createSequentialIds } from '../src/identity/ids.ts';
import { recordPageView } from '../src/identity/navigation.ts';
import { createMemoryStorage } from '../src/identity/storage.ts';
import { buildInitOptions } from '../src/analytics/config.ts';
import { createAnalyticsController } from '../src/analytics/controller.ts';
import { getAnalytics, setAnalytics } from '../src/analytics/handle.ts';
import { MAX_FLUSH_WAIT_MS, flushThenNavigate } from '../src/analytics/navigation.ts';
import { runBotJourneys } from './bot-runner.mjs';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST = join(ROOT, 'dist');
const BASE_PATH = '/AmpliGen/';
const ADAPTER = join('src', 'analytics', 'amplitude-adapter.ts');

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
const FAKE_KEY = ['fake', 'key', 'for', 'smoke', 'only'].join('-');
const VALID = { name: 'Test Person', productId: 'ampligen_metrics', planId: 'growth' };

function createFakeSdk({ init = 'resolve' } = {}) {
  const calls = [];
  const log = (name, ...args) => calls.push({ name, args: structuredClone(args) });
  return {
    calls,
    names: () => calls.map((call) => call.name),
    tracks: () => calls.filter((call) => call.name === 'track'),
    sdk: {
      init(apiKey, options) {
        log('init', apiKey, options);
        if (init === 'throw') throw new Error('init threw');
        if (init === 'reject') return Promise.reject(new Error('init rejected'));
        if (init === 'pending') return new Promise(() => {});
        return Promise.resolve();
      },
      setUserId: (userId) => log('setUserId', userId),
      setUserProperties: (properties) => log('setUserProperties', properties),
      setGroup: (type, name) => log('setGroup', type, name),
      track: (name, properties, options) => log('track', name, properties, options),
      flush() {
        log('flush');
        return Promise.resolve();
      },
    },
  };
}

function makeFlow({ registry, origin = 'browser', identityStorage } = {}) {
  return {
    identityStorage: identityStorage ?? createMemoryStorage(),
    navigationStorage: createMemoryStorage(),
    ids: createSequentialIds(),
    registry: registry ?? createActionRegistry(),
    origin,
  };
}

function strings(value, found = []) {
  if (typeof value === 'string') found.push(value);
  else if (Array.isArray(value)) for (const item of value) strings(item, found);
  else if (value !== null && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      found.push(key);
      strings(item, found);
    }
  }
  return found;
}

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

async function listFiles(dir) {
  const entries = await readdir(dir, { recursive: true });
  return entries.map((name) => join(dir, name));
}

async function checkDependencies() {
  const manifest = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'));
  record('package.json runtime dependencies are exactly @amplitude/unified', same(Object.keys(manifest.dependencies ?? {}), ['@amplitude/unified']));

  const sections = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
  const amplitudeNames = sections.flatMap((section) => Object.keys(manifest[section] ?? {})).filter((name) => /amplitude/i.test(name));
  record('no other Amplitude package is declared in package.json', same(amplitudeNames, ['@amplitude/unified']), amplitudeNames.join(', '));
  record(
    'no Statsig package is declared in package.json',
    !sections.flatMap((section) => Object.keys(manifest[section] ?? {})).some((name) => /statsig/i.test(name)),
  );
  record(
    'dev dependencies are still only typescript and vite',
    same(Object.keys(manifest.devDependencies ?? {}).sort(), ['typescript', 'vite']),
  );

  const lock = JSON.parse(await readFile(join(ROOT, 'package-lock.json'), 'utf8'));
  const root = lock.packages?.[''] ?? {};
  record(
    'package-lock.json root lists only @amplitude/unified as a direct dependency',
    same(Object.keys(root.dependencies ?? {}), ['@amplitude/unified']),
  );

  const sourceFiles = (await listFiles(join(ROOT, 'src'))).filter((file) => /\.(ts|js)$/.test(file));
  const importPattern = /(?:from\s+|import\s*\(\s*|import\s+)['"]([^'"]+)['"]/g;
  const outside = [];
  const adapterSpecifiers = [];
  let statsigImports = 0;
  for (const file of sourceFiles) {
    const rel = relative(ROOT, file);
    const text = await readFile(file, 'utf8');
    for (const match of text.matchAll(importPattern)) {
      const specifier = match[1];
      if (/statsig/i.test(specifier)) statsigImports += 1;
      if (/^@amplitude(\/|$)/.test(specifier)) {
        if (rel === ADAPTER) adapterSpecifiers.push(specifier);
        else outside.push(`${rel}: ${specifier}`);
      }
    }
  }
  record('no @amplitude import in src/ outside the adapter file', outside.length === 0, outside.join('; '));
  record(
    'the adapter imports only @amplitude/unified',
    adapterSpecifiers.length > 0 && adapterSpecifiers.every((specifier) => specifier === '@amplitude/unified'),
    adapterSpecifiers.join(', '),
  );
  record('no Statsig import in src/', statsigImports === 0);

  let initAllSites = [];
  let assignmentCalls = [];
  for (const file of sourceFiles) {
    const text = await readFile(file, 'utf8');
    const count = (text.match(/initAll\(/g) ?? []).length;
    if (count > 0) initAllSites.push(`${relative(ROOT, file)} x${count}`);
    if (/\b(variant|exposure)\s*\(|\bexperiment\s*\(|\.fetch\s*\(|\bgetFlags|\bvariants?\s*\(/.test(text)) assignmentCalls.push(relative(ROOT, file));
  }
  record('src/ has exactly one initAll( call site, in the adapter', same(initAllSites, [`${ADAPTER} x1`]), initAllSites.join('; '));
  record('src/ makes no variant, exposure, flag or experiment call', assignmentCalls.length === 0, assignmentCalls.join('; '));
}

async function checkInitGuard() {
  const registry = createActionRegistry();
  const flow = makeFlow({ registry });
  const fake = createFakeSdk();
  let created = 0;
  const controller = createAnalyticsController({
    apiKey: FAKE_KEY,
    createSdk: () => {
      created += 1;
      return fake.sdk;
    },
    registry,
    flow,
  });
  const first = controller.start();
  const second = controller.start();
  const third = controller.start();
  const statuses = await Promise.all([first, second, third]);
  record('with a key, three start calls make exactly one init call', fake.calls.filter((call) => call.name === 'init').length === 1 && created === 1);
  record('start returns the same result for every call', same(statuses, ['started', 'started', 'started']) && first === second && second === third);
  record('with a key, one sink named amplitude is registered', registry.sinkCount() === 1);
  setAnalytics(undefined);

  const noKeyCases = [
    ['missing key', undefined],
    ['null key', null],
    ['empty key', ''],
    ['whitespace key', '   '],
    ['non-string key', 12345],
  ];
  for (const [label, apiKey] of noKeyCases) {
    const noKeyRegistry = createActionRegistry();
    const noKeyFlow = makeFlow({ registry: noKeyRegistry });
    const noKeyFake = createFakeSdk();
    let createdCount = 0;
    const noKey = createAnalyticsController({
      apiKey,
      createSdk: () => {
        createdCount += 1;
        return noKeyFake.sdk;
      },
      registry: noKeyRegistry,
      flow: noKeyFlow,
    });
    const status = await noKey.start();
    const signUp = submitSignUp(noKeyFlow, { ...VALID, email: 'new.contact@northwind-labs.example' });
    const demo = submitDemoRequest(noKeyFlow, { ...VALID, planId: '', email: 'new.contact@northwind-labs.example' });
    let navigated = 0;
    getAnalytics().navigateAfterFlush(() => {
      navigated += 1;
    });
    record(
      `${label}: status disabled, zero SDK calls, no SDK created, no sink`,
      status === 'disabled' && noKeyFake.calls.length === 0 && createdCount === 0 && noKeyRegistry.sinkCount() === 0,
    );
    record(
      `${label}: handlers still return actions and destinations as in Phase 2`,
      signUp.ok &&
        signUp.destination === '/AmpliGen/welcome/' &&
        signUp.emit.status === 'no_sink' &&
        demo.ok &&
        demo.destination === '/AmpliGen/demo-request/success/' &&
        demo.emit.status === 'no_sink',
    );
    record(`${label}: navigation happens immediately`, navigated === 1);
  }

  for (const mode of ['throw', 'reject']) {
    const failRegistry = createActionRegistry();
    const failFlow = makeFlow({ registry: failRegistry });
    const failFake = createFakeSdk({ init: mode });
    const failing = createAnalyticsController({ apiKey: FAKE_KEY, createSdk: () => failFake.sdk, registry: failRegistry, flow: failFlow });
    const status = await failing.start();
    const result = submitSignUp(failFlow, { ...VALID, email: 'new.contact@northwind-labs.example' });
    let navigated = 0;
    getAnalytics().navigateAfterFlush(() => {
      navigated += 1;
    });
    record(
      `SDK init that ${mode}s is caught: status failed, sink removed, handlers work, navigation immediate`,
      status === 'failed' &&
        failRegistry.sinkCount() === 0 &&
        result.ok &&
        result.destination === '/AmpliGen/welcome/' &&
        navigated === 1,
    );
  }

  const throwingFactory = createAnalyticsController({
    apiKey: FAKE_KEY,
    createSdk: () => {
      throw new Error('factory threw');
    },
    registry: createActionRegistry(),
    flow: makeFlow(),
  });
  record('a throwing SDK factory is caught', (await throwingFactory.start()) === 'failed');

  const pendingRegistry = createActionRegistry();
  const pendingFlow = makeFlow({ registry: pendingRegistry });
  const pendingFake = createFakeSdk({ init: 'pending' });
  const pending = createAnalyticsController({ apiKey: FAKE_KEY, createSdk: () => pendingFake.sdk, registry: pendingRegistry, flow: pendingFlow });
  void pending.start();
  const early = submitSignUp(pendingFlow, { ...VALID, email: 'new.contact@northwind-labs.example' });
  record(
    'an action submitted before init resolves is handed to the SDK queue',
    early.ok && early.emit.status === 'emitted' && pendingFake.tracks().length === 1,
  );
  setAnalytics(undefined);
}

function checkConfig() {
  const options = buildInitOptions();
  const fake = createFakeSdk();
  const registry = createActionRegistry();
  const controller = createAnalyticsController({ apiKey: FAKE_KEY, createSdk: () => fake.sdk, registry, flow: makeFlow({ registry }) });
  void controller.start();
  setAnalytics(undefined);
  const init = fake.calls.find((call) => call.name === 'init');
  const [passedKey, passedOptions] = init?.args ?? [];

  record('the key is passed through to the single init call', passedKey === FAKE_KEY);
  record(
    'Analytics, Session Replay, Feature Experiment and Guides and Surveys are all configured',
    ['analytics', 'sessionReplay', 'experiment', 'engagement'].every((key) => passedOptions?.[key] !== undefined && typeof passedOptions[key] === 'object'),
  );
  record('the options handed to init equal the central settings', same(passedOptions, options));

  const replay = passedOptions?.sessionReplay;
  record('Session Replay sample rate is 100%', replay?.sampleRate === 1);
  record(
    'Session Replay uses the least-masking level (light) and unmasks form controls',
    replay?.privacyConfig?.defaultMaskLevel === 'light' &&
      ['input', 'select', 'textarea'].every((selector) => replay.privacyConfig.unmaskSelector?.includes(selector)),
  );
  record(
    'Session Replay has no mask, block or attribute-mask selectors',
    replay?.privacyConfig?.maskSelector === undefined &&
      replay?.privacyConfig?.blockSelector === undefined &&
      replay?.privacyConfig?.maskAttributes === undefined,
  );

  const autocapture = passedOptions?.analytics?.autocapture;
  record(
    'Autocapture is on for page views, sessions and element clicks',
    typeof autocapture === 'object' && autocapture.pageViews === true && autocapture.elementInteractions === true && autocapture.sessions === true,
  );
  record(
    'Autocapture network tracking, web vitals and frustration interactions are off (outside the agreed scope)',
    autocapture?.networkTracking === false && autocapture?.webVitals === false && autocapture?.frustrationInteractions === false,
  );
  record('Autocapture form interactions are not disabled (they record no field values)', autocapture?.formInteractions !== false);

  const experiment = passedOptions?.experiment;
  record(
    'Feature Experiment is configured to fetch nothing, poll nothing and track no exposure',
    experiment?.fetchOnStart === false &&
      experiment?.pollOnStart === false &&
      experiment?.automaticFetchOnAmplitudeIdentityChange === false &&
      experiment?.automaticExposureTracking === false &&
      experiment?.deploymentKey === undefined &&
      experiment?.initialVariants === undefined,
  );
  record('Guides and Surveys is enabled (skip is false) with no content options', same(passedOptions?.engagement, { skip: false }));
  record(
    'the fake never receives a variant, exposure or flag call',
    fake.names().every((name) => ['init', 'setUserId', 'setUserProperties', 'setGroup', 'track', 'flush'].includes(name)),
    fake.names().join(', '),
  );
}

async function checkEventSequence() {
  const registry = createActionRegistry();
  const fake = createFakeSdk();
  const controller = createAnalyticsController({ apiKey: FAKE_KEY, createSdk: () => fake.sdk, registry, flow: makeFlow({ registry }) });
  await controller.start();
  setAnalytics(undefined);
  const before = fake.tracks().length;

  const ids = createSequentialIds();
  const journeyCounts = [];
  for (const journey of BOT_JOURNEYS) {
    const beforeJourney = fake.tracks().length;
    replayJourney(registry, ids, journey);
    journeyCounts.push(fake.tracks().length - beforeJourney);
  }

  const expectedActions = runBotJourneys().flatMap((line) => (line.result?.action ? [line.result.action] : []));
  const tracks = fake.tracks();
  record('the fake receives exactly three track calls from the four journeys', tracks.length - before === 3, `${tracks.length - before} calls`);
  record(
    'track calls arrive in order: Demo Request Submitted, Sign Up Completed, Sign Up Completed',
    same(tracks.map((call) => call.args[0]), ['Demo Request Submitted', 'Sign Up Completed', 'Sign Up Completed']),
  );
  record(
    'track names and properties equal what the contract builders produce for the bot journeys',
    same(tracks.map((call) => ({ name: call.args[0], properties: call.args[1] })), expectedActions),
  );
  record(
    'each track call carries insert_id equal to its event_id',
    tracks.every((call) => call.args[2]?.insertId === call.args[1].event_id && call.args[1].event_id.startsWith('evt_')),
  );
  const eventIds = tracks.map((call) => call.args[1].event_id);
  record('no event_id repeats', new Set(eventIds).size === eventIds.length);
  record('Initech browse-only sends nothing and the invalid Dana sign-up sends nothing', same(journeyCounts, [1, 1, 0, 1]), journeyCounts.join(','));
  record(
    'all bot track calls have traffic_source bot, is_synthetic true and is_simulated true',
    tracks.every((call) => call.args[1].traffic_source === 'bot' && call.args[1].is_synthetic === true && call.args[1].is_simulated === true),
  );
  record(
    'only the two approved action names are tracked',
    tracks.every((call) => ['Demo Request Submitted', 'Sign Up Completed'].includes(call.args[0])),
  );

  const firstAction = expectedActions[0];
  const replay = registry.emit(firstAction);
  record('re-emitting an action sends nothing', replay.status === 'duplicate' && fake.tracks().length === tracks.length);
}

function replayJourney(registry, ids, journey) {
  const flow = {
    identityStorage: createMemoryStorage({ [IDENTITY_STORAGE_KEY]: JSON.stringify({ visitorId: journey.botId }) }),
    navigationStorage: createMemoryStorage(),
    ids,
    registry,
    origin: 'bot',
  };
  const persona = findPersona(journey.steps.find((step) => step.type === 'select_persona').personaId);
  for (const step of journey.steps) {
    if (step.type === 'select_persona') activatePersona(flow, step.personaId);
    else if (step.type === 'visit') recordPageView(flow.navigationStorage, appPath(step.path));
    else if (step.type === 'submit_demo_request') {
      recordPageView(flow.navigationStorage, ROUTES.demoRequest);
      submitDemoRequest(flow, { name: persona.name, email: persona.email, productId: step.productId, planId: step.planId });
    } else if (step.type === 'submit_sign_up') {
      recordPageView(flow.navigationStorage, ROUTES.signUp);
      submitSignUp(flow, {
        name: persona.name,
        email: step.input === 'invalid_email' ? 'not-an-email' : persona.email,
        productId: step.productId,
        planId: step.planId,
      });
    }
  }
}

async function checkIdentityAndProperties(privacySurfaces) {
  const registry = createActionRegistry();
  const flow = makeFlow({ registry });
  const fake = createFakeSdk();
  const controller = createAnalyticsController({ apiKey: FAKE_KEY, createSdk: () => fake.sdk, registry, flow });
  await controller.start();
  const visitorId = readIdentity(flow).visitorId;

  const startupCalls = fake.calls.filter((call) => call.name !== 'init');
  record(
    'at startup the SDK user ID is the stored visitor ID and is_synthetic is false with no account',
    startupCalls[0]?.name === 'setUserId' &&
      startupCalls[0].args[0] === visitorId &&
      same(startupCalls[1], { name: 'setUserProperties', args: [{ is_synthetic: false }] }) &&
      !fake.names().includes('setGroup'),
  );

  const priya = PERSONAS[0];
  activatePersona(flow, priya.id);
  getAnalytics().syncIdentity();
  const afterSwap = fake.calls.slice(-3);
  record(
    'after a persona swap the SDK user ID is the persona ID, is_synthetic is true and account_id and the account group match',
    same(afterSwap, [
      { name: 'setUserId', args: [priya.id] },
      { name: 'setUserProperties', args: [{ is_synthetic: true, account_id: 'acct_northwind_labs' }] },
      { name: 'setGroup', args: ['account', 'acct_northwind_labs'] },
    ]),
  );

  const signUp = submitSignUp(flow, { ...VALID, name: priya.name, email: priya.email });
  const trackIndex = fake.calls.findIndex((call) => call.name === 'track');
  const beforeTrack = fake.calls.slice(trackIndex - 3, trackIndex);
  record(
    'immediately before track the SDK gets the action user ID, properties and account group',
    signUp.ok &&
      same(beforeTrack, [
        { name: 'setUserId', args: [signUp.action.properties.user_id] },
        { name: 'setUserProperties', args: [{ is_synthetic: true, account_id: 'acct_northwind_labs' }] },
        { name: 'setGroup', args: ['account', 'acct_northwind_labs'] },
      ]),
  );

  resetSampleVisitor(flow);
  getAnalytics().syncIdentity();
  const afterReset = fake.calls.filter((call) => call.name === 'setUserId').at(-1);
  const resetProps = fake.calls.filter((call) => call.name === 'setUserProperties').at(-1);
  record(
    'after reset the SDK user ID is the original visitor ID, is_synthetic is false and there is no account_id',
    afterReset?.args[0] === visitorId && same(resetProps?.args, [{ is_synthetic: false }]) && readIdentity(flow).visitorId === visitorId,
  );
  record('reset never calls any SDK reset, opt-out or device change', !fake.names().some((name) => /reset|optout|device/i.test(name)));

  const dana = PERSONAS[3];
  activatePersona(flow, dana.id);
  getAnalytics().syncIdentity();
  const groupsBeforeDana = fake.calls.filter((call) => call.name === 'setGroup').length;
  const danaSignUp = submitSignUp(flow, { ...VALID, name: dana.name, email: dana.email });
  const danaTrack = fake.calls.findLastIndex((call) => call.name === 'track');
  const danaBefore = fake.calls.slice(danaTrack - 2, danaTrack);
  record(
    'for Dana (unmapped) account_id is not a user property and no group is set',
    danaSignUp.ok &&
      same(danaBefore, [
        { name: 'setUserId', args: ['persona_dana_wu'] },
        { name: 'setUserProperties', args: [{ is_synthetic: true }] },
      ]) &&
      fake.calls.filter((call) => call.name === 'setGroup').length === groupsBeforeDana,
  );

  const mixedSwap = fake.calls.filter((call) => call.name === 'setUserProperties');
  record(
    'every is_synthetic user property is a boolean and account_id is only ever a fixture account ID',
    mixedSwap.every((call) => typeof call.args[0].is_synthetic === 'boolean' && (call.args[0].account_id === undefined || /^acct_[a-z_]+$/.test(call.args[0].account_id))),
  );
  const trackGroups = fake.calls.filter((call) => call.name === 'setGroup').every((call) => call.args[0] === 'account' && /^acct_/.test(call.args[1]));
  record('the account group type is only account and always matches an account_id', trackGroups);

  privacySurfaces.push(['SDK calls from the identity scenario', fake.calls]);
  setAnalytics(undefined);
}

async function checkPrivacy(privacySurfaces) {
  const needles = ['@', ...PERSONAS.map((persona) => persona.name), VALID.name];
  privacySurfaces.push(['init options', buildInitOptions()]);
  const registry = createActionRegistry();
  const fake = createFakeSdk();
  const flow = makeFlow({ registry });
  await createAnalyticsController({ apiKey: FAKE_KEY, createSdk: () => fake.sdk, registry, flow }).start();
  activatePersona(flow, PERSONAS[1].id);
  getAnalytics().syncIdentity();
  submitDemoRequest(flow, { ...VALID, planId: 'starter', name: PERSONAS[1].name, email: PERSONAS[1].email });
  submitSignUp(flow, { ...VALID, name: 'Another Name', email: 'person@unlisted-company.test' });
  await new Promise((done) => setTimeout(done, 0));
  privacySurfaces.push(['SDK calls from demo request and sign-up', fake.calls]);
  setAnalytics(undefined);

  record('privacy scan covers SDK calls with track, user property and group arguments', privacySurfaces.some(([, value]) => Array.isArray(value) && value.some((call) => call.name === 'track')) && privacySurfaces.some(([, value]) => Array.isArray(value) && value.some((call) => call.name === 'setGroup')));
  for (const [label, value] of privacySurfaces) {
    const text = strings(value);
    const found = needles.filter((needle) => text.some((item) => item.includes(needle)));
    record(`${label} contain no @ or fixture name (scanned recursively)`, found.length === 0, found.join(', '));
  }
}

async function checkDelivery() {
  const manual = () => {
    const timers = [];
    return {
      timers,
      setTimer: (callback, delayMs) => {
        const handle = { callback, delayMs, cleared: false };
        timers.push(handle);
        return handle;
      },
      clearTimer: (handle) => {
        handle.cleared = true;
      },
    };
  };

  {
    const clock = manual();
    let navigated = 0;
    let resolveFlush;
    flushThenNavigate({
      flush: () => new Promise((resolveIt) => {
        resolveFlush = resolveIt;
      }),
      navigate: () => {
        navigated += 1;
      },
      setTimer: clock.setTimer,
      clearTimer: clock.clearTimer,
    });
    record('a pending flush does not navigate yet', navigated === 0 && clock.timers.length === 1);
    record('the default wait is at most 1000 ms', clock.timers[0].delayMs === MAX_FLUSH_WAIT_MS && MAX_FLUSH_WAIT_MS <= 1000);
    resolveFlush();
    await Promise.resolve();
    await Promise.resolve();
    record('navigation follows a resolved flush exactly once and cancels the timer', navigated === 1 && clock.timers[0].cleared);
    clock.timers[0].callback();
    record('a late timer does not navigate a second time', navigated === 1);
  }

  {
    const clock = manual();
    let navigated = 0;
    let resolveFlush;
    flushThenNavigate({
      flush: () => new Promise((resolveIt) => {
        resolveFlush = resolveIt;
      }),
      navigate: () => {
        navigated += 1;
      },
      setTimer: clock.setTimer,
      clearTimer: clock.clearTimer,
    });
    clock.timers[0].callback();
    record('navigation happens after the limit when flush never resolves', navigated === 1);
    resolveFlush();
    await Promise.resolve();
    await Promise.resolve();
    record('a flush that resolves after the limit does not navigate a second time', navigated === 1);
  }

  {
    let navigated = 0;
    const started = Date.now();
    await new Promise((done) => {
      flushThenNavigate({
        flush: () => new Promise(() => {}),
        navigate: () => {
          navigated += 1;
          done();
        },
        timeoutMs: 60,
      });
    });
    const elapsed = Date.now() - started;
    record('with real timers a never-resolving flush navigates after the limit', navigated === 1 && elapsed >= 50 && elapsed < 900, `${elapsed} ms`);
  }

  {
    let navigated = 0;
    flushThenNavigate({ flush: undefined, navigate: () => (navigated += 1) });
    record('with no flush function it navigates immediately', navigated === 1);
  }

  for (const [label, flush] of [
    ['rejects', () => Promise.reject(new Error('flush failed'))],
    ['throws', () => {
      throw new Error('flush threw');
    }],
  ]) {
    const clock = manual();
    let navigated = 0;
    flushThenNavigate({ flush, navigate: () => (navigated += 1), setTimer: clock.setTimer, clearTimer: clock.clearTimer });
    await Promise.resolve();
    await Promise.resolve();
    clock.timers[0]?.callback();
    record(`a flush that ${label} still navigates exactly once`, navigated === 1);
  }

  {
    const registry = createActionRegistry();
    const fake = createFakeSdk();
    await createAnalyticsController({ apiKey: FAKE_KEY, createSdk: () => fake.sdk, registry, flow: makeFlow({ registry }) }).start();
    let navigated = 0;
    getAnalytics().navigateAfterFlush(() => (navigated += 1));
    await Promise.resolve();
    await Promise.resolve();
    record('with a sink the handle flushes the SDK once and then navigates once', navigated === 1 && fake.names().filter((name) => name === 'flush').length === 1);
    setAnalytics(undefined);
  }

  const forms = await readFile(join(ROOT, 'src', 'ui', 'forms.ts'), 'utf8');
  record(
    'forms.ts navigates only through navigateAfterFlush',
    /navigateAfterFlush\(\(\) => window\.location\.assign\(result\.destination\)\)/.test(forms) && (forms.match(/location\.assign/g) ?? []).length === 1,
  );
  record('forms.ts syncs identity after persona selection and reset', (forms.match(/syncIdentity\(\)/g) ?? []).length >= 4);
}

async function checkNetworkSilence() {
  installNetworkStubs();
  try {
    const registry = createActionRegistry();
    const flow = makeFlow({ registry });
    let created = 0;
    const status = await createAnalyticsController({
      apiKey: undefined,
      createSdk: () => {
        created += 1;
        throw new Error('SDK must not be created without a key');
      },
      registry,
      flow,
    }).start();
    const activeBefore = networkCalls.length;
    activatePersona(flow, PERSONAS[0].id);
    getAnalytics().syncIdentity();
    submitSignUp(flow, { ...VALID, email: PERSONAS[0].email, name: PERSONAS[0].name });
    submitDemoRequest(flow, { ...VALID, planId: '', email: 'new.contact@northwind-labs.example' });
    resetSampleVisitor(flow);
    getAnalytics().navigateAfterFlush(() => {});
    const lines = runBotJourneys();
    record('without a key the controller is disabled and creates no SDK', status === 'disabled' && created === 0);
    record('without a key, handler and bot work call no stubbed network API', networkCalls.length === 0 && activeBefore === 0 && lines.length === 16, `${networkCalls.length} calls`);

    try {
      await globalThis.fetch('http://127.0.0.1:9/');
    } catch {
      // The stub throws by design.
    }
    const recorded = networkCalls.length === 1;
    networkCalls.length = 0;
    record('network stubs record and block a fetch attempt', recorded);
  } finally {
    removeNetworkStubs();
  }
}

async function checkRepoForKeys() {
  const candidates = [
    ...(await listFiles(join(ROOT, 'src'))),
    ...(await listFiles(join(ROOT, 'scripts'))),
    join(ROOT, 'README.md'),
    join(ROOT, 'package.json'),
    join(ROOT, 'vite.config.ts'),
    ...(await listFiles(join(ROOT, '.github'))),
  ].filter((file) => /\.(ts|mjs|js|json|md|yml|yaml|html)$/.test(file));
  const offenders = [];
  for (const file of candidates) {
    let text;
    try {
      text = await readFile(file, 'utf8');
    } catch {
      continue;
    }
    if (/api[_-]?key['"]?\s*[:=]\s*['"][A-Za-z0-9]{16,}['"]/i.test(text) || /\b[a-f0-9]{32}\b/.test(text)) offenders.push(relative(ROOT, file));
  }
  record('no key-like literal appears in src/, scripts/, .github/, README or config', offenders.length === 0, offenders.join('; '));
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

async function checkBuiltOutput() {
  let missing = 0;
  for (const route of ROUTE_LIST) {
    try {
      const info = await stat(join(DIST, route.slice(BASE_PATH.length), 'index.html'));
      record(`build output exists for ${route}`, info.isFile());
    } catch {
      missing += 1;
      record(`build output exists for ${route}`, false, 'run npm run build first');
    }
  }
  if (missing > 0) return;

  const files = (await listFiles(DIST)).filter((file) => /\.(js|html|css)$/.test(file));
  const keyLike = [];
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    if (/\bapi[_-]?key["']?\s*[:=]\s*["'][A-Za-z0-9]{24,}["']/i.test(text)) keyLike.push(relative(ROOT, file));
  }
  record('dist/ built without a key has no assigned key-like literal', keyLike.length === 0, keyLike.join('; '));

  const assets = (await listFiles(join(DIST, 'assets'))).filter((file) => file.endsWith('.js'));
  const ownChunks = [];
  for (const file of assets) {
    const text = await readFile(file, 'utf8');
    if (text.length < 4000 && /demo-request|sign-up|welcome|forms/.test(file)) ownChunks.push([file, text]);
  }
  record('the page and form chunks built from src/ contain no network call', ownChunks.length >= 4 && ownChunks.every(([, text]) => !/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket/.test(text)), `${ownChunks.length} chunks`);

  const mainChunks = [];
  for (const file of assets) {
    const text = await readFile(file, 'utf8');
    if (/AmpliGen|ampligen\.identity/.test(text)) mainChunks.push(text);
  }
  const entryText = mainChunks.join('\n');
  record('the entry chunk reads the key from the build environment and holds no literal key', mainChunks.length > 0 && !/VITE_AMPLITUDE_API_KEY/.test(entryText));
  const allScripts = await Promise.all(assets.map((file) => readFile(file, 'utf8')));
  record('built scripts contain no Statsig code', allScripts.every((text) => !/statsig/i.test(text)));

  const server = await startServer();
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    for (const route of ROUTE_LIST) {
      const response = await realFetch(`${origin}${route}`);
      await response.text();
      record(`built route ${route} returns HTTP 200 under /AmpliGen/`, response.status === 200, `status ${response.status}`);
    }
    const welcome = await (await realFetch(`${origin}/AmpliGen/welcome/`)).text();
    record('the welcome page guide anchor is still empty', /<div id="guide-anchor" data-guide-anchor><\/div>/.test(welcome));
  } finally {
    await new Promise((done) => server.close(done));
  }
}

async function main() {
  await checkDependencies();
  await checkInitGuard();
  checkConfig();
  await checkEventSequence();
  const privacySurfaces = [];
  await checkIdentityAndProperties(privacySurfaces);
  await checkPrivacy(privacySurfaces);
  await checkDelivery();
  await checkNetworkSilence();
  await checkRepoForKeys();
  await checkBuiltOutput();

  console.log(`\n${passCount} passed, ${failures.length} failed.`);
  if (failures.length > 0) console.log(`Failed: ${failures.join('; ')}`);
  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error('Smoke check crashed:', error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
