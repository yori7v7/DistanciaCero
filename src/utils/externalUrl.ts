/** Only absolute HTTP(S) links may leave the application. */
export function resolveExternalUrl(value: unknown): string {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!/^https?:\/\//i.test(trimmed)) return ''
  try {
    const url = new URL(trimmed)
    return (url.protocol === 'https:' || url.protocol === 'http:') && url.hostname ? trimmed : ''
  } catch {
    return ''
  }
}
