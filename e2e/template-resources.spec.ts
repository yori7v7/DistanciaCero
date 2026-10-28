import { expect, test } from '@playwright/test'
import { gotoApp } from './helpers'

test('la plantilla muestra recursos pendientes sin enlaces falsos ni audio ausente', async ({ page }, testInfo) => {
  test.setTimeout(90_000)
  const errors: string[] = []
  const missingAudio: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('request', request => { if (request.url().includes('/audio/background.mp3')) missingAudio.push(request.url()) })
  await page.route(/^https?:\/\/(?!localhost(?=[:/])|127\.0\.0\.1(?=[:/]))/, route => route.abort())
  await page.goto('/')
  await expect(page.getByText('Un espacio para compartir su historia, a su ritmo.', { exact: true })).toBeVisible()
  await gotoApp(page)
  await expect(page.locator('#inicio').getByRole('button', { name: /canción de fondo/ })).toBeDisabled()
  await expect(page.locator('#pregunta-oficial')).toContainText('Puedes seguir explorando el universo a tu ritmo.')
  await page.locator('#pregunta-oficial').getByRole('button', { name: 'Hablemos', exact: true }).click()
  await expect(page.locator('#pregunta-oficial')).toContainText('El universo sigue disponible para explorar.')
  await page.locator('.scene-portal').getByRole('button', { name: 'Música', exact: true }).click()
  await expect(page.locator('#playlist').getByRole('button', { name: 'Reproducir ambiente', exact: true })).toBeDisabled()
  const rows = page.locator('#playlist .playlist-button-row')
  await expect(rows).toHaveCount(5)
  for (const row of await rows.all()) await expect(row).toBeDisabled()
  await expect(rows.first()).toContainText('Nuestra canción')
  await page.locator('.scene-portal').getByRole('button', { name: 'Distancia cero', exact: true }).click()
  await expect(page.locator('#distancia')).toBeVisible()
  await expect(page.locator('#distancia a')).toHaveCount(0)
  await expect(page.locator('#distancia')).toContainText('Distancia pendiente')
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('mapa-pendiente-movil.png') })
  expect(missingAudio).toEqual([])
  expect(errors).toEqual([])
})
