import { actionRegistry } from '../contract/registry.ts';
import { getBrowserContext } from '../ui/runtime.ts';
import { createExperimentsController } from './controller.ts';
import { createStatsigSdk } from './statsig-adapter.ts';

const controller = createExperimentsController({
  apiKey: import.meta.env.VITE_STATSIG_CLIENT_KEY,
  createSdk: createStatsigSdk,
  registry: actionRegistry,
  flow: getBrowserContext(),
  page: { querySelector: (selector) => document.querySelector<HTMLElement>(selector) },
});

export function startExperiments(): void {
  void controller.start().catch(() => undefined);
}
