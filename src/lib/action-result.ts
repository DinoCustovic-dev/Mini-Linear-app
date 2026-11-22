/**
 * Return shape of every server action, so forms handle errors the same way.
 * `fieldErrors` holds zod messages per input name, for showing under fields.
 */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
