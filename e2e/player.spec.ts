import { expect, test, type Locator } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { startAudioFixture } from './audio-fixture'

const config = JSON.parse(readFileSync(new URL('../src/data/sceneMusic.json', import.meta.url), 'utf8'))
let fixture: Awaited<ReturnType<typeof startAudioFixture>>
test.beforeAll(async () => { fixture = await startAudioFixture(['/audio/e2e-player.wav']) })
test.afterAll(async () => { await fixture?.close() })
test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!localhost(?=[:/])|127\.0\.0\.1(?=[:/]))/, route => route.abort())
  await page.addInitScript(() => sessionStorage.setItem('distancia-cero-intro-seen', 'true'))
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

async function expectTextFits(element: Locator) {
  await expect.poll(() => element.evaluate(node => {
    const range = document.createRange()
    range.selectNodeContents(node)
    const text = range.getBoundingClientRect()
    const box = node.getBoundingClientRect()
    return Math.max(box.left - text.left, text.right - box.right)
  })).toBeLessThanOrEqual(0.5)
}

test('Reproductor: plantilla y metadatos largos se ajustan con texto ampliado', async ({ page }) => {
  await page.route('**/src/data/sceneMusic.json*', route => route.fulfill({
    contentType: 'application/javascript', body: `export default ${JSON.stringify(config.map(scene => ({
      ...scene, label: 'L'.repeat(80), title: 'T'.repeat(120), artist: 'A'.repeat(80),
    })))}`,
  }))
  await page.goto('/app')
  const player = page.getByRole('region', { name: 'Banda sonora', exact: true })
  await expect(player).toBeVisible()
  await expect(player.locator('strong')).toHaveText('T'.repeat(120))
  await expect(player.getByRole('button', { name: 'Iniciar banda sonora' })).toBeDisabled()
  await expect(player.getByRole('slider', { name: 'Progreso de la canción' })).toBeDisabled()
  await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
  const volume = player.getByRole('slider', { name: 'Volumen de la banda sonora' })
  await page.keyboard.press('Tab')
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 812 })
    await volume.focus()
    await volume.press('End')
    await expect(volume).toHaveAttribute('aria-valuetext', '100%')
    await expect.poll(() => player.evaluate(e => e.scrollWidth - e.clientWidth)).toBeLessThanOrEqual(1)
    await expectTextFits(player.locator('.scene-music-volume span'))
    await expectTextFits(player.locator('.scene-music-progress span').first())
    await expect(volume).toBeInViewport({ ratio: 1 })
    await expect.poll(() => volume.evaluate(e => e.getBoundingClientRect().top - document.querySelector('.scene-portal')!.getBoundingClientRect().bottom)).toBeGreaterThanOrEqual(0)
  }
  const play = player.getByRole('button', { name: 'Iniciar banda sonora' })
  await play.hover({ force: true })
  await expect(play).toHaveCSS('transform', 'none')
  await expect(play).toHaveCSS('cursor', 'not-allowed')
})

test('Reproductor: teclado, silencio y progreso pertenecen a la escena visible', async ({ page }) => {
  test.setTimeout(60000)
  await page.route('**/src/data/sceneMusic.json*', route => route.fulfill({
    contentType: 'application/javascript', body: `export default ${JSON.stringify(config.map(scene => ({
      ...scene, src: scene.sectionId === 'inicio' ? `${fixture.origin}/audio/e2e-player.wav` : '',
    })))}`,
  }))
  await page.goto('/app')
  const player = page.getByRole('region', { name: 'Banda sonora', exact: true })
  const audio = player.locator('audio')
  await player.getByRole('button', { name: 'Iniciar banda sonora' }).click()
  await expect(player.getByRole('button', { name: 'Pausar', exact: true })).toBeVisible()
  const progress = player.getByRole('slider', { name: 'Progreso de la canción' })
  await expect(progress).toBeEnabled()
  await expect(progress).toHaveAttribute('max', '300')
  await player.getByRole('button', { name: 'Pausar', exact: true }).click()
  await page.keyboard.press('Tab')
  await progress.focus()
  await progress.press('Home')
  await progress.press('ArrowRight')
  await expect.poll(() => audio.evaluate((e: HTMLAudioElement) => e.currentTime)).toBeGreaterThan(0)
  const mute = player.getByRole('button', { name: 'Silenciar banda sonora', exact: true })
  await mute.focus()
  await mute.press('Space')
  await expect(mute).toHaveAttribute('aria-pressed', 'true')
  await expect(player.getByRole('slider', { name: 'Volumen de la banda sonora' })).toHaveAttribute('aria-valuetext', '0%')
  await mute.press('Space')
  await expect(mute).toHaveAttribute('aria-pressed', 'false')
  const previousTime = await audio.evaluate((e: HTMLAudioElement) => e.currentTime)
  await page.locator('.scene-portal').getByRole('button', { name: 'Cartas', exact: true }).click()
  await expect(player.getByRole('status')).toContainText('Esta escena aún no tiene audio')
  await expect(progress).toBeDisabled()
  await expect(progress).toHaveAttribute('aria-valuetext', '0:00 de 0:00')
  await expect.poll(() => audio.evaluate((e: HTMLAudioElement) => e.currentTime)).toBe(previousTime)
  await page.locator('.scene-portal').getByRole('button', { name: 'Inicio', exact: true }).click()
  await expect(progress).toBeEnabled()
  await expect(progress).toHaveAttribute('max', '300')
  await expect.poll(() => audio.evaluate((e: HTMLAudioElement) => e.paused)).toBe(true)
  await player.getByRole('button', { name: 'Reproducir', exact: true }).click()
  await expect.poll(() => audio.evaluate((e: HTMLAudioElement) => e.paused)).toBe(false)
  await player.getByRole('button', { name: 'Pausar', exact: true }).click()
})

test('Reproductor: un archivo ausente se comunica y otra escena permite recuperarse', async ({ page }) => {
  test.setTimeout(60000)
  await page.route('**/src/data/sceneMusic.json*', route => route.fulfill({
    contentType: 'application/javascript', body: `export default ${JSON.stringify(config.map(scene => ({
      ...scene, src: `${fixture.origin}/audio/${scene.sectionId === 'inicio' ? 'missing.wav' : 'e2e-player.wav'}`,
    })))}`,
  }))
  await page.goto('/app')
  const player = page.getByRole('region', { name: 'Banda sonora', exact: true })
  await player.getByRole('button', { name: 'Iniciar banda sonora' }).click()
  await expect(player.getByRole('status')).toContainText('No se pudo cargar esta escena')
  await expect(player.getByRole('slider', { name: 'Progreso de la canción' })).toBeDisabled()
  await page.locator('.scene-portal').getByRole('button', { name: 'Cartas', exact: true }).click()
  await player.getByRole('button', { name: 'Reproducir', exact: true }).click()
  await expect(player.getByRole('button', { name: 'Pausar', exact: true })).toBeVisible()
  await expect.poll(() => player.locator('audio').evaluate((e: HTMLAudioElement) => e.paused)).toBe(false)
  await player.getByRole('button', { name: 'Pausar', exact: true }).click()
})
