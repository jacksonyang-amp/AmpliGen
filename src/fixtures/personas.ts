export interface PersonaFixture {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly company: string | null;
}

export const PERSONAS: readonly PersonaFixture[] = [
  {
    id: 'persona_priya_nair',
    name: 'Priya Nair',
    email: 'priya.nair@northwind-labs.example',
    company: 'Northwind Labs',
  },
  {
    id: 'persona_marcus_lee',
    name: 'Marcus Lee',
    email: 'marcus.lee@globex-retail.example',
    company: 'Globex Retail',
  },
  {
    id: 'persona_sam_ortiz',
    name: 'Sam Ortiz',
    email: 'sam.ortiz@initech-systems.example',
    company: 'Initech Systems',
  },
  {
    id: 'persona_dana_wu',
    name: 'Dana Wu',
    email: 'dana.wu@freemail.example',
    company: null,
  },
];

export function findPersona(personaId: string): PersonaFixture | undefined {
  return PERSONAS.find((persona) => persona.id === personaId);
}
