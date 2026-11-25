import http from 'node:http';
import https from 'node:https';
import { syncBuiltinESMExports } from 'node:module';
import net from 'node:net';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createAnalyticsController } from '../src/analytics/controller.ts';
import { getAnalytics, setAnalytics } from '../src/analytics/handle.ts';
import { MAX_FLUSH_WAIT_MS } from '../src/analytics/navigation.ts';
import { appPath, ROUTES } from '../src/contract/paths.ts';
import { createActionRegistry } from '../src/contract/registry.ts';
import { ACCOUNTS } from '../src/fixtures/accounts.ts';
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
import * as names from '../src/statsig/config.ts';
import { createExperimentsController } from '../src/statsig/controller.ts';
import { metadataFor } from '../src/statsig/events.ts';
import { runBotJourneys } from './bot-runner.mjs';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST = join(ROOT, 'dist');
const BASE_PATH = '/AmpliGen/';
const ADAPTER = join('src', 'statsig', 'statsig-adapter.ts');
const STATSIG_DIR = join(ROOT, 'src', 'statsig') + sep;

const CONTENT_TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

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
const FAKE_KEY = ['fake', 'client', 'key', 'for', 'smoke', 'only'].join('-');
const VALID = { name: 'Test Person', productId: 'ampligen_metrics', planId: 'growth' };
const NEW_CONTACT = 'new.contact@northwind-labs.example';
const AMPLITUDE_KEY = ['fake', 'other', 'key'].join('-');

const FALLBACK_NOTICE = 'Illustrative pricing. Not offered.';
const CONTROL_LABELS = ['Start a trial', 'Start a trial', 'Request a demo'];
const SPECIFIC_LABELS = ['Start a free trial', 'Start a free trial', 'Talk to sales'];
const PLANS = ['Starter', 'Growth', 'Enterprise'];
const BREAKDOWN_SENTENCE = 'Account breakdown shows usage and conversion for the mapped account.';

function createFakeExperiments({
  init = 'resolve',
  experiment = { label_mode: 'specific' },
  gate = true,
  config = { notice: 'Sample pricing for a walkthrough.' },
  flush = 'resolve',
  throwOn = [],
} = {}) {
  const calls = [];
  const exposures = [];
  const events = [];
  let user;
  let release;
  const log = (name, ...args) => calls.push({ name, args: structuredClone(args) });
  const fake = {
    calls,
    exposures,
    events,
    names: () => calls.map((call) => call.name),
    release: () => release?.(),
    sdk: {
      init(apiKey, initialUser, options) {
        log('init', apiKey, initialUser, options);
        user = structuredClone(initialUser);
        if (init === 'throw') throw new Error('init threw');
        if (init === 'reject') return Promise.reject(new Error('init rejected'));
        if (init === 'manual') {
          return new Promise((resolveInit) => {
            release = resolveInit;
          });
        }
        return Promise.resolve();
      },
      updateUser(next) {
        log('updateUser', next);
        user = structuredClone(next);
      },
      getExperimentValue(name) {
        exposures.push({ kind: 'experiment', name });
        if (throwOn.includes('experiment')) throw new Error('experiment failed');
        return experiment;
      },
      checkGate(name) {
        exposures.push({ kind: 'gate', name });
        if (throwOn.includes('gate')) throw new Error('gate failed');
        return gate;
      },
      getConfigValue(name) {
        exposures.push({ kind: 'config', name });
        if (throwOn.includes('config')) throw new Error('config failed');
        return config;
      },
      logEvent(name, metadata) {
        log('logEvent', name, metadata);
        events.push({ name, metadata: structuredClone(metadata), user: structuredClone(user) });
      },
      flush() {
        log('flush');
        if (flush === 'never') return new Promise(() => {});
        if (flush === 'reject') return Promise.reject(new Error('flush rejected'));
        if (flush === 'throw') throw new Error('flush threw');
        return Promise.resolve();
      },
    },
  };
  return fake;
}

