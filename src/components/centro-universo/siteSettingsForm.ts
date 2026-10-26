import baseConfig from '../../data/siteConfig.json'
import type { SiteSettings } from '../../types/siteSettings'

export function getSettingsFormValues(settings: SiteSettings) {
  return {
    yourName: settings.couple?.yourName ?? baseConfig.couple.yourName,
    herName: settings.couple?.herName ?? baseConfig.couple.herName,
    mainPairName: settings.couple?.mainPairName ?? baseConfig.couple.mainPairName,
    titleName: settings.hero?.titleName ?? baseConfig.hero.titleName,
    metDate: settings.dates?.metDate ?? baseConfig.dates.metDate,
    relationshipStartDate: settings.dates?.relationshipStartDate ?? baseConfig.dates.relationshipStartDate,
    nextMeetingDate: settings.dates?.nextMeetingDate ?? baseConfig.dates.nextMeetingDate,
  }
}

export type SettingsFormValues = ReturnType<typeof getSettingsFormValues>
export const settingsFields: { key: keyof SettingsFormValues; label: string; type?: 'date'; required?: boolean }[] = [
  { key: 'yourName', label: 'Tu nombre' },
  { key: 'herName', label: 'Nombre de tu pareja' },
  { key: 'mainPairName', label: 'Nombre compartido', required: true },
  { key: 'titleName', label: 'Nombre en portada (opcional)' },
  { key: 'metDate', label: 'Día en que se conocieron', type: 'date', required: true },
  { key: 'relationshipStartDate', label: 'Inicio de la relación', type: 'date', required: true },
  { key: 'nextMeetingDate', label: 'Próximo encuentro', type: 'date', required: true },
]

export function settingsFromForm(values: SettingsFormValues): SiteSettings {
  return {
    couple: { yourName: values.yourName, herName: values.herName, mainPairName: values.mainPairName },
    hero: { titleName: values.titleName },
    dates: { metDate: values.metDate, relationshipStartDate: values.relationshipStartDate, nextMeetingDate: values.nextMeetingDate },
  }
}
