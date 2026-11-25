import { buildDemoRequestSubmitted, buildSignUpCompleted } from '../contract/actions.ts';
import type { ContractAction } from '../contract/actions.ts';
import { ROUTES } from '../contract/paths.ts';
import type { ActionRegistry, EmitResult } from '../contract/registry.ts';
import { validateDemoRequest, validateSignUp } from '../contract/validation.ts';
import type { FieldErrors, RawFormInput } from '../contract/validation.ts';
import { loadIdentity, resetIdentity, resolveSubmissionIdentity, selectPersona } from '../identity/identity.ts';
import type { IdentityState, TrafficOrigin } from '../identity/identity.ts';
import type { IdGenerator } from '../identity/ids.ts';
import { currentEntryPoint } from '../identity/navigation.ts';
import type { StorageLike } from '../identity/storage.ts';

export interface FlowContext {
  identityStorage: StorageLike;
  navigationStorage: StorageLike;
  ids: IdGenerator;
  registry: ActionRegistry;
  origin: TrafficOrigin;
}

export type SubmitResult =
  | { ok: true; action: ContractAction; destination: string; emit: EmitResult }
  | { ok: false; errors: FieldErrors };

function identityDeps(ctx: FlowContext) {
  return { storage: ctx.identityStorage, ids: ctx.ids };
}

export function submitDemoRequest(ctx: FlowContext, raw: RawFormInput): SubmitResult {
  const validation = validateDemoRequest(raw);
  if (!validation.ok) return { ok: false, errors: validation.errors };

  const { email, productId, planId } = validation.value;
  const identity = resolveSubmissionIdentity(identityDeps(ctx), email, ctx.origin);
  const action = buildDemoRequestSubmitted({
    eventId: ctx.ids.next('evt'),
    userId: identity.userId,
    accountId: identity.accountId,
    isSynthetic: identity.isSynthetic,
    trafficSource: identity.trafficSource,
    productId,
    planId,
    entryPoint: currentEntryPoint(ctx.navigationStorage),
    submissionId: ctx.ids.next('sub'),
  });
  return { ok: true, action, destination: ROUTES.demoRequestSuccess, emit: ctx.registry.emit(action) };
}

export function submitSignUp(ctx: FlowContext, raw: RawFormInput): SubmitResult {
  const validation = validateSignUp(raw);
  if (!validation.ok) return { ok: false, errors: validation.errors };

  const { email, productId, planId } = validation.value;
  const identity = resolveSubmissionIdentity(identityDeps(ctx), email, ctx.origin);
  const action = buildSignUpCompleted({
    eventId: ctx.ids.next('evt'),
    userId: identity.userId,
    accountId: identity.accountId,
    isSynthetic: identity.isSynthetic,
    trafficSource: identity.trafficSource,
    productId,
    planId,
    entryPoint: currentEntryPoint(ctx.navigationStorage),
    identityMethod: identity.identityMethod,
    accountMappingStatus: identity.accountMappingStatus,
  });
  return { ok: true, action, destination: ROUTES.welcome, emit: ctx.registry.emit(action) };
}

export function activatePersona(ctx: FlowContext, personaId: string): boolean {
  return selectPersona(identityDeps(ctx), personaId);
}

export function resetSampleVisitor(ctx: FlowContext): IdentityState {
  return resetIdentity(identityDeps(ctx));
}

export function readIdentity(ctx: FlowContext): IdentityState {
  return loadIdentity(identityDeps(ctx));
}
