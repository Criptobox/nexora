export type Ok<T> = { ok: true; value: T };
export type Err<E = string> = { ok: false; error: E };
export type Result<T, E = string> = Ok<T> | Err<E>;
export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E = string>(error: E): Err<E> => ({ ok: false, error });
export function unwrap<T>(r: Result<T>): T {
  if (r.ok) return r.value;
  throw new Error(typeof r.error === 'string' ? r.error : JSON.stringify(r.error));
}
