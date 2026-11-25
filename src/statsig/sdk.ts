export type UserAttribute = string | boolean;

export interface ExperimentUser {
  userID: string;
  custom: Record<string, UserAttribute>;
}

export interface ExperimentsInitOptions {
  environmentTier: string;
  timeoutMs: number;
}

export interface ExperimentsSdk {
  init(apiKey: string, user: ExperimentUser, options: ExperimentsInitOptions): Promise<void>;
  updateUser(user: ExperimentUser): void;
  getExperimentValue(name: string): Record<string, unknown>;
  checkGate(name: string): boolean;
  getConfigValue(name: string): Record<string, unknown>;
  logEvent(eventName: string, metadata: Record<string, string>): void;
  flush(): Promise<void>;
}
