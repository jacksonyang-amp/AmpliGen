export const MAX_EMAIL_LENGTH = 254;
export const MAX_LOCAL_PART_LENGTH = 64;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emailDomain(normalizedEmail: string): string {
  const at = normalizedEmail.lastIndexOf('@');
  return at < 0 ? '' : normalizedEmail.slice(at + 1);
}

export function isValidEmailFormat(normalizedEmail: string): boolean {
  const at = normalizedEmail.indexOf('@');
  if (at <= 0 || at !== normalizedEmail.lastIndexOf('@')) return false;

  const local = normalizedEmail.slice(0, at);
  const domain = normalizedEmail.slice(at + 1);
  if (local.length > MAX_LOCAL_PART_LENGTH) return false;
  if (!/^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+$/.test(local)) return false;
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;

  const labels = domain.split('.');
  if (labels.length < 2) return false;
  const labelPattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  return labels.every((label) => label.length <= 63 && labelPattern.test(label)) && /^[a-z]{2,}$/.test(labels[labels.length - 1]);
}
