import type { AnalyticsInitOptions } from './sdk.ts';

/**
 * Session Replay settings live here so masking can be changed in one place.
 * Human decision (DECISIONS.md 2026-11-25T04:38:00Z): record every session and
 * mask no form input. "light" is the least-masking level the SDK offers, but it
 * still masks some input types (such as email and tel), so form controls are also
 * listed in unmaskSelector, which takes priority over the level.
 */
export const REPLAY_SETTINGS = {
  sampleRate: 1,
  privacyConfig: {
    defaultMaskLevel: 'light',
    unmaskSelector: ['input', 'select', 'textarea'],
  },
} as const;

/**
 * Autocapture covers page views and clicks. Features outside the agreed scope
 * (network tracking, web vitals, frustration interactions) stay off.
 */
export const AUTOCAPTURE_SETTINGS = {
  pageViews: true,
  sessions: true,
  elementInteractions: true,
  networkTracking: false,
  webVitals: false,
  frustrationInteractions: false,
} as const;

/**
 * The Experiment client is configured but never started. These options keep it
 * from fetching variants or tracking exposure if something starts it later.
 * Variation assignment belongs to a different service in a later phase.
 */
export const EXPERIMENT_SETTINGS = {
  fetchOnStart: false,
  pollOnStart: false,
  automaticFetchOnAmplitudeIdentityChange: false,
  automaticExposureTracking: false,
} as const;

/** Guides and Surveys is enabled as a capability only. No content is authored. */
export const ENGAGEMENT_SETTINGS = {
  skip: false,
} as const;

export const ACCOUNT_GROUP_TYPE = 'account';

export function buildInitOptions(): AnalyticsInitOptions {
  return {
    analytics: { autocapture: { ...AUTOCAPTURE_SETTINGS } },
    sessionReplay: {
      sampleRate: REPLAY_SETTINGS.sampleRate,
      privacyConfig: {
        defaultMaskLevel: REPLAY_SETTINGS.privacyConfig.defaultMaskLevel,
        unmaskSelector: [...REPLAY_SETTINGS.privacyConfig.unmaskSelector],
      },
    },
    experiment: { ...EXPERIMENT_SETTINGS },
    engagement: { ...ENGAGEMENT_SETTINGS },
  };
}
