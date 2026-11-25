import type { ContractAction } from '../contract/actions.ts';
import type { ActionSink } from '../contract/registry.ts';
import { ACCOUNT_GROUP_TYPE } from './config.ts';
import type { AnalyticsSdk, PropertyValue } from './sdk.ts';

export const SINK_NAME = 'amplitude';

export function userPropertiesFor(isSynthetic: boolean, accountId: string | undefined): Record<string, PropertyValue> {
  return accountId === undefined ? { is_synthetic: isSynthetic } : { is_synthetic: isSynthetic, account_id: accountId };
}

export function createAmplitudeSink(sdk: AnalyticsSdk): ActionSink {
  return {
    name: SINK_NAME,
    send(action: ContractAction) {
      const { properties } = action;
      sdk.setUserId(properties.user_id);
      sdk.setUserProperties(userPropertiesFor(properties.is_synthetic, properties.account_id));
      if (properties.account_id !== undefined) sdk.setGroup(ACCOUNT_GROUP_TYPE, properties.account_id);
      sdk.track(action.name, { ...properties }, { insertId: properties.event_id });
    },
  };
}
