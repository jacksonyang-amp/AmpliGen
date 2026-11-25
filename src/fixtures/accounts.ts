export interface AccountFixture {
  readonly id: string;
  readonly name: string;
  readonly domain: string;
}

export const ACCOUNTS: readonly AccountFixture[] = [
  { id: 'acct_northwind_labs', name: 'Northwind Labs', domain: 'northwind-labs.example' },
  { id: 'acct_globex_retail', name: 'Globex Retail', domain: 'globex-retail.example' },
  { id: 'acct_initech_systems', name: 'Initech Systems', domain: 'initech-systems.example' },
];

export const FREE_MAIL_DOMAINS: readonly string[] = [
  'freemail.example',
  'gmail.com',
  'outlook.com',
  'yahoo.com',
  'icloud.com',
  'proton.me',
];
