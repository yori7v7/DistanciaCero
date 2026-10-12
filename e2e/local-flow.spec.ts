import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'

const scenes = JSON.parse(readFileSync(new URL('../src/data/scenes.json', import.meta.url), 'utf8'))

async function ready(page: Page) {
  await expect(page.locator('.loading-intro')).toBeHidden({ timeout: 15_000 })
  await expect(page.locator('.scene-portal')).toBeVisible()
}

test.describe('Recorridos locales y navegación', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/^https?:\/\/(?!localhost(?=[:/])|127\.0\.0\.1(?=[:/]))/, route => route.abort())
  })

  test('landing, todas las escenas, historial y ajustes conservados al recargar', async ({ page }, testInfo) => {
    test.setTimeout(90_000)
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/')
    await page.getByRole('button', { name: 'Entrar al universo' }).click()
    await ready(page)
    for (const scene of scenes.filter(scene => scene.id !== 'centro-universo')) {
      const button = page.locator('.scene-portal').getByRole('button', { name: scene.label, exact: true })
      await button.click()
      await expect(page).toHaveURL(new RegExp(`/app#/` + scene.id + '$'))
      await expect(button).toHaveClass(/\bactive\b/)
      for (const id of scene.sectionIds) {
        await expect(page.locator(`#${id}`)).toBeVisible()
        await expect(page.locator(`#${id}`)).toHaveAttribute('aria-hidden', 'false')
      }
    }
    await page.goBack()
    await expect(page).toHaveURL(/\/app#\/promesas$/)
    await expect(page.locator('#promesas')).toBeVisible()
    await page.goForward()
    await expect(page).toHaveURL(/\/app#\/distancia$/)

    await page.getByRole('button', { name: 'Ajustes' }).click()
    await page.getByRole('button', { name: /Centro del Universo/ }).click()
    await expect(page.locator('#centro-universo')).toBeVisible()
    await page.reload()
    await ready(page)
    await expect(page.locator('#distancia')).toBeVisible()
    await expect(page.locator('#centro-universo')).toBeVisible()
    await page.getByRole('button', { name: 'Ajustes' }).click()
    await page.getByRole('button', { name: /Centro del Universo/ }).click()
    await expect(page.locator('#centro-universo')).toBeHidden()
    await page.screenshot({ path: testInfo.outputPath('navegacion-local.png') })
    expect(errors).toEqual([])
  })

  test('el hash directo prevalece, carga una escena lazy y admite el formato antiguo', async ({ page }) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem('distancia-cero-active-scene')) localStorage.setItem('distancia-cero-active-scene', 'musica')
    })
    await page.goto('/app#/universo')
    await ready(page)
    await expect(page.locator('#universo')).toBeVisible()
    await expect(page.locator('.scene-music-info')).toContainText('Sistema solar')
    await expect(page.locator('#playlist')).toBeHidden()
    await page.goto('/app#cartas')
    await ready(page)
    await expect(page).toHaveURL(/\/app#\/cartas$/)
    await expect(page.locator('#cartas')).toBeVisible()
    await page.goto('/app#/desconocida')
    await ready(page)
    await expect(page).toHaveURL(/\/app#\/cartas$/)
    await expect(page.locator('#cartas')).toBeVisible()
  })
})
