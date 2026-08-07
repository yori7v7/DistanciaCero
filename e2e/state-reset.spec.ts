import { test, expect } from '@playwright/test'
import { gotoApp } from './helpers'

test.describe('?reset=1', () => {
  test('clears all localStorage and sessionStorage', async ({ page }) => {
    // Seed data without reset
    await page.goto('/app', { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => {
      localStorage.setItem('distancia-cero-content-reasons', JSON.stringify([
        { id: 'seed', title: 'Seed', isLocal: true },
      ]))
      localStorage.setItem('distancia-cero-active-scene', 'musica')
      localStorage.setItem('distancia-cero-centro-visible', 'true')
      sessionStorage.setItem('test-session', 'alive')
    })

    // Verify seeded data exists
    const before = await page.evaluate(() => ({
      reasons: localStorage.getItem('distancia-cero-content-reasons'),
      scene: localStorage.getItem('distancia-cero-active-scene'),
      centro: localStorage.getItem('distancia-cero-centro-visible'),
      session: sessionStorage.getItem('test-session'),
    }))
    expect(before.reasons).toContain('Seed')
    expect(before.scene).toBe('musica')
    expect(before.session).toBe('alive')

    // Navigate with ?reset=1 — accept the confirm dialog so storage is cleared
    page.once('dialog', dialog => dialog.accept())
    await page.goto('/?reset=1', { waitUntil: 'domcontentloaded' })

    // All storage should be empty
    const after = await page.evaluate(() => ({
      length: localStorage.length,
      sessionLength: sessionStorage.length,
    }))
    expect(after.length).toBe(0)
    expect(after.sessionLength).toBe(0)
  })

  test('resets to default scene after clearing', async ({ page }) => {
    // Seed non-default scene
    await page.goto('/app', { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => {
      localStorage.setItem('distancia-cero-active-scene', 'musica')
    })

    // Reset — accept the confirm dialog so storage is cleared
    page.once('dialog', dialog => dialog.accept())
    await page.goto('/?reset=1', { waitUntil: 'domcontentloaded' })

    // Should land on landing page (route /), not /app
    await expect(page.locator('h1')).toContainText('Para ti,')

    // Navigate to /app — default scene should be active (Inicio)
    const enterBtn = page.getByRole('button', { name: 'Entrar al universo' })
    await enterBtn.click()
    await expect(page).toHaveURL(/\/app/)

    // Active scene should be default ('inicio' or first non-centro scene)
    const activeScene = await page.evaluate(() =>
      localStorage.getItem('distancia-cero-active-scene')
    )
    // After reset, there's no stored scene, so it defaults to whatever
    // getInitialSceneId returns — typically 'inicio'
    expect(activeScene === null || activeScene === 'inicio').toBeTruthy()
  })
})
