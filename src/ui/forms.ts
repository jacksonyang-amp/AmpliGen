import type { FieldErrorCode, FieldErrors, FormField } from '../contract/validation.ts';
import { activatePersona, readIdentity, resetSampleVisitor, submitDemoRequest, submitSignUp } from '../flow/handlers.ts';
import { PERSONAS, findPersona } from '../fixtures/personas.ts';
import { getBrowserContext } from './runtime.ts';

export type FormKind = 'demo-request' | 'sign-up';

const FIELDS: Record<FormField, { input: string; error: string }> = {
  name: { input: 'field-name', error: 'error-name' },
  email: { input: 'field-email', error: 'error-email' },
  product_id: { input: 'field-product', error: 'error-product' },
  plan_id: { input: 'field-plan', error: 'error-plan' },
};

const FIELD_ORDER: FormField[] = ['name', 'email', 'product_id', 'plan_id'];

function messageFor(field: FormField, code: FieldErrorCode): string {
  switch (code) {
    case 'required':
      return field === 'name' || field === 'email' ? 'Enter a value for this field.' : 'Choose an option.';
    case 'too_long':
      return field === 'name' ? 'Use 80 characters or fewer.' : 'This value is too long.';
    case 'invalid_format':
      return 'Enter a valid work email address.';
    case 'unknown_value':
      return 'Choose one of the listed options.';
    case 'not_allowed':
      return 'This plan is not available for sign-up. Choose Starter or Growth.';
  }
}

function element<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

export function initForm(kind: FormKind): void {
  const form = element<HTMLFormElement>('conversion-form');
  const nameInput = element<HTMLInputElement>(FIELDS.name.input);
  const emailInput = element<HTMLInputElement>(FIELDS.email.input);
  const productSelect = element<HTMLSelectElement>(FIELDS.product_id.input);
  const planSelect = element<HTMLSelectElement>(FIELDS.plan_id.input);
  const personaSelect = element<HTMLSelectElement>('field-persona');
  const resetButton = element<HTMLButtonElement>('reset-persona');
  const submitButton = element<HTMLButtonElement>('submit-form');
  if (!form || !nameInput || !emailInput || !productSelect || !planSelect || !personaSelect || !resetButton || !submitButton) return;

  const ctx = getBrowserContext();
  let submitting = false;

  for (const persona of PERSONAS) {
    const option = document.createElement('option');
    option.value = persona.id;
    option.textContent = persona.company === null ? persona.name : `${persona.name}, ${persona.company}`;
    personaSelect.append(option);
  }

  function clearErrors(): void {
    for (const field of FIELD_ORDER) {
      const message = element<HTMLElement>(FIELDS[field].error);
      const input = element<HTMLElement>(FIELDS[field].input);
      if (message) {
        message.textContent = '';
        message.hidden = true;
      }
      input?.removeAttribute('aria-invalid');
    }
  }

  function showErrors(errors: FieldErrors): void {
    clearErrors();
    let firstInvalid: HTMLElement | null = null;
    for (const field of FIELD_ORDER) {
      const code = errors[field];
      if (code === undefined) continue;
      const message = element<HTMLElement>(FIELDS[field].error);
      const input = element<HTMLElement>(FIELDS[field].input);
      if (message) {
        message.textContent = messageFor(field, code);
        message.hidden = false;
      }
      input?.setAttribute('aria-invalid', 'true');
      firstInvalid ??= input;
    }
    firstInvalid?.focus();
  }

  function applyPersona(personaId: string): void {
    const persona = findPersona(personaId);
    if (persona === undefined) return;
    nameInput!.value = persona.name;
    emailInput!.value = persona.email;
    personaSelect!.value = persona.id;
  }

  const active = readIdentity(ctx).personaId;
  if (active !== undefined) applyPersona(active);

  personaSelect.addEventListener('change', () => {
    clearErrors();
    if (personaSelect.value === '') {
      resetSampleVisitor(ctx);
      return;
    }
    if (activatePersona(ctx, personaSelect.value)) applyPersona(personaSelect.value);
  });

  resetButton.addEventListener('click', () => {
    resetSampleVisitor(ctx);
    form.reset();
    personaSelect.value = '';
    clearErrors();
    nameInput.focus();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (submitting) return;

    const raw = {
      name: nameInput.value,
      email: emailInput.value,
      productId: productSelect.value,
      planId: planSelect.value,
    };
    const result = kind === 'demo-request' ? submitDemoRequest(ctx, raw) : submitSignUp(ctx, raw);
    if (!result.ok) {
      showErrors(result.errors);
      return;
    }

    clearErrors();
    submitting = true;
    submitButton.disabled = true;
    window.location.assign(result.destination);
  });

  form.hidden = false;
}

export function initResetOnly(): void {
  const resetButton = element<HTMLButtonElement>('reset-persona');
  const status = element<HTMLElement>('reset-status');
  if (!resetButton) return;

  const ctx = getBrowserContext();
  resetButton.addEventListener('click', () => {
    resetSampleVisitor(ctx);
    if (status) status.textContent = 'Sample visitor reset.';
  });
}
