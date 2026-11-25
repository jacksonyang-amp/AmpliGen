import {
  ACCOUNT_BREAKDOWN_SELECTOR,
  ACCOUNT_BREAKDOWN_TEXT,
  LABEL_MODE_PARAMETER,
  LABEL_MODE_SPECIFIC,
  NOTICE_MAX_LENGTH,
  NOTICE_PARAMETER,
  PLAN_CTA_SELECTORS,
  PRICING_NOTICE_SELECTOR,
  SPECIFIC_CTA_LABELS,
} from './config.ts';
import type { PlanName } from './config.ts';

export interface PageElement {
  textContent: string | null;
  hidden: boolean;
}

export interface PageRoot {
  querySelector(selector: string): PageElement | null;
}

export type LabelMode = 'control' | 'specific';

export function labelModeFrom(value: Record<string, unknown> | undefined): LabelMode {
  return value?.[LABEL_MODE_PARAMETER] === LABEL_MODE_SPECIFIC ? 'specific' : 'control';
}

export function noticeFrom(value: Record<string, unknown> | undefined): string | undefined {
  const notice = value?.[NOTICE_PARAMETER];
  if (typeof notice !== 'string') return undefined;
  if (notice.trim() === '' || notice.length > NOTICE_MAX_LENGTH) return undefined;
  return notice;
}

export function hasPricingPlans(root: PageRoot): boolean {
  return (Object.keys(PLAN_CTA_SELECTORS) as PlanName[]).every((plan) => root.querySelector(PLAN_CTA_SELECTORS[plan]) !== null);
}

export function hasPricingNotice(root: PageRoot): boolean {
  return root.querySelector(PRICING_NOTICE_SELECTOR) !== null;
}

export function hasAccountBreakdown(root: PageRoot): boolean {
  return root.querySelector(ACCOUNT_BREAKDOWN_SELECTOR) !== null;
}

/** Control labels are the markup as shipped, so only the treatment changes anything. */
export function applyPlanLabels(root: PageRoot, mode: LabelMode): void {
  if (mode !== 'specific') return;
  for (const plan of Object.keys(PLAN_CTA_SELECTORS) as PlanName[]) {
    const link = root.querySelector(PLAN_CTA_SELECTORS[plan]);
    if (link !== null) link.textContent = SPECIFIC_CTA_LABELS[plan];
  }
}

export function applyNotice(root: PageRoot, notice: string | undefined): void {
  if (notice === undefined) return;
  const label = root.querySelector(PRICING_NOTICE_SELECTOR);
  if (label !== null) label.textContent = notice;
}

export function applyAccountBreakdown(root: PageRoot, visible: boolean): void {
  if (!visible) return;
  const section = root.querySelector(ACCOUNT_BREAKDOWN_SELECTOR);
  if (section === null) return;
  section.textContent = ACCOUNT_BREAKDOWN_TEXT;
  section.hidden = false;
}
