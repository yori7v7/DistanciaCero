import { useMemo, useSyncExternalStore } from 'react'
import baseConfig from '../data/siteConfig.json'
import { getSiteSettings, SETTINGS_UPDATED_EVENT, SITE_SETTINGS_STORAGE_KEY } from '../services/siteSettingsService'
import type { SiteSettings } from '../types/siteSettings'

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === SITE_SETTINGS_STORAGE_KEY) onChange()
  }
  const onContent = (event: CustomEvent<{ collection?: string }>) => {
    if (event.detail?.collection === 'all') onChange()
  }
  window.addEventListener(SETTINGS_UPDATED_EVENT, onChange)
  window.addEventListener('storage', onStorage)
  window.addEventListener('distancia-cero-content-updated', onContent)
  return () => {
    window.removeEventListener(SETTINGS_UPDATED_EVENT, onChange)
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('distancia-cero-content-updated', onContent)
  }
}

// A primitive snapshot stays stable between writes, including malformed storage.
const getSnapshot = () => JSON.stringify(getSiteSettings())
const getServerSnapshot = () => '{}'

export function useSiteSettings(): SiteSettings {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return useMemo(() => JSON.parse(snapshot) as SiteSettings, [snapshot])
}

export default function useSiteConfig() {
  const settings = useSiteSettings()
  return useMemo(() => {
    const couple = { ...baseConfig.couple, ...settings.couple }
    const hero = { ...baseConfig.hero, ...settings.hero }
    return {
      ...baseConfig,
      couple,
      dates: { ...baseConfig.dates, ...settings.dates },
      hero: { ...hero, titleName: hero.titleName || couple.herName || '' },
    }
  }, [settings])
}
