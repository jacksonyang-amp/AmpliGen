import { ACCOUNT_MAPPING_STATUSES, isOneOf } from '../contract/catalog.ts';
import type { AccountMappingStatus, IdentityMethod, TrafficSource } from '../contract/catalog.ts';
import { normalizeEmail } from '../contract/email.ts';
import { ACCOUNTS } from '../fixtures/accounts.ts';
import { findPersona } from '../fixtures/personas.ts';
import type { IdGenerator } from './ids.ts';
import { isSyntheticEmail, mapEmailToAccount } from './mapping.ts';
import type { StorageLike } from './storage.ts';

export const IDENTITY_STORAGE_KEY = 'ampligen.identity.v1';

export type TrafficOrigin = 'browser' | 'bot';

export interface IdentityState {
  visitorId: string;
  personaId?: string;
  accountId?: string;
  mappingStatus?: AccountMappingStatus;
}

export interface IdentityDeps {
  storage: StorageLike;
  ids: IdGenerator;
}

export interface ResolvedIdentity {
  userId: string;
  accountId?: string;
  accountMappingStatus: AccountMappingStatus;
  identityMethod: IdentityMethod;
  isSynthetic: boolean;
  trafficSource: TrafficSource;
}

const VISITOR_ID_PATTERN = /^[a-z0-9_]{4,64}$/;

function save(storage: StorageLike, state: IdentityState): void {
  storage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(state));
}

function parse(raw: string | null): IdentityState | undefined {
  if (raw === null) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return undefined;
    const { visitorId, personaId, accountId, mappingStatus } = value as Record<string, unknown>;
    if (typeof visitorId !== 'string' || !VISITOR_ID_PATTERN.test(visitorId)) return undefined;

    const state: IdentityState = { visitorId };
    if (typeof personaId === 'string' && findPersona(personaId) !== undefined) state.personaId = personaId;
    if (typeof accountId === 'string' && ACCOUNTS.some((account) => account.id === accountId)) state.accountId = accountId;
    if (isOneOf(ACCOUNT_MAPPING_STATUSES, mappingStatus)) state.mappingStatus = mappingStatus;
    return state;
  } catch {
    return undefined;
  }
}

export function loadIdentity(deps: IdentityDeps): IdentityState {
  const existing = parse(deps.storage.getItem(IDENTITY_STORAGE_KEY));
  if (existing !== undefined) return existing;

  const created: IdentityState = { visitorId: deps.ids.next('vis') };
  save(deps.storage, created);
  return created;
}

export function currentUserId(state: IdentityState): string {
  return state.personaId ?? state.visitorId;
}

function applyMapping(state: IdentityState, email: string): void {
  const mapping = mapEmailToAccount(email);
  state.mappingStatus = mapping.status;
  if (mapping.status === 'mapped') state.accountId = mapping.accountId;
  else delete state.accountId;
}

export function selectPersona(deps: IdentityDeps, personaId: string): boolean {
  const persona = findPersona(personaId);
  if (persona === undefined) return false;

  const state = loadIdentity(deps);
  state.personaId = persona.id;
  applyMapping(state, persona.email);
  save(deps.storage, state);
  return true;
}

export function resetIdentity(deps: IdentityDeps): IdentityState {
  const state = loadIdentity(deps);
  delete state.personaId;
  delete state.accountId;
  delete state.mappingStatus;
  save(deps.storage, state);
  return state;
}

export function resolveSubmissionIdentity(deps: IdentityDeps, email: string, origin: TrafficOrigin): ResolvedIdentity {
  const state = loadIdentity(deps);
  const normalized = normalizeEmail(email);
  const persona = state.personaId === undefined ? undefined : findPersona(state.personaId);
  const personaMatches = persona !== undefined && normalizeEmail(persona.email) === normalized;

  if (state.personaId !== undefined && !personaMatches) {
    delete state.personaId;
    delete state.accountId;
    delete state.mappingStatus;
  }

  const mapping = mapEmailToAccount(normalized);
  applyMapping(state, normalized);
  save(deps.storage, state);

  const syntheticEmail = isSyntheticEmail(normalized);
  const resolved: ResolvedIdentity = {
    userId: personaMatches && persona !== undefined ? persona.id : state.visitorId,
    accountMappingStatus: mapping.status,
    identityMethod: personaMatches ? 'predefined_persona' : 'company_email',
    isSynthetic: origin === 'bot' || personaMatches || syntheticEmail,
    trafficSource: origin === 'bot' ? 'bot' : personaMatches || syntheticEmail ? 'manual_demo' : 'visitor',
  };
  if (mapping.status === 'mapped') resolved.accountId = mapping.accountId;
  return resolved;
}
