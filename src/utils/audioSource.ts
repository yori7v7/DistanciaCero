/** Resolve public audio paths while preserving playable browser URLs. */
export function resolveAudioSource(source: string | null | undefined, base = import.meta.env.BASE_URL || '/'): string {
  const value = typeof source === 'string' ? source.trim() : ''
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value)
      return url.hostname ? value : ''
    } catch {
      return ''
    }
  }
  if (/^data:audio\//i.test(value) || /^blob:(https?:\/\/|null\/)/i.test(value)) return value
  if (/^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith('//') || value.includes('\\')) return ''
  const publicBase = base.endsWith('/') ? base : `${base}/`
  if (publicBase !== '/' && value.startsWith(publicBase)) return value
  const path = value.replace(/^\.\//, '').replace(/^\/+/, '')
  return path ? `${publicBase}${path}` : ''
}
