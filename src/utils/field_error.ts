import type { FieldErrors, FieldValues } from 'react-hook-form';

/** The message for a field, including nested names like "taxByPaymentMethod.cash". */
export default function fieldError(errors: FieldErrors<FieldValues>, name: string): string | undefined {
  const found = name.split('.').reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], errors);
  const message = (found as { message?: unknown } | undefined)?.message;
  return typeof message === 'string' ? message : undefined;
}
