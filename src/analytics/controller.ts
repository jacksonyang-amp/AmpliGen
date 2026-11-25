import type { ActionRegistry } from '../contract/registry.ts';
import type { FlowContext } from '../flow/handlers.ts';
import { readIdentity } from '../flow/handlers.ts';
import { currentUserId } from '../identity/identity.ts';
import { ACCOUNT_GROUP_TYPE, buildInitOptions } from './config.ts';
import { setAnalytics } from './handle.ts';
import type { AnalyticsHandle } from './handle.ts';
import { flushThenNavigate } from './navigation.ts';
import type { AnalyticsSdk } from './sdk.ts';
import { createAmplitudeSink, userPropertiesFor } from './sink.ts';

export type AnalyticsStatus = 'disabled' | 'started' | 'failed';

export interface AnalyticsControllerDeps {
  apiKey: unknown;
  createSdk: () => AnalyticsSdk;
  registry: ActionRegistry;
  flow: FlowContext;
}

export interface AnalyticsController {
  start(): Promise<AnalyticsStatus>;
}

export function hasKey(apiKey: unknown): apiKey is string {
  return typeof apiKey === 'string' && apiKey.trim() !== '';
}

export function createAnalyticsController(deps: AnalyticsControllerDeps): AnalyticsController {
  let started: Promise<AnalyticsStatus> | undefined;

  function begin(): Promise<AnalyticsStatus> {
    const { apiKey } = deps;
    if (!hasKey(apiKey)) return Promise.resolve('disabled');

    let sdk: AnalyticsSdk;
    let initialized: Promise<void>;
    try {
      sdk = deps.createSdk();
      initialized = Promise.resolve(sdk.init(apiKey.trim(), buildInitOptions()));
    } catch {
      return Promise.resolve('failed');
    }

    // The SDK queues setUserId, track and flush calls until setup finishes, and a
    // form can be submitted before that happens. So the sink is attached as soon
    // as init has been called, and removed again if setup rejects.
    const removeSink = deps.registry.addSink(createAmplitudeSink(sdk));
    const handle: AnalyticsHandle = {
      syncIdentity() {
        try {
          const state = readIdentity(deps.flow);
          const synthetic = state.personaId !== undefined || state.accountId !== undefined;
          sdk.setUserId(currentUserId(state));
          sdk.setUserProperties(userPropertiesFor(synthetic, state.accountId));
          if (state.accountId !== undefined) sdk.setGroup(ACCOUNT_GROUP_TYPE, state.accountId);
        } catch {
          // Analytics must never break the page.
        }
      },
      navigateAfterFlush(navigate) {
        flushThenNavigate({ flush: () => sdk.flush(), navigate });
      },
    };
    setAnalytics(handle);
    handle.syncIdentity();

    return initialized.then(
      () => 'started' as const,
      () => {
        removeSink();
        setAnalytics(undefined);
        return 'failed' as const;
      },
    );
  }

  return {
    start() {
      started ??= begin();
      return started;
    },
  };
}
