import { expect, test } from '@playwright/test'

test('preview: service worker, recarga y navegación local sin conexión conservan contenido', async ({ page, context }, testInfo) => {
  test.setTimeout(90_000)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/app#/cartas')
  await expect(page.locator('.loading-intro')).toBeHidden({ timeout: 15_000 })
  await expect(page.locator('#cartas')).toBeVisible()
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await page.reload()
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)
  await page.evaluate(() => {
    localStorage.setItem('distancia-cero-content-promises', JSON.stringify([
      { id: 'offline-promise', title: 'Promesa guardada sin conexión', text: 'Contenido sintético conservado.', isLocal: true },
    ]))
  })
  await context.setOffline(true)
  await page.reload()
  await expect(page.locator('#cartas')).toBeVisible()
  await page.locator('.scene-portal').getByRole('button', { name: 'Promesas', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Promesa guardada sin conexión' })).toBeVisible()
  await page.goto('/app#/historia')
  await expect(page.locator('#historia')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('preview-offline.png') })
  await page.goto('/')
  await page.getByRole('button', { name: 'Entrar al universo' }).click()
  await expect(page.locator('#historia')).toBeVisible()
  expect(errors).toEqual([])
  await context.setOffline(false)
})
