import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { startAudioFixture } from './audio-fixture'

const config = JSON.parse(readFileSync(new URL('../src/data/siteConfig.json', import.meta.url), 'utf8'))
let fixture: Awaited<ReturnType<typeof startAudioFixture>>
test.beforeAll(async () => { fixture = await startAudioFixture(['/audio/e2e-hero.wav']) })
test.afterAll(async () => { await fixture?.close() })
test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!localhost(?=[:/])|127\.0\.0\.1(?=[:/]))/, route => route.abort())
  await page.addInitScript(() => sessionStorage.setItem('distancia-cero-intro-seen', 'true'))
})

test('Hero: la plantilla conserva controles claros y el enlace abre Universo con teclado', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/app')
  const hero = page.locator('#inicio')
  await expect(hero.getByRole('heading', { level: 1 })).toContainText('nuestro universo')
  await expect(hero.locator('.hero-couple-names')).toHaveText('Nosotros')
  await expect(hero.getByRole('button', { name: 'Añade una canción de fondo', exact: true })).toBeDisabled()
  const enter = hero.getByRole('link', { name: 'Entrar al universo', exact: true })
  await expect(enter).toBeInViewport({ ratio: 1 })
  await expect(enter).toHaveAttribute('href', '#/universo')
  // Pointer focus must not move the link away before the matching mouseup.
  await page.evaluate(() => {
    const link = document.querySelector('#inicio .main-button')!
    const navBottom = document.querySelector('.scene-portal')!.getBoundingClientRect().bottom
    window.scrollTo({ top: window.scrollY + link.getBoundingClientRect().top - navBottom - 4, behavior: 'instant' })
  })
  const edge = (await enter.boundingBox())!
  await page.mouse.click(edge.x + edge.width / 2, edge.y + 8)
  await expect(page).toHaveURL(/#\/universo$/)
  await expect(page.locator('#universo')).toBeVisible({ timeout: 20000 })
  await page.locator('.scene-portal').getByRole('button', { name: 'Inicio', exact: true }).click()
  await expect(hero).toBeVisible()
  await enter.focus()
  await expect(enter).toBeFocused()
  await enter.press('Enter')
  await expect(page).toHaveURL(/#\/universo$/)
  await expect(page.locator('#universo')).toBeVisible({ timeout: 20000 })
  await expect(hero).toBeHidden()
})

test('Hero: nombres largos y texto ampliado conservan el contenido y el foco', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('distancia-cero-site-settings', JSON.stringify({
    couple: { yourName: 'A'.repeat(80), herName: 'B'.repeat(80) }, hero: { titleName: 'Universo'.repeat(10) },
  })))
  await page.goto('/app')
  const hero = page.locator('#inicio')
  const heading = hero.getByRole('heading', { level: 1 })
  await expect(heading).toContainText('Universo'.repeat(10))
  await expect(hero.locator('.hero-couple-names')).toContainText('A'.repeat(80))
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await expect.poll(() => hero.evaluate(e => e.scrollWidth - e.clientWidth)).toBeLessThanOrEqual(1)
    await expect(heading).toBeVisible()
  }
  await page.setViewportSize({ width: 375, height: 812 })
  const enter = hero.getByRole('link', { name: 'Entrar al universo', exact: true })
  // Establish keyboard input before testing the keyboard-only focus correction.
  await page.keyboard.press('Tab')
  await enter.focus()
  // Enlarging text changes the measured navigation height while focus stays put.
  await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
  await expect(enter).toBeInViewport({ ratio: 1 })
  await expect.poll(() => enter.evaluate(e => e.getBoundingClientRect().top - document.querySelector('.scene-portal')!.getBoundingClientRect().bottom)).toBeGreaterThanOrEqual(0)
  await expect.poll(() => hero.evaluate(e => e.scrollWidth - e.clientWidth)).toBeLessThanOrEqual(1)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(hero.locator('.hero-couple-names svg')).toHaveCSS('animation-name', 'none')
})

test('Hero: una fuente local configurada permite activar y pausar el fondo', async ({ page, browserName }) => {
  test.setTimeout(browserName === 'webkit' ? 90000 : 45000)
  const track = `${fixture.origin}/audio/e2e-hero.wav`
  await page.route('**/src/data/siteConfig.json*', route => route.fulfill({
    contentType: 'application/javascript', body: `export default ${JSON.stringify({ ...config, audio: { ...config.audio, backgroundTrackPath: track } })}`,
  }))
  await page.route('**/src/data/randomPhrases.json*', route => route.fulfill({
    contentType: 'application/javascript', body: 'export default [{"text":"Una frase de prueba para nuestro universo."}]',
  }))
  await page.addInitScript(() => {
    const NativeAudio = window.Audio
    ;(window as any).__heroAudios = []
    ;(window as any).Audio = function (src?: string) {
      const audio = new NativeAudio(src)
      ;(window as any).__heroAudios.push(audio)
      return audio
    }
    ;(window as any).Audio.prototype = NativeAudio.prototype
  })
  await page.goto('/app')
  const hero = page.locator('#inicio')
  await expect(hero.locator('.hero-daily-phrase')).toContainText('Una frase de prueba')
  const activeCount = () => page.evaluate(() => (window as any).__heroAudios.filter((a: HTMLAudioElement) => !a.paused).length)
  await hero.getByRole('button', { name: 'Activar música de fondo', exact: true }).click()
  await expect(hero.getByRole('button', { name: 'Pausar música de fondo', exact: true })).toBeVisible()
  await expect.poll(activeCount).toBe(1)
  await hero.getByRole('button', { name: 'Pausar música de fondo', exact: true }).click()
  await expect.poll(activeCount).toBe(0)
  await expect(hero.getByRole('button', { name: 'Activar música de fondo', exact: true })).toBeVisible()
})
