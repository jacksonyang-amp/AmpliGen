import { emailDomain, normalizeEmail } from '../contract/email.ts';
import { ACCOUNTS, FREE_MAIL_DOMAINS } from '../fixtures/accounts.ts';

export type AccountMapping = { status: 'mapped'; accountId: string } | { status: 'unmapped' };

export function mapEmailToAccount(email: string): AccountMapping {
  const domain = emailDomain(normalizeEmail(email));
  if (domain === '' || FREE_MAIL_DOMAINS.includes(domain)) return { status: 'unmapped' };
  const account = ACCOUNTS.find((candidate) => candidate.domain === domain);
  return account === undefined ? { status: 'unmapped' } : { status: 'mapped', accountId: account.id };
}

export function isSyntheticEmail(email: string): boolean {
  return emailDomain(normalizeEmail(email)).endsWith('.example');
}
