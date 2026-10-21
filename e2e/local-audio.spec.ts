import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { startAudioFixture } from './audio-fixture'

const sceneMusic = JSON.parse(readFileSync(new URL('../src/data/sceneMusic.json', import.meta.url), 'utf8'))
let audioFixture: Awaited<ReturnType<typeof startAudioFixture>>

test.beforeAll(async () => {
  audioFixture = await startAudioFixture([
    ...sceneMusic.map(scene => `/audio/e2e-${scene.sectionId}.wav`),
    '/audio/e2e-playlist-track.wav',
    '/audio/e2e-valid.wav',
  ])
})

test.afterAll(async () => {
  await audioFixture?.close()
})

async function mediaState(page: Page) {
  return page.evaluate(() => {
    const detached: HTMLAudioElement[] = (window as any).__localTestAudios || []
    return [...new Set([...detached, ...document.querySelectorAll('audio')])]
      .map(audio => ({ src: audio.src, paused: audio.paused, volume: audio.volume, ended: audio.ended }))
  })
}

test('audio real local: escena, playlist, pausa, volumen y salida no se solapan', async ({ page, browserName }) => {
  // WebKit on Windows needs a larger total budget for native audio plus the 3D scene.
  test.setTimeout(browserName === 'webkit' ? 240_000 : 90_000)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route(/^https?:\/\/(?!localhost(?=[:/])|127\.0\.0\.1(?=[:/]))/, route => route.abort())
  const fixtures = sceneMusic.map(scene => ({ ...scene, src: `${audioFixture.origin}/audio/e2e-${scene.sectionId}.wav` }))
  await page.route('**/src/data/sceneMusic.json*', route => route.fulfill({ contentType: 'application/javascript', body: `export default ${JSON.stringify(fixtures)}` }))
  await page.addInitScript(audioOrigin => {
    const NativeAudio = window.Audio
    ;(window as any).__localTestAudios = []
    ;(window as any).Audio = function (src?: string) {
      const audio = new NativeAudio(src)
      ;(window as any).__localTestAudios.push(audio)
      return audio
    }
    ;(window as any).Audio.prototype = NativeAudio.prototype
    localStorage.setItem('distancia-cero-content-playlist', JSON.stringify([
      { id: 'e2e-track', title: 'Canción local de prueba', sourceType: 'local', src: `${audioOrigin}/audio/e2e-playlist-track.wav`, isLocal: true },
    ]))
  }, audioFixture.origin)
  await page.goto('/')
  await page.getByRole('button', { name: 'Entrar al universo' }).click()
  await expect(page.locator('.loading-intro')).toBeHidden({ timeout: 15_000 })
  await page.locator('.scene-portal').getByRole('button', { name: 'Universo', exact: true }).click()
  const player = page.locator('.scene-music-controller')
  await expect(player.locator('.scene-music-info')).toContainText('Sistema solar')
  await player.getByRole('button', { name: 'Iniciar banda sonora' }).click()
  await expect.poll(async () => (await mediaState(page)).filter(audio => !audio.paused).length).toBe(1)
  await expect.poll(async () => (await mediaState(page)).find(audio => !audio.paused)?.src).toContain('e2e-universo.wav')
  const volume = player.getByRole('slider', { name: 'Volumen de la banda sonora' })
  await volume.focus()
  await volume.press('Home')
  await expect.poll(async () => (await mediaState(page)).find(audio => !audio.paused)?.volume).toBe(0)
  await player.getByRole('button', { name: 'Pausar', exact: true }).click()
  await expect.poll(async () => (await mediaState(page)).filter(audio => !audio.paused).length).toBe(0)
  await player.getByRole('button', { name: 'Reproducir', exact: true }).click()
  await expect.poll(async () => (await mediaState(page)).find(audio => !audio.paused)?.volume).toBe(0)
  await volume.press('End')
  await page.locator('.scene-portal').getByRole('button', { name: 'Música', exact: true }).click()
  await expect.poll(async () => (await mediaState(page)).find(audio => !audio.paused)?.src).toContain('e2e-playlist.wav')
  await page.locator('#playlist').getByRole('button', { name: /Canción local de prueba/ }).click()
  await expect.poll(async () => (await mediaState(page)).filter(audio => !audio.paused).length).toBe(1)
  await expect.poll(async () => (await mediaState(page)).find(audio => !audio.paused)?.src).toContain('e2e-playlist-track.wav')
  await expect(player.getByRole('button', { name: 'Reproducir', exact: true })).toBeVisible()
  await page.locator('.scene-portal').getByRole('button', { name: 'Cartas', exact: true }).click()
  await expect(player.locator('.scene-music-info')).toContainText('Cartas mensuales')
  await expect.poll(async () => (await mediaState(page)).filter(audio => !audio.paused).length).toBe(1)
  await expect.poll(async () => (await mediaState(page)).find(audio => !audio.paused)?.src).toContain('e2e-playlist-track.wav')
  await player.getByRole('button', { name: 'Reproducir', exact: true }).click()
  await expect.poll(async () => (await mediaState(page)).find(audio => !audio.paused)?.src).toContain('e2e-cartas.wav')
  await expect.poll(async () => (await mediaState(page)).filter(audio => !audio.paused).length).toBe(1)
  await page.goBack()
  await page.goBack()
  await page.goBack()
  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
  await expect.poll(async () => (await mediaState(page)).filter(audio => !audio.paused).length).toBe(0)
  expect(errors).toEqual([])
})

test('un archivo de playlist ausente muestra el error y permite reproducir otra canción', async ({ page }) => {
  await page.route(/^https?:\/\/(?!localhost(?=[:/])|127\.0\.0\.1(?=[:/]))/, route => route.abort())
  await page.addInitScript(audioOrigin => {
    localStorage.setItem('distancia-cero-content-playlist', JSON.stringify([
      { id: 'missing', title: 'Archivo ausente de prueba', sourceType: 'local', src: `${audioOrigin}/audio/e2e-missing.wav`, isLocal: true },
      { id: 'valid', title: 'Archivo válido de prueba', sourceType: 'local', src: `${audioOrigin}/audio/e2e-valid.wav`, isLocal: true },
    ]))
  }, audioFixture.origin)
  await page.goto('/app#/musica')
  await expect(page.locator('.loading-intro')).toBeHidden({ timeout: 15_000 })
  const playlist = page.locator('#playlist')
  await playlist.getByRole('button', { name: /Archivo ausente de prueba/ }).click()
  await expect(playlist.getByRole('status')).toContainText(/No se pudo/)
  await expect(playlist.locator('.audio-row-playing')).toHaveCount(0)
  await playlist.getByRole('button', { name: /Archivo válido de prueba/ }).click()
  await expect(playlist.getByRole('status')).toContainText('Reproduciendo: Archivo válido de prueba')
  await expect(playlist.locator('.audio-row-playing')).toHaveCount(1)
})
