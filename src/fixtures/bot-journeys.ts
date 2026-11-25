export type BotStep =
  | { type: 'select_persona'; personaId: string }
  | { type: 'visit'; path: string }
  | { type: 'submit_demo_request'; productId: string; planId?: string }
  | { type: 'submit_sign_up'; productId: string; planId: string; input: 'valid' | 'invalid_email' };

export interface BotJourney {
  readonly id: string;
  readonly botId: string;
  readonly steps: readonly BotStep[];
}

export const BOT_JOURNEYS: readonly BotJourney[] = [
  {
    id: 'northwind_demo_request',
    botId: 'bot_visitor_001',
    steps: [
      { type: 'select_persona', personaId: 'persona_priya_nair' },
      { type: 'visit', path: '/' },
      { type: 'visit', path: '/product/' },
      { type: 'visit', path: '/pricing/' },
      { type: 'submit_demo_request', productId: 'ampligen_gateway', planId: 'enterprise' },
    ],
  },
  {
    id: 'globex_sign_up',
    botId: 'bot_visitor_002',
    steps: [
      { type: 'select_persona', personaId: 'persona_marcus_lee' },
      { type: 'visit', path: '/' },
      { type: 'visit', path: '/pricing/' },
      { type: 'submit_sign_up', productId: 'ampligen_metrics', planId: 'growth', input: 'valid' },
    ],
  },
  {
    id: 'initech_browse_only',
    botId: 'bot_visitor_003',
    steps: [
      { type: 'select_persona', personaId: 'persona_sam_ortiz' },
      { type: 'visit', path: '/product/' },
      { type: 'visit', path: '/pricing/' },
    ],
  },
  {
    id: 'dana_invalid_then_sign_up',
    botId: 'bot_visitor_004',
    steps: [
      { type: 'select_persona', personaId: 'persona_dana_wu' },
      { type: 'visit', path: '/' },
      { type: 'submit_sign_up', productId: 'ampligen_connect', planId: 'starter', input: 'invalid_email' },
      { type: 'submit_sign_up', productId: 'ampligen_connect', planId: 'starter', input: 'valid' },
    ],
  },
];
