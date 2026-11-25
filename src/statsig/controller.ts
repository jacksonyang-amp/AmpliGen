import { addAnalyticsPart } from '../analytics/handle.ts';
import type { ContractAction } from '../contract/actions.ts';
import type { ActionRegistry } from '../contract/registry.ts';
import type { FlowContext } from '../flow/handlers.ts';
import { readIdentity } from '../flow/handlers.ts';
import { currentUserId } from '../identity/identity.ts';
import type { IdentityState } from '../identity/identity.ts';
import {
  ENVIRONMENT_TIER,
  EXPERIMENT_NAME,
  GATE_NAME,
  INIT_TIMEOUT_MS,
  NOTICE_CONFIG_NAME,
} from './config.ts';
import { metadataFor } from './events.ts';
import {
  applyAccountBreakdown,
  applyNotice,
  applyPlanLabels,
  hasAccountBreakdown,
  hasPricingNotice,
  hasPricingPlans,
  labelModeFrom,
  noticeFrom,
} from './pages.ts';
import type { PageRoot } from './pages.ts';
import type { ExperimentUser, ExperimentsSdk } from './sdk.ts';
import { createStatsigSink } from './sink.ts';
import { experimentUserFor, userKey } from './user.ts';

export type ExperimentsStatus = 'disabled' | 'started' | 'failed';

export interface ExperimentsControllerDeps {
  apiKey: unknown;
  createSdk: () => ExperimentsSdk;
  registry: ActionRegistry;
  flow: FlowContext;
  page?: PageRoot;
}

export interface ExperimentsController {
  start(): Promise<ExperimentsStatus>;
  applyPage(): void;
  stop(): void;
}

export function hasKey(apiKey: unknown): apiKey is string {
  return typeof apiKey === 'string' && apiKey.trim() !== '';
}

function userFromIdentity(state: IdentityState): ExperimentUser {
  const synthetic = state.personaId !== undefined || state.accountId !== undefined;
  return experimentUserFor(currentUserId(state), synthetic, state.accountId);
}

export function createExperimentsController(deps: ExperimentsControllerDeps): ExperimentsController {
  let started: Promise<ExperimentsStatus> | undefined;
  let sdk: ExperimentsSdk | undefined;
  let ready = false;
  let detach: (() => void) | undefined;
  const evaluated = new Map<string, unknown>();

  // Each entity is evaluated once per page load. The client logs one exposure per
  // evaluation, so a second page pass must not call it again.
  function evaluateOnce<T>(name: string, evaluate: (client: ExperimentsSdk) => T, fallback: T): T {
    if (evaluated.has(name)) return evaluated.get(name) as T;
    let result = fallback;
    try {
      if (sdk !== undefined) result = evaluate(sdk);
    } catch {
      result = fallback;
    }
    evaluated.set(name, result);
    return result;
  }

  function applyPage(): void {
    const { page } = deps;
    if (!ready || page === undefined) return;

    if (hasPricingPlans(page)) {
      const value = evaluateOnce<Record<string, unknown> | undefined>(EXPERIMENT_NAME, (client) => client.getExperimentValue(EXPERIMENT_NAME), undefined);
      applyPlanLabels(page, labelModeFrom(value));
    }
    if (hasPricingNotice(page)) {
      const value = evaluateOnce<Record<string, unknown> | undefined>(NOTICE_CONFIG_NAME, (client) => client.getConfigValue(NOTICE_CONFIG_NAME), undefined);
      applyNotice(page, noticeFrom(value));
    }
    if (hasAccountBreakdown(page)) {
      const passed = evaluateOnce<boolean>(GATE_NAME, (client) => client.checkGate(GATE_NAME) === true, false);
      applyAccountBreakdown(page, passed);
    }
  }

  function begin(): Promise<ExperimentsStatus> {
    const { apiKey } = deps;
    if (!hasKey(apiKey)) return Promise.resolve('disabled');

    const initialUser = userFromIdentity(readIdentity(deps.flow));
    let client: ExperimentsSdk;
    let initialized: Promise<void>;
    try {
      client = deps.createSdk();
      initialized = Promise.resolve(client.init(apiKey.trim(), initialUser, { environmentTier: ENVIRONMENT_TIER, timeoutMs: INIT_TIMEOUT_MS }));
    } catch {
      return Promise.resolve('failed');
    }
    sdk = client;

    let appliedUser = userKey(initialUser);
    let queue: Array<() => void> = [];

    function setUser(user: ExperimentUser): void {
      const key = userKey(user);
      if (key === appliedUser) return;
      client.updateUser(user);
      appliedUser = key;
    }

    // Identity changes and events made before the client is ready are replayed in
    // order afterwards, so each event is logged under the user it belongs to.
    function run(task: () => void): void {
      const guarded = () => {
        try {
          task();
        } catch {
          // Analytics must never break the page.
        }
      };
      if (ready) guarded();
      else queue.push(guarded);
    }

    function logAction(action: ContractAction): void {
      const { properties } = action;
      const user = experimentUserFor(properties.user_id, properties.is_synthetic, properties.account_id);
      run(() => {
        setUser(user);
        client.logEvent(action.name, metadataFor(properties));
      });
    }

    const removeSink = deps.registry.addSink(createStatsigSink(logAction));

    const settled: Promise<ExperimentsStatus> = initialized.then(
      () => {
        ready = true;
        const pending = queue;
        queue = [];
        for (const task of pending) task();
        return 'started' as const;
      },
      () => {
        queue = [];
        removeSink();
        removePart();
        sdk = undefined;
        return 'failed' as const;
      },
    );

    const removePart = addAnalyticsPart({
      syncIdentity() {
        const user = userFromIdentity(readIdentity(deps.flow));
        run(() => setUser(user));
      },
      flush() {
        return settled.then((status) => (status === 'started' ? client.flush() : undefined));
      },
    });

    detach = () => {
      removeSink();
      removePart();
    };

    return settled.then((status) => {
      if (status === 'started') applyPage();
      return status;
    });
  }

  return {
    start() {
      started ??= begin();
      return started;
    },
    applyPage,
    stop() {
      detach?.();
      detach = undefined;
    },
  };
}
