import {
  ACCOUNT_MAPPING_STATUSES,
  ENTRY_POINTS,
  IDENTITY_METHODS,
  PLAN_IDS,
  PRODUCT_IDS,
  SIGN_UP_PLAN_IDS,
  TRAFFIC_SOURCES,
  isOneOf,
} from './catalog.ts';
import type {
  AccountMappingStatus,
  EntryPoint,
  IdentityMethod,
  PlanId,
  ProductId,
  SignUpPlanId,
  TrafficSource,
} from './catalog.ts';

export const ACTION_NAMES = {
  demoRequestSubmitted: 'Demo Request Submitted',
  signUpCompleted: 'Sign Up Completed',
} as const;

interface CommonProperties {
  event_id: string;
  user_id: string;
  account_id?: string;
  is_synthetic: boolean;
  traffic_source: TrafficSource;
  product_id: ProductId;
  entry_point: EntryPoint;
  is_simulated: true;
}

export interface DemoRequestSubmittedAction {
  name: typeof ACTION_NAMES.demoRequestSubmitted;
  properties: CommonProperties & { plan_id?: PlanId; submission_id: string };
}

export interface SignUpCompletedAction {
  name: typeof ACTION_NAMES.signUpCompleted;
  properties: CommonProperties & {
    plan_id: SignUpPlanId;
    identity_method: IdentityMethod;
    account_mapping_status: AccountMappingStatus;
  };
}

export type ContractAction = DemoRequestSubmittedAction | SignUpCompletedAction;

interface CommonInput {
  eventId: string;
  userId: string;
  accountId?: string;
  isSynthetic: boolean;
  trafficSource: TrafficSource;
  productId: ProductId;
  entryPoint: EntryPoint;
}

export function buildDemoRequestSubmitted(
  input: CommonInput & { planId?: PlanId; submissionId: string },
): DemoRequestSubmittedAction {
  return {
    name: ACTION_NAMES.demoRequestSubmitted,
    properties: {
      event_id: input.eventId,
      user_id: input.userId,
      ...(input.accountId === undefined ? {} : { account_id: input.accountId }),
      is_synthetic: input.isSynthetic,
      traffic_source: input.trafficSource,
      product_id: input.productId,
      ...(input.planId === undefined ? {} : { plan_id: input.planId }),
      entry_point: input.entryPoint,
      is_simulated: true,
      submission_id: input.submissionId,
    },
  };
}

export function buildSignUpCompleted(
  input: CommonInput & {
    planId: SignUpPlanId;
    identityMethod: IdentityMethod;
    accountMappingStatus: AccountMappingStatus;
  },
): SignUpCompletedAction {
  return {
    name: ACTION_NAMES.signUpCompleted,
    properties: {
      event_id: input.eventId,
      user_id: input.userId,
      ...(input.accountId === undefined ? {} : { account_id: input.accountId }),
      is_synthetic: input.isSynthetic,
      traffic_source: input.trafficSource,
      product_id: input.productId,
      plan_id: input.planId,
      entry_point: input.entryPoint,
      is_simulated: true,
      identity_method: input.identityMethod,
      account_mapping_status: input.accountMappingStatus,
    },
  };
}

const ACTION_SHAPES: Record<string, { required: readonly string[]; optional: readonly string[] }> = {
  [ACTION_NAMES.demoRequestSubmitted]: {
    required: ['event_id', 'user_id', 'is_synthetic', 'traffic_source', 'product_id', 'entry_point', 'is_simulated', 'submission_id'],
    optional: ['account_id', 'plan_id'],
  },
  [ACTION_NAMES.signUpCompleted]: {
    required: [
      'event_id',
      'user_id',
      'is_synthetic',
      'traffic_source',
      'product_id',
      'plan_id',
      'entry_point',
      'is_simulated',
      'identity_method',
      'account_mapping_status',
    ],
    optional: ['account_id'],
  },
};

export function checkActionContract(action: unknown): string[] {
  const violations: string[] = [];
  if (typeof action !== 'object' || action === null) return ['action is not an object'];

  const { name, properties } = action as { name?: unknown; properties?: unknown };
  if (typeof name !== 'string' || !(name in ACTION_SHAPES)) return ['unknown action name'];
  if (typeof properties !== 'object' || properties === null) return ['properties is not an object'];

  const shape = ACTION_SHAPES[name];
  const props = properties as Record<string, unknown>;
  for (const key of shape.required) {
    if (!(key in props)) violations.push(`missing required property ${key}`);
  }
  for (const key of Object.keys(props)) {
    if (!shape.required.includes(key) && !shape.optional.includes(key)) violations.push(`unexpected property ${key}`);
    const value = props[key];
    if (typeof value === 'string' && value.includes('@')) violations.push(`property ${key} contains an email-like value`);
    if (typeof value !== 'string' && typeof value !== 'boolean') violations.push(`property ${key} has an unsupported type`);
  }

  for (const key of ['event_id', 'user_id', 'submission_id'] as const) {
    if (key in props && (typeof props[key] !== 'string' || props[key] === '')) violations.push(`${key} must be a non-empty string`);
  }
  if ('account_id' in props && (typeof props.account_id !== 'string' || props.account_id === '')) {
    violations.push('account_id must be a non-empty string when present');
  }
  if (typeof props.is_synthetic !== 'boolean') violations.push('is_synthetic must be a boolean');
  if (props.is_simulated !== true) violations.push('is_simulated must be true');
  if (!isOneOf(TRAFFIC_SOURCES, props.traffic_source)) violations.push('traffic_source is not an allowed value');
  if (!isOneOf(PRODUCT_IDS, props.product_id)) violations.push('product_id is not an allowed value');
  if (!isOneOf(ENTRY_POINTS, props.entry_point)) violations.push('entry_point is not an allowed value');

  if (name === ACTION_NAMES.demoRequestSubmitted) {
    if ('plan_id' in props && !isOneOf(PLAN_IDS, props.plan_id)) violations.push('plan_id is not an allowed value');
  } else {
    if (!isOneOf(SIGN_UP_PLAN_IDS, props.plan_id)) violations.push('plan_id is not an allowed sign-up value');
    if (!isOneOf(IDENTITY_METHODS, props.identity_method)) violations.push('identity_method is not an allowed value');
    if (!isOneOf(ACCOUNT_MAPPING_STATUSES, props.account_mapping_status)) {
      violations.push('account_mapping_status is not an allowed value');
    }
    if (props.account_mapping_status === 'unmapped' && 'account_id' in props) {
      violations.push('account_id must be omitted when unmapped');
    }
  }

  return violations;
}
