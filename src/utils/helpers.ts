/** Verifica si un valor es un objeto plano (no array, no null). */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

// ─── Conversión de texto ───

/** Convierte un array de strings a texto con saltos de línea. */
export function detailsToText(details: unknown): string {
  return Array.isArray(details) ? details.join('\n') : ''
}

/** Convierte texto con saltos de línea a array de strings (trim + filtrado de vacíos). */
export function textToDetails(detailsText: string): string[] {
  return detailsText
    .split('\n')
    .map((detail) => detail.trim())
    .filter((detail) => detail.length > 0)
}

// ─── Nombres de meses (español) ───

export const TIMELINE_MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
] as const

export const TIMELINE_MONTH_INDEXES: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, setiembre: 8,
  octubre: 9, noviembre: 10, diciembre: 11
}

// ─── Formateo de fechas ───

/** Formatea una fecha YYYY-MM-DD a "d de mes de YYYY" en español. */
export function formatTimelineDateForDisplay(dateValue: unknown): string {
  const match = String(dateValue || '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return String(dateValue || '').trim()

  const day = Number(match[3])
  const monthName = TIMELINE_MONTH_NAMES[Number(match[2]) - 1]
  return monthName ? `${day} de ${monthName} de ${match[1]}` : String(dateValue || '').trim()
}

/** Parsea una fecha en español ("d de mes de YYYY") a formato YYYY-MM-DD. */
export function parseTimelineDateForInput(dateValue: unknown): string {
  const rawValue = String(dateValue || '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) return rawValue

  const match = rawValue.toLowerCase().match(/(\d{1,2})\s+de\s+([a-záéíóúñ]+)(?:\s+de\s+(\d{4}))?/)
  if (!match) return ''

  const normalizedMonth = match[2].normalize('NFD').replace(/[̀-ͯ]/g, '')
  const monthIndex = TIMELINE_MONTH_INDEXES[normalizedMonth]
  if (monthIndex === undefined) return ''

  if (!match[3]) return ''

  const year = Number(match[3])
  const month = String(monthIndex + 1).padStart(2, '0')
  const dayNum = Number(match[1])
  const day = String(dayNum).padStart(2, '0')

  // Validate day range for the given month/year (e.g., reject "32 de enero")
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  if (dayNum < 1 || dayNum > daysInMonth) return ''

  return `${year}-${month}-${day}`
}

/** Normaliza una fecha para almacenamiento: si ya es YYYY-MM-DD la deja igual, si no intenta parsearla. */
export function normalizeTimelineDateForStorage(dateValue: unknown): string {
  const rawValue = String(dateValue || '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) return rawValue
  return parseTimelineDateForInput(rawValue) || rawValue
}

/** Parsea una fecha importante para input de tipo date. */
export function parseImportantDateForInput(dateValue: unknown): string {
  const rawValue = String(dateValue || '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) return rawValue
  return parseTimelineDateForInput(rawValue)
}

/** Normaliza una fecha importante para almacenamiento. */
export function normalizeImportantDateForStorage(dateValue: unknown): string {
  const rawValue = String(dateValue || '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) return rawValue
  return parseImportantDateForInput(rawValue)
}
