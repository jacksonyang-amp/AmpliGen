export const EXPERIMENT_NAME = 'pricing_cta_copy';
export const LABEL_MODE_PARAMETER = 'label_mode';
export const LABEL_MODE_CONTROL = 'control';
export const LABEL_MODE_SPECIFIC = 'specific';

export const GATE_NAME = 'metrics_account_breakdown';

export const NOTICE_CONFIG_NAME = 'pricing_notice';
export const NOTICE_PARAMETER = 'notice';
export const NOTICE_MAX_LENGTH = 120;

export const ENVIRONMENT_TIER = 'production';
export const INIT_TIMEOUT_MS = 3000;

export const SINK_NAME = 'statsig';

export const ACCOUNT_BREAKDOWN_TEXT = 'Account breakdown shows usage and conversion for the mapped account.';

export const PRICING_NOTICE_SELECTOR = '[data-pricing-label]';
export const ACCOUNT_BREAKDOWN_SELECTOR = '[data-metrics-account-breakdown]';

export const PLAN_CTA_SELECTORS = {
  Starter: '[data-plan="Starter"] .card-action a',
  Growth: '[data-plan="Growth"] .card-action a',
  Enterprise: '[data-plan="Enterprise"] .card-action a',
} as const;

export type PlanName = keyof typeof PLAN_CTA_SELECTORS;

export const SPECIFIC_CTA_LABELS: Record<PlanName, string> = {
  Starter: 'Start a free trial',
  Growth: 'Start a free trial',
  Enterprise: 'Talk to sales',
};
