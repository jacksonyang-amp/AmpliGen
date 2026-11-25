import { StatsigClient } from '@statsig/js-client';
import type { ExperimentUser, ExperimentsSdk } from './sdk.ts';

export function createStatsigSdk(): ExperimentsSdk {
  let client: StatsigClient | undefined;

  function active(): StatsigClient {
    if (client === undefined) throw new Error('The experiments client is not initialized.');
    return client;
  }

  return {
    async init(apiKey, user: ExperimentUser, options) {
      client = new StatsigClient(apiKey, user, { environment: { tier: options.environmentTier } });
      await client.initializeAsync({ timeoutMs: options.timeoutMs });
    },
    updateUser(user) {
      active().updateUserSync(user);
    },
    getExperimentValue(name) {
      return active().getExperiment(name).value;
    },
    checkGate(name) {
      return active().checkGate(name);
    },
    getConfigValue(name) {
      return active().getDynamicConfig(name).value;
    },
    logEvent(eventName, metadata) {
      active().logEvent(eventName, undefined, metadata);
    },
    flush() {
      return active().flush();
    },
  };
}
