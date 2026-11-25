import { PLAN_IDS, PRODUCT_IDS, SIGN_UP_PLAN_IDS, isOneOf } from './catalog.ts';
import type { PlanId, ProductId, SignUpPlanId } from './catalog.ts';
import { MAX_EMAIL_LENGTH, isValidEmailFormat, normalizeEmail } from './email.ts';

export const MAX_NAME_LENGTH = 80;

export type FormField = 'name' | 'email' | 'product_id' | 'plan_id';
export type FieldErrorCode = 'required' | 'too_long' | 'invalid_format' | 'unknown_value' | 'not_allowed';
export type FieldErrors = Partial<Record<FormField, FieldErrorCode>>;

export interface RawFormInput {
  name?: unknown;
  email?: unknown;
  productId?: unknown;
  planId?: unknown;
}

export interface DemoRequestInput {
  name: string;
  email: string;
  productId: ProductId;
  planId?: PlanId;
}

export interface SignUpInput {
  name: string;
  email: string;
  productId: ProductId;
  planId: SignUpPlanId;
}

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: FieldErrors };

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function checkName(raw: unknown, errors: FieldErrors): string {
  const name = text(raw);
  if (name === '') errors.name = 'required';
  else if (Array.from(name).length > MAX_NAME_LENGTH) errors.name = 'too_long';
  return name;
}

function checkEmail(raw: unknown, errors: FieldErrors): string {
  const trimmed = text(raw);
  if (trimmed === '') errors.email = 'required';
  else if (trimmed.length > MAX_EMAIL_LENGTH) errors.email = 'too_long';
  else if (!isValidEmailFormat(normalizeEmail(trimmed))) errors.email = 'invalid_format';
  return normalizeEmail(trimmed);
}

function checkProduct(raw: unknown, errors: FieldErrors): ProductId | undefined {
  const product = text(raw);
  if (product === '') errors.product_id = 'required';
  else if (!isOneOf(PRODUCT_IDS, product)) errors.product_id = 'unknown_value';
  else return product;
  return undefined;
}

export function validateDemoRequest(raw: RawFormInput): ValidationResult<DemoRequestInput> {
  const errors: FieldErrors = {};
  const name = checkName(raw.name, errors);
  const email = checkEmail(raw.email, errors);
  const productId = checkProduct(raw.productId, errors);

  const plan = text(raw.planId);
  let planId: PlanId | undefined;
  if (plan !== '') {
    if (isOneOf(PLAN_IDS, plan)) planId = plan;
    else errors.plan_id = 'unknown_value';
  }

  if (Object.keys(errors).length > 0 || productId === undefined) return { ok: false, errors };
  return { ok: true, value: planId === undefined ? { name, email, productId } : { name, email, productId, planId } };
}

export function validateSignUp(raw: RawFormInput): ValidationResult<SignUpInput> {
  const errors: FieldErrors = {};
  const name = checkName(raw.name, errors);
  const email = checkEmail(raw.email, errors);
  const productId = checkProduct(raw.productId, errors);

  const plan = text(raw.planId);
  let planId: SignUpPlanId | undefined;
  if (plan === '') errors.plan_id = 'required';
  else if (isOneOf(SIGN_UP_PLAN_IDS, plan)) planId = plan;
  else if (isOneOf(PLAN_IDS, plan)) errors.plan_id = 'not_allowed';
  else errors.plan_id = 'unknown_value';

  if (Object.keys(errors).length > 0 || productId === undefined || planId === undefined) return { ok: false, errors };
  return { ok: true, value: { name, email, productId, planId } };
}
