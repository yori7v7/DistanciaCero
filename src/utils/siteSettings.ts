import type { SiteSettings } from '../types/siteSettings'

export const SITE_SETTINGS_STORAGE_KEY = 'distancia-cero-site-settings'

const fields = {
  couple: ['yourName', 'herName', 'mainPairName'],
  dates: ['metDate', 'relationshipStartDate', 'nextMeetingDate'],
  hero: ['titleName'],
} as const

const labels: Record<string, string> = {
  couple: 'los nombres de la pareja',
  dates: 'las fechas',
  hero: 'la portada',
  'couple.yourName': 'Tu nombre',
  'couple.herName': 'Nombre de tu pareja',
  'couple.mainPairName': 'Nombre de la pareja',
  'dates.metDate': 'Fecha en que se conocieron',
  'dates.relationshipStartDate': 'Inicio de la relación',
  'dates.nextMeetingDate': 'Próximo encuentro',
  'hero.titleName': 'Nombre en la portada',
}

function invalid(path: string): never {
  const label = Object.hasOwn(labels, path) ? labels[path] : 'los ajustes generales'
  throw new Error(`Ajustes inválidos: revisa ${label}. No se cambiaron tus datos.`)
}

function isSettingsObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  if (year < 1) return false
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

/** Valida y copia el documento completo; no accede al almacenamiento. */
export function validateSiteSettings(input: unknown): SiteSettings {
  if (!isSettingsObject(input)) invalid('ajustes')
  const result: SiteSettings = {}
  for (const [group, section] of Object.entries(input)) {
    if (!Object.hasOwn(fields, group)) invalid(group)
    if (!isSettingsObject(section)) invalid(group)
    const allowed: readonly string[] = fields[group as keyof typeof fields]
    const checked: Record<string, string> = {}
    for (const [name, value] of Object.entries(section)) {
      const path = `${group}.${name}`
      if (!allowed.includes(name) || typeof value !== 'string') invalid(path)
      if (group === 'dates') {
        if (!isCalendarDate(value)) invalid(path)
        checked[name] = value
      } else {
        const trimmed = value.trim()
        if (trimmed.length > 80 || (name === 'mainPairName' && !trimmed)) invalid(path)
        checked[name] = trimmed
      }
    }
    if (group === 'couple') result.couple = checked
    if (group === 'dates') result.dates = checked
    if (group === 'hero') result.hero = checked
  }
  return result
}
