import type { ContractAction } from '../contract/actions.ts';
import type { ActionSink } from '../contract/registry.ts';
import { SINK_NAME } from './config.ts';

export { SINK_NAME };

export function createStatsigSink(deliver: (action: ContractAction) => void): ActionSink {
  return { name: SINK_NAME, send: deliver };
}
