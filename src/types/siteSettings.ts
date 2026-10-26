/** Overrides locales de los campos generales editables de la experiencia. */
export interface SiteSettings {
  couple?: {
    yourName?: string
    herName?: string
    mainPairName?: string
  }
  dates?: {
    metDate?: string
    relationshipStartDate?: string
    nextMeetingDate?: string
  }
  hero?: {
    titleName?: string
  }
}
