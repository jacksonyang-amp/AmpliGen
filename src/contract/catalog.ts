export const PRODUCT_IDS = ['ampligen_gateway', 'ampligen_metrics', 'ampligen_connect'] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];

export const PLAN_IDS = ['starter', 'growth', 'enterprise'] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const SIGN_UP_PLAN_IDS = ['starter', 'growth'] as const;
export type SignUpPlanId = (typeof SIGN_UP_PLAN_IDS)[number];

export const TRAFFIC_SOURCES = ['manual_demo', 'bot', 'visitor'] as const;
export type TrafficSource = (typeof TRAFFIC_SOURCES)[number];

export const ENTRY_POINTS = ['product', 'pricing', 'navigation', 'direct'] as const;
export type EntryPoint = (typeof ENTRY_POINTS)[number];

export const IDENTITY_METHODS = ['predefined_persona', 'company_email'] as const;
export type IdentityMethod = (typeof IDENTITY_METHODS)[number];

export const ACCOUNT_MAPPING_STATUSES = ['mapped', 'unmapped'] as const;
export type AccountMappingStatus = (typeof ACCOUNT_MAPPING_STATUSES)[number];

export function isOneOf<T extends readonly string[]>(list: T, value: unknown): value is T[number] {
  return typeof value === 'string' && (list as readonly string[]).includes(value);
}
