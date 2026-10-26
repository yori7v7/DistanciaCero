import type { SiteSettings } from '../types/siteSettings'
import {
  getSiteSettings as readSiteSettings,
  saveSiteSettings as persistSiteSettings,
} from '../repositories/localContentRepository'
import { validateSiteSettings } from '../utils/siteSettings'

export { SITE_SETTINGS_STORAGE_KEY } from '../utils/siteSettings'
export const SETTINGS_UPDATED_EVENT = 'distancia-cero-settings-updated'

export function getSiteSettings(): SiteSettings {
  return readSiteSettings()
}

/** Reemplaza los overrides generales; los campos ausentes usan el JSON base. */
export function saveSiteSettings(input: unknown): SiteSettings {
  const settings = persistSiteSettings(validateSiteSettings(input))
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT))
  return settings
}

export function resetSiteSettings(): void {
  saveSiteSettings({})
}
