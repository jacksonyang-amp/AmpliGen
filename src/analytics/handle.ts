export interface AnalyticsHandle {
  syncIdentity(): void;
  navigateAfterFlush(navigate: () => void): void;
}

const INACTIVE: AnalyticsHandle = {
  syncIdentity() {},
  navigateAfterFlush(navigate) {
    navigate();
  },
};

let current: AnalyticsHandle = INACTIVE;

export function getAnalytics(): AnalyticsHandle {
  return current;
}

export function setAnalytics(handle: AnalyticsHandle | undefined): void {
  current = handle ?? INACTIVE;
}
