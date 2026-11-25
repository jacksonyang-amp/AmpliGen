import type { EntryPoint } from '../contract/catalog.ts';
import { ROUTES, normalizePagePath } from '../contract/paths.ts';
import type { StorageLike } from './storage.ts';

export const NAVIGATION_STORAGE_KEY = 'ampligen.navigation.v1';

interface NavigationState {
  current?: string;
  previous?: string;
}

function load(storage: StorageLike): NavigationState {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(NAVIGATION_STORAGE_KEY) ?? '{}');
    if (typeof parsed !== 'object' || parsed === null) return {};
    const { current, previous } = parsed as NavigationState;
    const state: NavigationState = {};
    if (typeof current === 'string') state.current = current;
    if (typeof previous === 'string') state.previous = previous;
    return state;
  } catch {
    return {};
  }
}

export function recordPageView(storage: StorageLike, pathname: string): void {
  const path = normalizePagePath(pathname);
  const state = load(storage);
  if (state.current === path) return;

  const next: NavigationState = { current: path };
  if (state.current !== undefined) next.previous = state.current;
  storage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(next));
}

export function currentEntryPoint(storage: StorageLike): EntryPoint {
  const { previous } = load(storage);
  if (previous === undefined) return 'direct';
  if (previous === ROUTES.product) return 'product';
  if (previous === ROUTES.pricing) return 'pricing';
  return 'navigation';
}
