import { test, expect } from '@playwright/test'
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
