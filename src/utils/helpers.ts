/** Utilidad compartida: verifica si un valor es un objeto plano (no array, no null). */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
