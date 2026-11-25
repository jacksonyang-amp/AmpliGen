import type { ExperimentUser } from './sdk.ts';

export function experimentUserFor(userId: string, isSynthetic: boolean, accountId: string | undefined): ExperimentUser {
  return {
    userID: userId,
    custom: accountId === undefined ? { is_synthetic: isSynthetic } : { is_synthetic: isSynthetic, account_id: accountId },
  };
}

export function userKey(user: ExperimentUser): string {
  return JSON.stringify([user.userID, user.custom.is_synthetic, user.custom.account_id ?? null]);
}
