import { actionRegistry } from '../contract/registry.ts';
import { getBrowserContext } from '../ui/runtime.ts';
import { createAmplitudeSdk } from './amplitude-adapter.ts';
import { createAnalyticsController } from './controller.ts';

const controller = createAnalyticsController({
  apiKey: import.meta.env.VITE_AMPLITUDE_API_KEY,
  createSdk: createAmplitudeSdk,
  registry: actionRegistry,
  flow: getBrowserContext(),
});

export function startAnalytics(): void {
  void controller.start().catch(() => undefined);
}
