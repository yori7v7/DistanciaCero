import { test, expect } from '@playwright/test'
import type { Locator } from '@playwright/test'
import { gotoApp, enableCentro } from './helpers'

test.describe('App Navigation', () => {
  test('scene portal shows all navigation buttons', async ({ page }) => {
    await gotoApp(page)

    const sceneLabels = [
      'Inicio', 'Universo', 'Diario', 'Agujero negro',
      '100 razones', 'Cartas', 'Música', 'Promesas', 'Distancia cero',
    ]

    const portal = page.locator('.scene-portal')
    await expect(portal).toBeVisible()

    for (const label of sceneLabels) {
      // Use exact:true to avoid matching the logo button also named "Inicio"
      await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible()
    }
  })

  test('hero section visible on load, inactive sections are hidden', async ({ page }) => {
    await gotoApp(page)

    // Hero visible — default scene "inicio" sections are active
    await expect(page.locator('#inicio')).toBeVisible()

    // Sections not in the default scene should have scene-hidden class
    // or not be visible. #hero itself is always present.
    const hiddenSections = page.locator('.scene-hidden')
    const count = await hiddenSections.count()
    expect(count).toBeGreaterThan(0)
  })

  test('clicking a scene portal button switches scenes', async ({ page }) => {
    await gotoApp(page)

    // Navigate to Música
    const musicaBtn = page.getByRole('button', { name: 'Música', exact: true })
    await musicaBtn.click()

    // Playlist section should become visible
    await expect(page.locator('#playlist')).toBeVisible({ timeout: 10_000 })

    // Scene stored in localStorage
    const scene = await page.evaluate(() => localStorage.getItem('distancia-cero-active-scene'))
    expect(scene).toBe('musica')
  })

  test('can access Centro del Universo CMS', async ({ page }) => {
    await gotoApp(page)
    await enableCentro(page)

    // CMS heading visible (use role to avoid ambiguity with button label)
    await expect(page.getByRole('heading', { name: 'Centro del Universo' })).toBeVisible()
  })
})

test.describe('Pulido de navegación', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/^https?:\/\/(?!localhost(?=[:/])|127\.0\.0\.1(?=[:/]))/, route => route.abort())
    await page.addInitScript(() => sessionStorage.setItem('distancia-cero-intro-seen', 'true'))
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/app')
    await expect(page.locator('#inicio')).toBeVisible()
  })

  async function expectWholeFocus(link: Locator) {
    await expect(link).toBeFocused()
    await expect.poll(() => link.evaluate(element => {
      const rect = element.getBoundingClientRect()
      const parent = element.parentElement!.getBoundingClientRect()
      const style = getComputedStyle(element)
      const ring = parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset)
      if (!element.matches(':focus-visible') || style.outlineStyle === 'none') return -1000
      return Math.min(rect.left - parent.left, parent.right - rect.right,
        rect.top - parent.top, parent.bottom - rect.bottom) - ring
    })).toBeGreaterThanOrEqual(-0.5)
  }

  test('Tab y Shift+Tab muestran cada escena completa en la barra adaptable', async ({ page }) => {
    const links = page.locator('.scene-link')
    await page.keyboard.press('Tab')
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 812 })
      await links.first().focus()
      for (let index = 0; index < await links.count(); index++) {
        await expectWholeFocus(links.nth(index))
        if (index < await links.count() - 1) await page.keyboard.press('Tab')
      }
      for (let index = await links.count() - 2; index >= 0; index--) {
        await page.keyboard.press('Shift+Tab')
        await expectWholeFocus(links.nth(index))
      }
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
      if (width <= 900) {
        const gap = await page.locator('.scene-portal-links').evaluate(element =>
          document.querySelector('.scene-portal-actions')!.getBoundingClientRect().top - element.getBoundingClientRect().bottom)
        expect(gap).toBeGreaterThanOrEqual(0)
      }
    }
    await links.last().focus()
    await links.last().press('Enter')
    await expect(page).toHaveURL(/#\/distancia$/)
    await expect(links.last()).toHaveAttribute('aria-current', 'page')
    await page.getByRole('button', { name: 'Escena siguiente', exact: true }).press('Enter')
    await expect(page).toHaveURL(/#\/inicio$/)
    await page.goBack()
    await expect(links.last()).toHaveAttribute('aria-current', 'page')
    await page.getByRole('button', { name: 'Escena anterior', exact: true }).press('Enter')
    await expect(page).toHaveURL(/#\/promesas$/)
  })

  test('Ajustes conserva pulsación, foco y contenido con texto al 200 %', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
    const settings = page.getByRole('button', { name: 'Ajustes', exact: true })
    await page.keyboard.press('Tab')
    await settings.focus()
    await settings.press('Enter')
    const menu = page.locator('.scene-settings-dropdown')
    const close = menu.getByRole('button', { name: 'Cerrar', exact: true })
    await expect(close).toBeFocused()
    await menu.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)))
    const box = (await close.boundingBox())!
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.height).toBeGreaterThanOrEqual(44)
    await expect(menu).toBeInViewport({ ratio: 1 })
    await expect.poll(() => menu.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1)
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(settings).toBeFocused()
    await settings.press('Enter')
    await close.press('Tab')
    const centro = menu.getByRole('button', { name: /Centro del Universo/ })
    await expect(centro).toBeFocused()
    await centro.press('Enter')
    await expect(settings).toBeFocused()
    await expect(settings).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('#centro-universo')).toBeVisible()
    await settings.press('Enter')
    await close.press('Enter')
    await expect(settings).toBeFocused()
    await expect(menu).toBeHidden()
  })
})
