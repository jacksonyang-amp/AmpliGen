import { flushThenNavigate } from './navigation.ts';

export interface AnalyticsHandle {
  syncIdentity(): void;
  navigateAfterFlush(navigate: () => void): void;
  flush?: () => Promise<void>;
}

export interface AnalyticsPart {
  syncIdentity(): void;
  flush(): Promise<void>;
}

const INACTIVE: AnalyticsHandle = {
  syncIdentity() {},
  navigateAfterFlush(navigate) {
    navigate();
  },
};

let current: AnalyticsHandle = INACTIVE;
const parts: AnalyticsPart[] = [];

function settled(task: () => Promise<void>): Promise<void> {
  try {
    return Promise.resolve(task()).catch(() => undefined);
  } catch {
    return Promise.resolve();
  }
}

const combined: AnalyticsHandle = {
  syncIdentity() {
    current.syncIdentity();
    for (const part of [...parts]) {
      try {
        part.syncIdentity();
      } catch {
        // Analytics must never break the page.
      }
    }
  },
  navigateAfterFlush(navigate) {
    if (parts.length === 0) {
      current.navigateAfterFlush(navigate);
      return;
    }
    const flushes: Array<() => Promise<void>> = [];
    const own = current.flush;
    if (own !== undefined) flushes.push(() => own());
    for (const part of parts) flushes.push(() => part.flush());
    // One wait for every service: the same bounded delay, then a single navigation.
    flushThenNavigate({
      flush: () => Promise.all(flushes.map(settled)).then(() => undefined),
      navigate,
    });
  },
};

export function getAnalytics(): AnalyticsHandle {
  return combined;
}

export function setAnalytics(handle: AnalyticsHandle | undefined): void {
  current = handle ?? INACTIVE;
}

export function addAnalyticsPart(part: AnalyticsPart): () => void {
  parts.push(part);
  return () => {
    const index = parts.indexOf(part);
    if (index >= 0) parts.splice(index, 1);
  };
}
