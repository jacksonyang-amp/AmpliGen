import { Identify, flush, identify, initAll, setGroup, setUserId, track } from '@amplitude/unified';
import type { UnifiedOptions } from '@amplitude/unified';
import type { AnalyticsSdk } from './sdk.ts';

function ignoreRejection(result: { promise: Promise<unknown> }): void {
  result.promise.catch(() => undefined);
}

export function createAmplitudeSdk(): AnalyticsSdk {
  return {
    init: (apiKey, options) => initAll(apiKey, options as UnifiedOptions),
    setUserId: (userId) => {
      setUserId(userId);
    },
    setUserProperties: (properties) => {
      const operation = new Identify();
      for (const [key, value] of Object.entries(properties)) operation.set(key, value);
      ignoreRejection(identify(operation));
    },
    setGroup: (groupType, groupName) => {
      ignoreRejection(setGroup(groupType, groupName));
    },
    track: (eventName, properties, options) => {
      ignoreRejection(track(eventName, properties, { insert_id: options.insertId }));
    },
    flush: () => flush().promise.then(() => undefined),
  };
}
