import { mkdtempSync, mkdirSync, writeFileSync, rmSync, realpathSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { auditResources } from '../../scripts/check-resources.mjs'

const folders = []
afterEach(() => {
  for (const folder of folders.splice(0)) {
    const target = realpathSync(folder)
    if (dirname(target) !== realpathSync(tmpdir()) || !basename(target).startsWith('distancia-resources-')) throw new Error('Destino temporal inesperado')
    rmSync(target, { recursive: true, force: true })
  }
})
function fixture(backgroundTrackPath = '') {
  const root = mkdtempSync(join(tmpdir(), 'distancia-resources-'))
  folders.push(root)
  mkdirSync(join(root, 'src/data'), { recursive: true })
  mkdirSync(join(root, 'public/audio'), { recursive: true })
  writeFileSync(join(root, 'src/data/siteConfig.json'), JSON.stringify({ audio: { backgroundTrackPath } }))
  for (const name of ['sceneMusic', 'playlist', 'blackHoleGallery']) writeFileSync(join(root, `src/data/${name}.json`), '[]')
  return root
}
describe('referencias de recursos de la plantilla', () => {
  it('admite pendientes y distingue archivos existentes de ausentes', () => {
    expect(auditResources(fixture()).errors).toEqual([])
    expect(auditResources(fixture('/audio/missing.wav')).errors).toHaveLength(1)
    const root = fixture('/audio/tema%20uno.wav?version=1')
    writeFileSync(join(root, 'public/audio/tema uno.wav'), 'fixture')
    expect(auditResources(root).local[0].path).toBe('audio/tema uno.wav')
  })
  it('rechaza rutas que salen de public y protocolos de documento', () => {
    for (const value of ['/../src/data/siteConfig.json', '/%2e%2e/src/data/siteConfig.json', 'javascript:alert(1)', '//example.com/audio.wav']) {
      expect(auditResources(fixture(value)).errors).toHaveLength(1)
    }
  })
  it('identifica enlaces externos sin acceder a la red', () => {
    const report = auditResources(fixture('https://example.com/audio.wav'))
    expect(report.external).toHaveLength(1)
    expect(report.errors).toEqual([])
  })
  it('admite una ruta ya prefijada por la base pública configurada', () => {
    const root = fixture('/DistanciaCero/audio/tema.wav')
    writeFileSync(join(root, 'public/audio/tema.wav'), 'fixture')
    expect(auditResources(root, '/DistanciaCero/').local[0].path).toBe('audio/tema.wav')
  })
})
