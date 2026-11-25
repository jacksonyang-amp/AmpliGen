export type PropertyValue = string | boolean;

export interface TrackOptions {
  insertId: string;
}

export interface AnalyticsInitOptions {
  analytics: Record<string, unknown>;
  sessionReplay: Record<string, unknown>;
  experiment: Record<string, unknown>;
  engagement: Record<string, unknown>;
}

export interface AnalyticsSdk {
  init(apiKey: string, options: AnalyticsInitOptions): Promise<void>;
  setUserId(userId: string): void;
  setUserProperties(properties: Record<string, PropertyValue>): void;
  setGroup(groupType: string, groupName: string): void;
  track(eventName: string, properties: Record<string, PropertyValue>, options: TrackOptions): void;
  flush(): Promise<void>;
}