function createFakeAmplitude({ flush = 'resolve' } = {}) {
  const calls = [];
  const log = (name, ...args) => calls.push({ name, args: structuredClone(args) });
  return {
    calls,
    names: () => calls.map((call) => call.name),
    tracks: () => calls.filter((call) => call.name === 'track'),
    sdk: {
      init(apiKey, options) {
        log('init', apiKey, options);
        return Promise.resolve();
      },
      setUserId: (userId) => log('setUserId', userId),
      setUserProperties: (properties) => log('setUserProperties', properties),
      setGroup: (type, name) => log('setGroup', type, name),
      track: (name, properties, options) => log('track', name, properties, options),
      flush() {
        log('flush');
        return flush === 'never' ? new Promise(() => {}) : Promise.resolve();
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

function makeElement(text, extra = {}) {
  const element = { textContent: text, hidden: false, ...extra };
  let htmlWrites = 0;
  for (const key of ['innerHTML', 'outerHTML']) {
    Object.defineProperty(element, key, {
      get: () => '',
      set: () => {
        htmlWrites += 1;
      },
    });
  }
  Object.defineProperty(element, 'htmlWrites', { value: () => htmlWrites });
  return element;
}

async function readPage(route) {
  return readFile(join(DIST, route.slice(BASE_PATH.length), 'index.html'), 'utf8');
}

async function loadPricingPage() {
  const html = await readPage('/AmpliGen/pricing/');
  const notice = html.match(/<p class="pricing-label" data-pricing-label>([^<]*)<\/p>/);
  const links = PLANS.map((plan) => {
    const match = html.match(new RegExp(`data-plan="${plan}">[\\s\\S]*?<p class="card-action"><a class="[^"]*" href="([^"]*)">([^<]*)</a></p>`));
    return match === null ? null : { href: match[1], label: match[2] };
  });
  return { html, notice: notice?.[1], links };
}

function makePricingPage(parsed) {
  const nodes = {
    notice: makeElement(parsed.notice),
    links: parsed.links.map((link) => makeElement(link.label, { href: link.href })),
  };
  const bySelector = new Map([
    [names.PRICING_NOTICE_SELECTOR, nodes.notice],
    ...PLANS.map((plan, index) => [names.PLAN_CTA_SELECTORS[plan], nodes.links[index]]),
  ]);
  return { nodes, root: { querySelector: (selector) => bySelector.get(selector) ?? null } };
}

function makeProductPage() {
  const section = makeElement('', { hidden: true });
  return { section, root: { querySelector: (selector) => (selector === names.ACCOUNT_BREAKDOWN_SELECTOR ? section : null) } };
}

function pricingSnapshot(page) {
  return { notice: page.nodes.notice.textContent, labels: page.nodes.links.map((link) => link.textContent), hrefs: page.nodes.links.map((link) => link.href) };
}

async function startExperiments(options = {}) {
  const { fake = createFakeExperiments(), page, flow, registry } = options;
  const apiKey = 'apiKey' in options ? options.apiKey : FAKE_KEY;
  const reg = registry ?? createActionRegistry();
  const fl = flow ?? makeFlow({ registry: reg });
  let created = 0;
  const controller = createExperimentsController({
    apiKey,
    createSdk: () => {
      created += 1;
      return fake.sdk;
    },
    registry: reg,
    flow: fl,
    page,
  });
  const status = await controller.start();
  return { controller, fake, registry: reg, flow: fl, status, created: () => created };
}

function stop(...scenarios) {
  for (const scenario of scenarios) scenario?.controller?.stop();
  setAnalytics(undefined);
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
  record(
    'package.json runtime dependencies are exactly @amplitude/unified and @statsig/js-client',
    same(Object.keys(manifest.dependencies ?? {}).sort(), ['@amplitude/unified', '@statsig/js-client']),
  );
  const sections = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
  const declared = sections.flatMap((section) => Object.keys(manifest[section] ?? {}));
  record('no other Statsig or Amplitude package is declared', same(declared.filter((name) => /statsig|amplitude/i.test(name)).sort(), ['@amplitude/unified', '@statsig/js-client']));
  record('dev dependencies are still only typescript and vite', same(Object.keys(manifest.devDependencies ?? {}).sort(), ['typescript', 'vite']));

  const lock = JSON.parse(await readFile(join(ROOT, 'package-lock.json'), 'utf8'));
  record(
    'package-lock.json root lists only @amplitude/unified and @statsig/js-client as direct dependencies',
    same(Object.keys(lock.packages?.['']?.dependencies ?? {}).sort(), ['@amplitude/unified', '@statsig/js-client']),
  );
  const lockedStatsig = Object.keys(lock.packages ?? {}).filter((key) => /statsig/i.test(key)).sort();
  record(
    'the lock file holds only @statsig/js-client and its own @statsig/client-core, with no replay, analytics or legacy Statsig package',
    same(lockedStatsig, ['node_modules/@statsig/client-core', 'node_modules/@statsig/js-client']),
    lockedStatsig.join(', '),
  );

  const sourceFiles = (await listFiles(join(ROOT, 'src'))).filter((file) => /\.(ts|js)$/.test(file));
  const importPattern = /(?:from\s+|import\s*\(\s*|import\s+)['"]([^'"]+)['"]/g;
  const statsigSpecifiers = [];
  const clientSites = [];
  const envReads = [];
  const bannedInStatsig = [];
  const statsigInOther = [];
  for (const file of sourceFiles) {
    const rel = relative(ROOT, file);
    const text = await readFile(file, 'utf8');
    for (const match of text.matchAll(importPattern)) {
      if (!match[1].startsWith('.') && /statsig/i.test(match[1])) statsigSpecifiers.push(`${rel}: ${match[1]}`);
    }
    const constructed = (text.match(/new\s+StatsigClient\(/g) ?? []).length;
    if (constructed > 0) clientSites.push(`${rel} x${constructed}`);
    if (/import\.meta\.env/.test(text) && file.startsWith(STATSIG_DIR)) envReads.push(`${rel}: ${(text.match(/import\.meta\.env[.\w]*/g) ?? []).join(',')}`);
    if (file.startsWith(STATSIG_DIR)) {
      for (const [label, pattern] of [
        ['the other analytics vendor', /amplitude/i],
        ['a track call', /\.track\s*\(/],
        ['an exposure business event', /Experiment Exposure|\$exposure/],
        ['HTML assignment', /innerHTML|outerHTML|insertAdjacentHTML|document\.write/],
        ['a timer or second wait', /setTimeout|setInterval/],
        ['a network API', /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket/],
      ]) {
        if (pattern.test(text)) bannedInStatsig.push(`${rel}: ${label}`);
      }
    } else if (/statsig/i.test(text.split('./statsig/entry.ts').join('')) && !file.startsWith(join(ROOT, 'src', 'statsig'))) {
      statsigInOther.push(rel);
    }
  }
  record(
    'the only Statsig package import in src/ is @statsig/js-client from src/statsig/statsig-adapter.ts',
    same(statsigSpecifiers, [`${ADAPTER}: @statsig/js-client`]),
    statsigSpecifiers.join('; '),
  );
  record('src/ has exactly one StatsigClient construction, in the adapter', same(clientSites, [`${ADAPTER} x1`]), clientSites.join('; '));
  record(
    'the only environment read in src/statsig/ is the Statsig client key, in entry.ts',
    same(envReads, [`${join('src', 'statsig', 'entry.ts')}: import.meta.env.VITE_STATSIG_CLIENT_KEY`]),
    envReads.join('; '),
  );
  record('src/statsig/ has no other-vendor code, track call, exposure event, HTML assignment, timer or network API', bannedInStatsig.length === 0, bannedInStatsig.join('; '));
  record('Statsig is mentioned in src/ only inside src/statsig/ and the one entry import in main.ts', statsigInOther.length === 0, statsigInOther.join('; '));

  const forms = await readFile(join(ROOT, 'src', 'ui', 'forms.ts'), 'utf8');
  record(
    'forms.ts still navigates once, through navigateAfterFlush, with no timer of its own',
    /navigateAfterFlush\(\(\) => window\.location\.assign\(result\.destination\)\)/.test(forms) &&
      (forms.match(/location\.assign/g) ?? []).length === 1 &&
      !/setTimeout|setInterval|statsig/i.test(forms),
  );

  record(
    'the entity names are exactly pricing_cta_copy (label_mode), metrics_account_breakdown and pricing_notice (notice)',
    names.EXPERIMENT_NAME === 'pricing_cta_copy' &&
      names.LABEL_MODE_PARAMETER === 'label_mode' &&
      names.GATE_NAME === 'metrics_account_breakdown' &&
      names.NOTICE_CONFIG_NAME === 'pricing_notice' &&
      names.NOTICE_PARAMETER === 'notice' &&
      names.NOTICE_MAX_LENGTH === 120 &&
      names.ENVIRONMENT_TIER === 'production',
  );
  record('the sink is named statsig', names.SINK_NAME === 'statsig');
}

async function checkInitGuard() {
  const pricing = await loadPricingPage();
  const page = makePricingPage(pricing);
  const fake = createFakeExperiments();
  const first = await startExperiments({ fake, page: page.root });
  const registry = first.registry;
  const again = await Promise.all([first.controller.start(), first.controller.start()]);
  const initCalls = fake.calls.filter((call) => call.name === 'init');
  const visitorId = readIdentity(first.flow).visitorId;
  record('with a key, three start calls make exactly one init call and one client', initCalls.length === 1 && first.created() === 1 && same(again, ['started', 'started']));
  record('the key, the initial user and the production tier reach the one init call', initCalls[0]?.args[0] === FAKE_KEY && initCalls[0]?.args[2]?.environmentTier === 'production' && initCalls[0]?.args[2]?.timeoutMs === 3000);
  record(
    'the initial user is the visitor ID with is_synthetic false and nothing else',
    same(initCalls[0]?.args[1], { userID: visitorId, custom: { is_synthetic: false } }),
  );
  record('with a key, one sink named statsig is registered', registry.sinkCount() === 1 && first.status === 'started');
  stop(first);
  record('stop removes the sink', registry.sinkCount() === 0);

  const noKeyCases = [
    ['missing key', undefined],
    ['null key', null],
    ['empty key', ''],
    ['whitespace key', '   '],
    ['non-string key', 12345],
  ];
  for (const [label, apiKey] of noKeyCases) {
    const noKeyPage = makePricingPage(pricing);
    const product = makeProductPage();
    const noKeyFake = createFakeExperiments();
    const scenario = await startExperiments({ apiKey, fake: noKeyFake, page: noKeyPage.root });
    const productScenario = await startExperiments({ apiKey, fake: noKeyFake, page: product.root });
    scenario.controller.applyPage();
    const signUp = submitSignUp(scenario.flow, { ...VALID, email: NEW_CONTACT });
    const demo = submitDemoRequest(scenario.flow, { ...VALID, planId: '', email: NEW_CONTACT });
    let navigated = 0;
    getAnalytics().navigateAfterFlush(() => {
      navigated += 1;
    });
    record(
      `${label}: status disabled, zero SDK calls, no client created, no sink`,
      scenario.status === 'disabled' && productScenario.status === 'disabled' && noKeyFake.calls.length === 0 && noKeyFake.exposures.length === 0 && scenario.created() === 0 && scenario.registry.sinkCount() === 0,
    );
    record(
      `${label}: control labels, unchanged hrefs, fallback notice and a hidden gate section`,
      same(pricingSnapshot(noKeyPage), { notice: FALLBACK_NOTICE, labels: CONTROL_LABELS, hrefs: pricing.links.map((link) => link.href) }) &&
        product.section.hidden === true &&
        product.section.textContent === '',
    );
    record(
      `${label}: handlers still return the Phase 2 actions and destinations`,
      signUp.ok &&
        signUp.destination === '/AmpliGen/welcome/' &&
        signUp.emit.status === 'no_sink' &&
        signUp.action.name === 'Sign Up Completed' &&
        demo.ok &&
        demo.destination === '/AmpliGen/demo-request/success/' &&
        demo.emit.status === 'no_sink' &&
        demo.action.name === 'Demo Request Submitted',
    );
    record(`${label}: navigation happens immediately`, navigated === 1);
    stop(scenario, productScenario);
  }

  for (const mode of ['throw', 'reject']) {
    const failPage = makePricingPage(pricing);
    const failProduct = makeProductPage();
    const failFake = createFakeExperiments({ init: mode });
    const scenario = await startExperiments({ fake: failFake, page: failPage.root });
    const productScenario = await startExperiments({ fake: failFake, page: failProduct.root });
    scenario.controller.applyPage();
    const result = submitSignUp(scenario.flow, { ...VALID, email: NEW_CONTACT });
    let navigated = 0;
    getAnalytics().navigateAfterFlush(() => {
      navigated += 1;
    });
    record(
      `a client whose init ${mode}s is caught: failed, no evaluation, sink removed, fallbacks shown`,
      scenario.status === 'failed' &&
        productScenario.status === 'failed' &&
        failFake.exposures.length === 0 &&
        scenario.registry.sinkCount() === 0 &&
        same(pricingSnapshot(failPage), { notice: FALLBACK_NOTICE, labels: CONTROL_LABELS, hrefs: pricing.links.map((link) => link.href) }) &&
        failProduct.section.hidden === true,
    );
    record(`after a client that ${mode}s, handlers work and navigation is immediate`, result.ok && result.destination === '/AmpliGen/welcome/' && navigated === 1);
    stop(scenario, productScenario);
  }

  const factoryFailure = createExperimentsController({
    apiKey: FAKE_KEY,
    createSdk: () => {
      throw new Error('factory threw');
    },
    registry: createActionRegistry(),
    flow: makeFlow(),
  });
  record('a throwing client factory is caught', (await factoryFailure.start()) === 'failed');

  const evaluationFailures = [];
  for (const throwOn of [['experiment'], ['config'], ['gate']]) {
    const evaluationPage = makePricingPage(pricing);
    const evaluationProduct = makeProductPage();
    const brokenFake = createFakeExperiments({ throwOn });
    const scenario = await startExperiments({ fake: brokenFake, page: evaluationPage.root });
    const productScenario = await startExperiments({ fake: brokenFake, page: evaluationProduct.root });
    const snapshot = pricingSnapshot(evaluationPage);
    const notice = throwOn[0] === 'config' ? snapshot.notice === FALLBACK_NOTICE : true;
    const labels = throwOn[0] === 'experiment' ? same(snapshot.labels, CONTROL_LABELS) : true;
    evaluationFailures.push(scenario.status === 'started' && notice && labels && (throwOn[0] !== 'gate' || evaluationProduct.section.hidden === true));
    stop(scenario, productScenario);
  }
  record('a client that throws on one evaluation leaves that fallback and the page working', evaluationFailures.every(Boolean));
}

async function checkLabels() {
  const pricing = await loadPricingPage();
  record(
    'the built pricing page keeps the control labels and hrefs',
    same(pricing.links, [
      { href: '/AmpliGen/sign-up/', label: 'Start a trial' },
      { href: '/AmpliGen/sign-up/', label: 'Start a trial' },
      { href: '/AmpliGen/demo-request/', label: 'Request a demo' },
    ]) && pricing.notice === FALLBACK_NOTICE,
  );
  const hrefs = pricing.links.map((link) => link.href);

  const control = makePricingPage(pricing);
  const controlRun = await startExperiments({ fake: createFakeExperiments({ experiment: { label_mode: 'control' }, config: {} }), page: control.root });
  record('control changes nothing on the pricing page', same(pricingSnapshot(control), { notice: FALLBACK_NOTICE, labels: CONTROL_LABELS, hrefs }));
  stop(controlRun);

  const specific = makePricingPage(pricing);
  const specificRun = await startExperiments({ fake: createFakeExperiments({ experiment: { label_mode: 'specific' }, config: {} }), page: specific.root });
  record(
    'specific changes only the three CTA labels, and the hrefs and notice stay as they are',
    same(pricingSnapshot(specific), { notice: FALLBACK_NOTICE, labels: SPECIFIC_LABELS, hrefs }),
  );
  record('the treatment labels are Start a free trial, Start a free trial and Talk to sales', same(SPECIFIC_LABELS, PLANS.map((plan) => names.SPECIFIC_CTA_LABELS[plan])));
  stop(specificRun);

  const unrecognized = [
    ['unknown label_mode', { label_mode: 'bold' }],
    ['empty value', {}],
    ['number', { label_mode: 7 }],
    ['boolean', { label_mode: true }],
    ['null', { label_mode: null }],
    ['array', { label_mode: ['specific'] }],
    ['different case', { label_mode: 'Specific' }],
    ['different parameter', { other_param: 'specific' }],
  ];
  for (const [label, experiment] of unrecognized) {
    const page = makePricingPage(pricing);
    const run = await startExperiments({ fake: createFakeExperiments({ experiment, config: {} }), page: page.root });
    record(`${label} uses the control labels`, same(pricingSnapshot(page), { notice: FALLBACK_NOTICE, labels: CONTROL_LABELS, hrefs }));
    stop(run);
  }
}

async function checkGate() {
  const html = await readPage('/AmpliGen/product/');
  const card = html.match(/<li class="card" data-product="AmpliGen Metrics">([\s\S]*?)<\/li>/);
  record(
    'the built product page has an empty hidden gate hook inside the AmpliGen Metrics card',
    card !== null && /<p class="card-note" data-metrics-account-breakdown hidden><\/p>/.test(card[1]) && !html.includes(BREAKDOWN_SENTENCE),
  );
  record('the sentence is not in the built markup, so it cannot show when the gate fails', !html.includes('Account breakdown'));

  const identityStorage = createMemoryStorage();
  const flow = makeFlow({ identityStorage });
  activatePersona(flow, PERSONAS[0].id);
  const shown = makeProductPage();
  const passed = await startExperiments({ fake: createFakeExperiments({ gate: true }), page: shown.root, flow, registry: flow.registry });
  const everyName = [...PERSONAS.flatMap((persona) => [persona.name, persona.email, persona.company, persona.id]), ...ACCOUNTS.flatMap((account) => [account.name, account.id, account.domain])].filter(Boolean);
  record('a passing gate shows the Metrics section with exactly the approved sentence', shown.section.hidden === false && shown.section.textContent === BREAKDOWN_SENTENCE);
  record(
    'the section text has no @ and no persona, company or account name, even with a mapped persona active',
    !shown.section.textContent.includes('@') && !everyName.some((value) => shown.section.textContent.toLowerCase().includes(value.toLowerCase())),
  );
  record('the gate is checked by the name metrics_account_breakdown', same(passed.fake.exposures, [{ kind: 'gate', name: 'metrics_account_breakdown' }]));
  stop(passed);

  const hidden = makeProductPage();
  const failed = await startExperiments({ fake: createFakeExperiments({ gate: false }), page: hidden.root });
  record('a failing gate keeps the section hidden and empty', hidden.section.hidden === true && hidden.section.textContent === '');
  stop(failed);

  for (const [label, gate] of [['a non-boolean gate result', 'yes'], ['a null gate result', null], ['a numeric gate result', 1]]) {
    const odd = makeProductPage();
    const run = await startExperiments({ fake: createFakeExperiments({ gate }), page: odd.root });
    record(`${label} keeps the section hidden`, odd.section.hidden === true && odd.section.textContent === '');
    stop(run);
  }

  const pricing = await loadPricingPage();
  const pricingPage = makePricingPage(pricing);
  const pricingFake = createFakeExperiments();
  const onPricing = await startExperiments({ fake: pricingFake, page: pricingPage.root });
  const productFake = createFakeExperiments();
  const productPage = makeProductPage();
  const onProduct = await startExperiments({ fake: productFake, page: productPage.root });
  record(
    'the pricing page evaluates only the experiment and the config, and the product page only the gate',
    same(pricingFake.exposures.map((item) => item.kind).sort(), ['config', 'experiment']) && same(productFake.exposures.map((item) => item.kind), ['gate']),
  );
  stop(onPricing, onProduct);
}

async function checkNotice() {
  const pricing = await loadPricingPage();
  const cases = [
    ['a short string', { notice: 'Sample pricing for a walkthrough.' }, 'Sample pricing for a walkthrough.'],
    ['markup text', { notice: '<b>bold</b> & <i>text</i>' }, '<b>bold</b> & <i>text</i>'],
    ['exactly 120 characters', { notice: 'x'.repeat(120) }, 'x'.repeat(120)],
    ['121 characters', { notice: 'x'.repeat(121) }, FALLBACK_NOTICE],
    ['a number', { notice: 42 }, FALLBACK_NOTICE],
    ['null', { notice: null }, FALLBACK_NOTICE],
    ['an object', { notice: { text: 'x' } }, FALLBACK_NOTICE],
    ['an array', { notice: ['x'] }, FALLBACK_NOTICE],
    ['a boolean', { notice: true }, FALLBACK_NOTICE],
    ['an empty string', { notice: '' }, FALLBACK_NOTICE],
    ['a blank string', { notice: '   ' }, FALLBACK_NOTICE],
    ['a missing parameter', {}, FALLBACK_NOTICE],
    ['a different parameter', { text: 'other' }, FALLBACK_NOTICE],
  ];
  for (const [label, config, expected] of cases) {
    const page = makePricingPage(pricing);
    const run = await startExperiments({ fake: createFakeExperiments({ config, experiment: {} }), page: page.root });
    record(`notice ${label}: label reads ${expected === FALLBACK_NOTICE ? 'the fallback' : 'the config value'}`, page.nodes.notice.textContent === expected);
    record(`notice ${label}: assigned as text, no HTML written`, page.nodes.notice.htmlWrites() === 0);
    stop(run);
  }
  const replaced = makePricingPage(pricing);
  const run = await startExperiments({ fake: createFakeExperiments({ config: { notice: 'Sample pricing for a walkthrough.' }, experiment: {} }), page: replaced.root });
  record('the config is read by the name pricing_notice', same(run.fake.exposures.filter((item) => item.kind === 'config'), [{ kind: 'config', name: 'pricing_notice' }]));
  stop(run);
}

async function checkExposureOnce() {
  const pricing = await loadPricingPage();
  const page = makePricingPage(pricing);
  const fake = createFakeExperiments({ init: 'manual' });
  const flow = makeFlow();
  const controller = createExperimentsController({ apiKey: FAKE_KEY, createSdk: () => fake.sdk, registry: flow.registry, flow, page: page.root });
  const started = controller.start();
  controller.applyPage();
  record('nothing is evaluated before the client is ready', fake.exposures.length === 0);
  fake.release();
  await started;
  controller.applyPage();
  controller.applyPage();
  controller.applyPage();
  record('evaluating the pricing page again and again logs one experiment exposure and one config exposure', same(fake.exposures, [{ kind: 'experiment', name: 'pricing_cta_copy' }, { kind: 'config', name: 'pricing_notice' }]));
  stop({ controller });

  const product = makeProductPage();
  const productFake = createFakeExperiments();
  const productRun = await startExperiments({ fake: productFake, page: product.root });
  productRun.controller.applyPage();
  productRun.controller.applyPage();
  record('evaluating the product page again logs one gate exposure', same(productFake.exposures, [{ kind: 'gate', name: 'metrics_account_breakdown' }]));
  stop(productRun);

  const bare = createFakeExperiments();
  const bareRun = await startExperiments({ fake: bare, page: { querySelector: () => null } });
  record('a page with none of the three elements evaluates nothing', bare.exposures.length === 0 && bareRun.status === 'started');
  stop(bareRun);
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

function independentMetadata(properties) {
  return Object.fromEntries(Object.entries(properties).map(([key, value]) => [key, typeof value === 'boolean' ? String(value) : value]));
}

async function checkEvents() {
  const pricing = await loadPricingPage();
  const page = makePricingPage(pricing);
  const registry = createActionRegistry();
  const flow = makeFlow({ registry });
  const amplitude = createFakeAmplitude();
  const amplitudeController = createAnalyticsController({ apiKey: AMPLITUDE_KEY, createSdk: () => amplitude.sdk, registry, flow });
  await amplitudeController.start();
  const fake = createFakeExperiments();
  const statsig = await startExperiments({ fake, page: page.root, registry, flow });
  record('with both services on, the registry holds the amplitude and statsig sinks', registry.sinkCount() === 2 && statsig.status === 'started');
  const exposuresBefore = fake.exposures.length;
  const amplitudeBefore = amplitude.tracks().length;

  const ids = createSequentialIds();
  const counts = [];
  for (const journey of BOT_JOURNEYS) {
    const before = fake.events.length;
    replayJourney(registry, ids, journey);
    counts.push(fake.events.length - before);
  }
  const expected = runBotJourneys().flatMap((line) => (line.result?.action ? [line.result.action] : []));
  const events = fake.events;
  const tracks = amplitude.tracks();

  record('the four journeys log exactly three Statsig events', events.length === 3, `${events.length} events`);
  record(
    'Statsig events arrive in order: Demo Request Submitted (Priya), Sign Up Completed (Marcus), Sign Up Completed (Dana)',
    same(events.map((event) => [event.name, event.user.userID]), [
      ['Demo Request Submitted', 'persona_priya_nair'],
      ['Sign Up Completed', 'persona_marcus_lee'],
      ['Sign Up Completed', 'persona_dana_wu'],
    ]),
  );
  record('the invalid sign-up and the browse-only journey log nothing to Statsig', same(counts, [1, 1, 0, 1]), counts.join(','));
  record(
    'Statsig event names and metadata equal the contract actions the bot runner produces',
    same(events.map((event) => ({ name: event.name, metadata: event.metadata })), expected.map((action) => ({ name: action.name, metadata: independentMetadata(action.properties) }))),
  );
  record('every Statsig event carries the contract event_id', events.every((event, index) => event.metadata.event_id === expected[index].properties.event_id && event.metadata.event_id.startsWith('evt_')));
  record('every metadata value is a string and booleans are the strings true and false', events.every((event) => Object.values(event.metadata).every((value) => typeof value === 'string')) && events.every((event) => event.metadata.is_synthetic === 'true' && event.metadata.is_simulated === 'true'));
  record('every required property is kept, including submission_id, user_id, plan_id and traffic_source', events.every((event, index) => Object.keys(expected[index].properties).every((key) => key in event.metadata)));
  record('the only Statsig event names are the two contract actions', events.every((event) => ['Demo Request Submitted', 'Sign Up Completed'].includes(event.name)));
  const eventIds = events.map((event) => event.metadata.event_id);
  record('no event_id repeats in Statsig', new Set(eventIds).size === eventIds.length);

  record(
    'the Amplitude sink still receives the same three events with the same event_id and insert_id',
    tracks.length - amplitudeBefore === 3 &&
      same(tracks.map((call) => [call.args[0], call.args[1].event_id, call.args[2]?.insertId]), events.map((event) => [event.name, event.metadata.event_id, event.metadata.event_id])),
  );
  record('Amplitude event properties are unchanged contract properties', same(tracks.map((call) => ({ name: call.args[0], properties: call.args[1] })), expected));
  record(
    'no exposure or Statsig event reaches Amplitude',
    amplitude.names().every((name) => ['init', 'setUserId', 'setUserProperties', 'setGroup', 'track', 'flush'].includes(name)) &&
      tracks.every((call) => !/expos|statsig/i.test(call.args[0])),
  );
  record('exposures stay inside the Statsig client: the two pricing-page evaluations were made before the journeys and none after', exposuresBefore === 2 && fake.exposures.length === exposuresBefore);
  record('Statsig events and exposures are separate: no logged event is an exposure', events.every((event) => !/exposure|statsig::/i.test(event.name)));

  const replay = registry.emit(expected[0]);
  record('re-emitting an action logs nothing more to either service', replay.status === 'duplicate' && fake.events.length === 3 && amplitude.tracks().length - amplitudeBefore === 3);

  const demoFlow = { ...makeFlow({ registry }), ids };
  const bareAction = submitDemoRequest(demoFlow, { ...VALID, planId: '', email: 'someone@unmapped-company.example', name: 'Test Person' });
  record(
    'an action with no mapped account is logged without account_id',
    bareAction.ok && fake.events.length === 4 && !('account_id' in fake.events[3].metadata) && !('account_id' in fake.events[3].user.custom) && String(fake.events[3].user.custom.is_synthetic) === fake.events[3].metadata.is_synthetic,
  );
  stop(statsig);
}

async function checkIdentity() {
  const surfaces = [];
  const registry = createActionRegistry();
  const flow = makeFlow({ registry });
  const fake = createFakeExperiments();
  const scenario = await startExperiments({ fake, registry, flow });
  const visitorId = readIdentity(flow).visitorId;
  const updates = () => fake.calls.filter((call) => call.name === 'updateUser');

  record('at startup there is no user update, only the initial user', updates().length === 0 && fake.calls[0].args[1].userID === visitorId);

  const priya = PERSONAS[0];
  activatePersona(flow, priya.id);
  getAnalytics().syncIdentity();
  record(
    'after a persona swap the Statsig user ID is the persona ID with is_synthetic true and the mapped account_id',
    same(updates().at(-1)?.args[0], { userID: priya.id, custom: { is_synthetic: true, account_id: 'acct_northwind_labs' } }),
  );

  const before = updates().length;
  const signUp = submitSignUp(flow, { ...VALID, name: priya.name, email: priya.email });
  record(
    'an action by the active persona is logged under that user with no extra user update',
    signUp.ok && fake.events.at(-1)?.user.userID === priya.id && updates().length === before && fake.events.at(-1)?.metadata.user_id === priya.id,
  );

  resetSampleVisitor(flow);
  getAnalytics().syncIdentity();
  record(
    'after reset the Statsig user ID is the original visitor ID with is_synthetic false and no account_id',
    same(updates().at(-1)?.args[0], { userID: visitorId, custom: { is_synthetic: false } }) && readIdentity(flow).visitorId === visitorId,
  );
  const repeat = updates().length;
  getAnalytics().syncIdentity();
  record('syncing an unchanged identity makes no further user update', updates().length === repeat);

  const dana = PERSONAS[3];
  activatePersona(flow, dana.id);
  getAnalytics().syncIdentity();
  const danaSignUp = submitSignUp(flow, { ...VALID, name: dana.name, email: dana.email });
  record(
    'for Dana (unmapped) there is no account_id on the user or the event',
    danaSignUp.ok &&
      same(updates().at(-1)?.args[0], { userID: dana.id, custom: { is_synthetic: true } }) &&
      !('account_id' in fake.events.at(-1).metadata) &&
      fake.events.at(-1).user.userID === dana.id,
  );
  record(
    'every user has only userID and custom, with a boolean is_synthetic, and account_id only as a fixture account ID',
    [fake.calls[0].args[1], ...updates().map((call) => call.args[0])].every(
      (user) =>
        same(Object.keys(user).sort(), ['custom', 'userID']) &&
        typeof user.custom.is_synthetic === 'boolean' &&
        (user.custom.account_id === undefined || /^acct_[a-z_]+$/.test(user.custom.account_id)),
    ),
  );
  record('identity sync never resets, shuts down or opts out the client', !fake.names().some((name) => /reset|shutdown|optout|disable/i.test(name)));
  surfaces.push(['Statsig calls from the identity scenario', fake.calls]);
  stop(scenario);

  const pendingFake = createFakeExperiments({ init: 'manual' });
  const pendingRegistry = createActionRegistry();
  const pendingFlow = makeFlow({ registry: pendingRegistry });
  const controller = createExperimentsController({ apiKey: FAKE_KEY, createSdk: () => pendingFake.sdk, registry: pendingRegistry, flow: pendingFlow });
  const started = controller.start();
  activatePersona(pendingFlow, priya.id);
  getAnalytics().syncIdentity();
  const early = submitSignUp(pendingFlow, { ...VALID, name: priya.name, email: priya.email });
  record('before the client is ready, an identity change and an action make no SDK call yet', early.ok && early.emit.status === 'emitted' && pendingFake.names().join() === 'init');
  pendingFake.release();
  await started;
  record(
    'once ready they are replayed in order: the user update, then the event under that user',
    same(pendingFake.names(), ['init', 'updateUser', 'logEvent']) && pendingFake.events[0]?.user.userID === priya.id,
  );
  surfaces.push(['Statsig calls from the pending scenario', pendingFake.calls]);
  stop({ controller });

  const everyName = PERSONAS.flatMap((persona) => [persona.name, persona.email, persona.company, ...ACCOUNTS.map((account) => account.name)]).filter(Boolean);
  const offenders = [];
  for (const [label, value] of surfaces) {
    for (const text of strings(value)) {
      if (text.includes('@')) offenders.push(`${label}: @ in a value`);
      for (const name of everyName) if (text.toLowerCase().includes(name.toLowerCase())) offenders.push(`${label}: ${name}`);
    }
  }
  record('no argument to the Statsig client contains @, an email, a person name or a company name', offenders.length === 0, [...new Set(offenders)].join('; '));
}

async function timedNavigation() {
  const started = Date.now();
  let navigated = 0;
  await new Promise((done) => {
    getAnalytics().navigateAfterFlush(() => {
      navigated += 1;
      done();
    });
  });
  await new Promise((done) => setTimeout(done, 60));
  return { navigated, elapsed: Date.now() - started };
}

async function checkDelivery() {
  const both = async (statsigOptions, amplitudeOptions, { statsigInit } = {}) => {
    const registry = createActionRegistry();
    const flow = makeFlow({ registry });
    const amplitude = createFakeAmplitude(amplitudeOptions);
    const amplitudeController = createAnalyticsController({ apiKey: AMPLITUDE_KEY, createSdk: () => amplitude.sdk, registry, flow });
    await amplitudeController.start();
    const fake = createFakeExperiments({ ...statsigOptions, ...(statsigInit ? { init: statsigInit } : {}) });
    const controller = createExperimentsController({ apiKey: FAKE_KEY, createSdk: () => fake.sdk, registry, flow });
    const starting = controller.start();
    if (!statsigInit) await starting;
    return { amplitude, fake, controller, registry, flow };
  };

  let scenario = await both({}, {});
  let result = await timedNavigation();
  record(
    'with both services ready, one navigation happens quickly after both flushes',
    result.navigated === 1 && result.elapsed < 500 && scenario.fake.names().filter((name) => name === 'flush').length === 1 && scenario.amplitude.names().filter((name) => name === 'flush').length === 1,
    `${result.elapsed} ms`,
  );
  stop(scenario);

  scenario = await both({ flush: 'never' }, {});
  result = await timedNavigation();
  record(
    'a Statsig flush that never finishes is cut off at the 1000 ms limit, with one navigation',
    result.navigated === 1 && result.elapsed >= MAX_FLUSH_WAIT_MS - 100 && result.elapsed < MAX_FLUSH_WAIT_MS + 600,
    `${result.elapsed} ms`,
  );
  stop(scenario);

  scenario = await both({}, { flush: 'never' }, { statsigInit: 'manual' });
  result = await timedNavigation();
  record(
    'two services that are both slow share one 1000 ms wait, not two, with one navigation',
    result.navigated === 1 && result.elapsed >= MAX_FLUSH_WAIT_MS - 100 && result.elapsed < MAX_FLUSH_WAIT_MS + 600,
    `${result.elapsed} ms`,
  );
  scenario.fake.release();
  stop(scenario);

  for (const mode of ['reject', 'throw']) {
    scenario = await both({ flush: mode }, {});
    result = await timedNavigation();
    record(`a Statsig flush that ${mode}s still navigates once, without waiting for the limit`, result.navigated === 1 && result.elapsed < 500, `${result.elapsed} ms`);
    stop(scenario);
  }

  const amplitudeOnlyRegistry = createActionRegistry();
  const amplitudeOnly = createFakeAmplitude();
  await createAnalyticsController({ apiKey: AMPLITUDE_KEY, createSdk: () => amplitudeOnly.sdk, registry: amplitudeOnlyRegistry, flow: makeFlow({ registry: amplitudeOnlyRegistry }) }).start();
  const noStatsig = await startExperiments({ apiKey: '', fake: createFakeExperiments() });
  result = await timedNavigation();
  record(
    'with no Statsig client the behavior is the current one: Amplitude flush, then one navigation',
    noStatsig.status === 'disabled' && result.navigated === 1 && amplitudeOnly.names().filter((name) => name === 'flush').length === 1 && result.elapsed < 500,
  );
  stop(noStatsig);

  const statsigOnly = await startExperiments({ fake: createFakeExperiments() });
  result = await timedNavigation();
  record('with only Statsig on, its flush is awaited and one navigation follows', statsigOnly.status === 'started' && result.navigated === 1 && statsigOnly.fake.names().includes('flush') && result.elapsed < 500);
  stop(statsigOnly);

  result = await timedNavigation();
  record('with neither service on, navigation is immediate', result.navigated === 1 && result.elapsed < 200);
}

async function checkNetworkSilence() {
  installNetworkStubs();
  try {
    const pricing = await loadPricingPage();
    const page = makePricingPage(pricing);
    const product = makeProductPage();
    const flow = makeFlow();
    let created = 0;
    const controller = createExperimentsController({
      apiKey: undefined,
      createSdk: () => {
        created += 1;
        throw new Error('The client must not be created without a key.');
      },
      registry: flow.registry,
      flow,
      page: page.root,
    });
    const status = await controller.start();
    controller.applyPage();
    const productController = createExperimentsController({ apiKey: '', createSdk: () => { created += 1; throw new Error('no'); }, registry: flow.registry, flow, page: product.root });
    await productController.start();
    productController.applyPage();
    activatePersona(flow, PERSONAS[0].id);
    getAnalytics().syncIdentity();
    submitSignUp(flow, { ...VALID, email: PERSONAS[0].email, name: PERSONAS[0].name });
    submitDemoRequest(flow, { ...VALID, planId: '', email: NEW_CONTACT });
    resetSampleVisitor(flow);
    getAnalytics().navigateAfterFlush(() => {});
    const lines = runBotJourneys();
    record('without a key the controller is disabled and creates no client', status === 'disabled' && created === 0);
    record(
      'without a key, the page, handlers and bot runner call no stubbed network API',
      networkCalls.length === 0 && lines.length === 16 && same(pricingSnapshot(page).labels, CONTROL_LABELS) && product.section.hidden === true,
      `${networkCalls.length} calls`,
    );

    let loaded = false;
    try {
      const adapter = await import('../src/statsig/statsig-adapter.ts');
      adapter.createStatsigSdk();
      loaded = true;
    } catch (error) {
      console.log(`adapter load note: ${error instanceof Error ? error.message : String(error)}`);
    }
    record('loading the real adapter and creating its wrapper makes no network call and starts no client', loaded && networkCalls.length === 0, `${networkCalls.length} calls`);

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

const KEY_LIKE = [/api[_-]?key['"]?\s*[:=]\s*['"][A-Za-z0-9]{16,}['"]/i, /\b[a-f0-9]{32}\b/, /\bclient-[A-Za-z0-9]{20,}\b/, /\bsecret-[A-Za-z0-9]{16,}\b/, /\bconsole-[A-Za-z0-9]{16,}\b/];

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
    if (KEY_LIKE.some((pattern) => pattern.test(text))) offenders.push(relative(ROOT, file));
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
  const texts = [];
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    texts.push(text);
    if (KEY_LIKE.slice(0, 1).concat(KEY_LIKE.slice(2)).some((pattern) => pattern.test(text))) keyLike.push(relative(ROOT, file));
  }
  record('dist/ built without a key has no key-like literal', keyLike.length === 0, keyLike.join('; '));
  const joined = texts.join('\n');
  record('dist/ holds no key environment variable name or fake key', !joined.includes('VITE_STATSIG_CLIENT_KEY') && !joined.includes(FAKE_KEY));
  record(
    'dist/ contains the three entity names and the specific labels',
    ['pricing_cta_copy', 'label_mode', 'metrics_account_breakdown', 'pricing_notice', 'Talk to sales', 'Start a free trial', BREAKDOWN_SENTENCE].every((text) => joined.includes(text)),
  );
  const scripts = texts.filter((text, index) => files[index].endsWith('.js'));
  record('built scripts contain no Statsig package other than @statsig/js-client', scripts.every((text) => !/@statsig\/(?!js-client\b)|statsig-js/i.test(text)));

  const pricing = await loadPricingPage();
  record(
    'the built pricing page still has the control labels, hrefs and fallback notice',
    same(pricing.links, [
      { href: '/AmpliGen/sign-up/', label: 'Start a trial' },
      { href: '/AmpliGen/sign-up/', label: 'Start a trial' },
      { href: '/AmpliGen/demo-request/', label: 'Request a demo' },
    ]) && pricing.notice === FALLBACK_NOTICE,
  );

  const server = await startServer();
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    for (const route of ROUTE_LIST) {
      const response = await realFetch(`${origin}${route}`);
      await response.text();
      record(`built route ${route} returns HTTP 200 under /AmpliGen/`, response.status === 200, `status ${response.status}`);
    }
  } finally {
    await new Promise((done) => server.close(done));
  }
}

async function main() {
  await checkDependencies();
  await checkInitGuard();
  await checkLabels();
  await checkGate();
  await checkNotice();
  await checkExposureOnce();
  await checkEvents();
  await checkIdentity();
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
