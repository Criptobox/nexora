/** Validador mínimo sin dependencias externas (evita deuda de terceros en el core). */
export type Validator<T> = (value: unknown) => { ok: true; value: T } | { ok: false; errors: string[] };

export function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function requireFields<T>(value: unknown, fields: string[], name: string): { ok: true; value: T } | { ok: false; errors: string[] } {
  if (!isObject(value)) return { ok: false, errors: [`${name}: expected object`] };
  const errors = fields.filter((f) => value[f] === undefined).map((f) => `${name}: missing field "${f}"`);
  return errors.length ? { ok: false, errors } : { ok: true, value: value as T };
}

export function oneOf<T extends string>(allowed: readonly T[], value: unknown, name: string): { ok: true; value: T } | { ok: false; errors: string[] } {
  return (allowed as readonly string[]).includes(value as string)
    ? { ok: true, value: value as T }
    : { ok: false, errors: [`${name}: "${String(value)}" not in [${allowed.join(', ')}]`] };
}
