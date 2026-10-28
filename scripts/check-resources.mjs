import { readFileSync, realpathSync, statSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Comprueba referencias configuradas sin consultar servicios ni datos del navegador. */
export function auditResources(root, base = process.env.VITE_BASE || '/') {
  const read = name => JSON.parse(readFileSync(resolve(root, 'src/data', `${name}.json`), 'utf8'))
  const site = read('siteConfig')
  const scenes = read('sceneMusic')
  const playlist = read('playlist')
  const gallery = read('blackHoleGallery')
  const entries = [
    ['siteConfig.audio.backgroundTrackPath', site.audio.backgroundTrackPath, 'audio'],
    ...scenes.map(item => [`sceneMusic.${item.sectionId}.src`, item.src, 'audio']),
    ...playlist.map(item => [`playlist.${item.id}`, item.sourceType === 'local' ? item.src : item.link, item.sourceType === 'local' ? 'audio' : 'link']),
    ...gallery.map(item => [`blackHoleGallery.${item.id}.image`, item.image, 'image']),
    ...['point1', 'point2'].map(key => [`siteConfig.distanceMap.${key}.link`, site.distanceMap?.[key]?.link, 'link']),
  ]
  const report = { local: [], external: [], embedded: [], pending: [], errors: [] }
  const publicRoot = realpathSync(resolve(root, 'public'))
  const insidePublic = path => {
    const rel = relative(publicRoot, path)
    return rel !== '..' && !rel.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) && !isAbsolute(rel)
  }
  for (const [field, input, kind] of entries) {
    if (input === undefined || input === null || input === '') { report.pending.push(field); continue }
    if (typeof input !== 'string') { report.errors.push({ field, reason: 'La referencia debe ser texto.' }); continue }
    const value = input.trim()
    if (!value) { report.pending.push(field); continue }
    if (/^https?:\/\//i.test(value)) {
      try {
        if (!new URL(value).hostname) throw new Error()
        report.external.push({ field, value })
      } catch { report.errors.push({ field, reason: 'URL HTTP(S) inválida.' }) }
      continue
    }
    if (kind !== 'link' && value.startsWith(`data:${kind}/`)) { report.embedded.push(field); continue }
    if (kind === 'link' || /^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith('//') || value.includes('\\')) {
      report.errors.push({ field, reason: 'Usa una URL HTTP(S) o una ruta pública válida para archivos.' }); continue
    }
    try {
      const prefix = base.endsWith('/') ? base : `${base}/`
      const pathname = prefix !== '/' && value.startsWith(prefix) ? value.slice(prefix.length) : value
      const path = resolve(publicRoot, decodeURIComponent(pathname.split(/[?#]/)[0]).replace(/^\/+/, ''))
      if (!insidePublic(path) || !insidePublic(realpathSync(path)) || !statSync(path).isFile()) throw new Error()
      report.local.push({ field, path: relative(publicRoot, path).replaceAll('\\', '/') })
    } catch { report.errors.push({ field, reason: 'El archivo no existe dentro de public/.' }) }
  }
  return report
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const report = auditResources(resolve(dirname(fileURLToPath(import.meta.url)), '..'))
    console.log(JSON.stringify(report, null, 2))
    console.log(`Recursos: ${report.local.length} locales, ${report.external.length} externos sin verificar, ${report.embedded.length} embebidos, ${report.pending.length} pendientes, ${report.errors.length} errores.`)
    process.exitCode = report.errors.length ? 1 : 0
  } catch (error) {
    console.error(`No se pudo revisar la configuración: ${error.message}`)
    process.exitCode = 1
  }
}
