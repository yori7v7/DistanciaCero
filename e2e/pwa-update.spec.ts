import { expect, test, type Page } from '@playwright/test'
import { enableCentro } from './helpers'

const title = 'Promesa conservada entre versiones'
const contentKey = 'distancia-cero-content-promises'
const progressKey = 'distancia-cero-monthly-letter-m1'
const volumeKey = 'distancia-cero-scene-music-volume'

async function storedData(page: Page) {
  return page.evaluate(({ contentKey, progressKey, volumeKey }) => ({
    content: localStorage.getItem(contentKey),
    progress: localStorage.getItem(progressKey),
    volume: localStorage.getItem(volumeKey),
    cms: localStorage.getItem('distancia-cero-centro-visible'),
    identity: localStorage.getItem('distancia-cero-local-current-user'),
    space: localStorage.getItem('distancia-cero-local-current-space'),
  }), { contentKey, progressKey, volumeKey })
}

async function cachePaths(page: Page) {
  return page.evaluate(async () => {
    const names = await caches.keys()
    const requests = await Promise.all(names.filter(name => name.startsWith('workbox-precache'))
      .map(async name => (await (await caches.open(name)).keys()).map(request => new URL(request.url).pathname)))
    return requests.flat().sort()
  })
}

test('PWA A → B: actualiza documento y lazy chunks sin perder datos, y B funciona offline', async ({ page, context, request }, testInfo) => {
  const errors: string[] = []
  const brokenAssets: string[] = []
  const remoteRequests: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  context.on('response', response => {
    if (response.status() >= 400 && new URL(response.url()).pathname.startsWith('/assets/')) {
      brokenAssets.push(`${response.status()} ${response.url()}`)
    }
  })
  await context.route(/^https?:\/\/(?!127\.0\.0\.1:4175(?:\/|$))/, route => {
    if (route.request().url().includes('supabase.')) remoteRequests.push(route.request().url())
    return route.abort()
  })
  const initial = await request.post('/__pwa_test__/release/A')
  expect(initial.ok()).toBe(true)
  const { releases } = await initial.json()
  expect(releases.A.entry).not.toBe(releases.B.entry)
  expect(releases.A.lazy).not.toBe(releases.B.lazy)
  expect(releases.A.swHash).not.toBe(releases.B.swHash)

  await page.goto('/app#/cartas')
  await expect(page.locator('html')).toHaveAttribute('data-pwa-test-release', 'A')
  await expect(page.locator('.loading-intro')).toBeHidden({ timeout: 15_000 })
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)
  const letter = page.locator('#cartas article').filter({ hasText: 'El comienzo de todo' })
  await letter.getByRole('button', { name: 'Abrir carta', exact: true }).click()
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key), progressKey)).toBe('opened')
  const volume = page.getByRole('slider', { name: 'Volumen de la banda sonora' })
  await volume.focus()
  await volume.press('Home')
  await expect(volume).toHaveValue('0')
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key), volumeKey)).toBe('0')

  await enableCentro(page)
  const cms = page.locator('#centro-universo')
  await cms.locator('.crud-central-shell').getByRole('button', { name: 'Promesas', exact: true }).click()
  await cms.getByRole('button', { name: 'Tus creaciones', exact: true }).click()
  const editor = page.locator('#local-promises-editor')
  await expect(editor.locator('.editor-form')).toBeVisible()
  await page.locator('#promises-title').fill(title)
  await page.locator('#promises-text').fill('Contenido sintético guardado desde el CMS en A.')
  await page.locator('#promises-tag').fill('Prueba PWA')
  await editor.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key), contentKey)).toContain(title)
  await page.locator('.scene-portal').getByRole('button', { name: 'Promesas', exact: true }).click()
  await expect(page.locator('#promesas').getByRole('heading', { name: title })).toBeVisible()
  await expect(page).toHaveURL(/#\/promesas$/)
  const before = await storedData(page)
  const beforeOrigin = await page.evaluate(() => performance.timeOrigin)
  const beforeCache = await cachePaths(page)
  expect(beforeCache).toContain(`/assets/${releases.A.lazy}`)
  // This lazy scene has not been mounted/requested by the document in A.
  expect(await page.evaluate(() => performance.getEntriesByType('resource').some(entry => entry.name.includes('StoryTimeline-')))).toBe(false)
  await page.evaluate(async () => {
    const cache = await caches.open('pwa-test-unrelated')
    await cache.put('/pwa-test-unrelated', new Response('conservar'))
    const worker = navigator.serviceWorker.controller
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (navigator.serviceWorker.controller !== worker) sessionStorage.setItem('pwa-test-controller-changed', 'true')
    })
  })

  expect((await request.post('/__pwa_test__/release/B')).ok()).toBe(true)
  // Ask the browser to check now, without waiting for its update schedule.
  // Do not force skipWaiting, unregister, clear caches, reload, or reseed data.
  await page.evaluate(async () => { await (await navigator.serviceWorker.ready).update() })
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('pwa-test-controller-changed')), { timeout: 30_000 }).toBe('true')
  await testInfo.attach('pwa-activation-evidence', {
    body: JSON.stringify({ releases, beforeOrigin, currentOrigin: await page.evaluate(() => performance.timeOrigin),
      documentRelease: await page.locator('html').getAttribute('data-pwa-test-release'),
      cachePaths: await cachePaths(page) }, null, 2), contentType: 'application/json',
  })
  await expect(page.locator('html')).toHaveAttribute('data-pwa-test-release', 'B', { timeout: 30_000 })
  await expect.poll(() => page.evaluate(() => performance.timeOrigin)).not.toBe(beforeOrigin)
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('pwa-test-controller-changed'))).toBe('true')
  await expect(page).toHaveURL(/#\/promesas$/)
  await expect(page.locator('#promesas').getByRole('heading', { name: title })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Volumen de la banda sonora' })).toHaveValue('0')
  expect(await storedData(page)).toEqual(before)
  await expect.poll(() => cachePaths(page)).toContain(`/assets/${releases.B.lazy}`)
  await expect.poll(() => cachePaths(page)).not.toContain(`/assets/${releases.A.lazy}`)
  await expect.poll(() => cachePaths(page)).not.toContain(`/assets/${releases.A.entry}`)
  expect(await page.evaluate(async () => (await (await caches.open('pwa-test-unrelated')).match('/pwa-test-unrelated'))?.text())).toBe('conservar')

  await context.setOffline(true)
  await page.locator('.scene-portal').getByRole('button', { name: 'Diario', exact: true }).click()
  await expect(page.locator('#historia').getByRole('heading', { name: 'Diario de prueba B', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-pwa-test-release', 'B')
  await expect(page.locator('#historia').getByRole('heading', { name: 'Diario de prueba B', exact: true })).toBeVisible()
  await page.goto('/app#/cartas')
  await expect(page.locator('#cartas article').filter({ hasText: 'El comienzo de todo' })
    .getByRole('button', { name: 'Releer carta', exact: true })).toBeVisible()
  await page.goto('/')
  await page.getByRole('button', { name: 'Entrar al universo' }).click()
  await expect(page.locator('#cartas')).toBeVisible()
  expect(await storedData(page)).toEqual(before)
  expect(errors).toEqual([])
  expect(brokenAssets).toEqual([])
  expect(remoteRequests).toEqual([])
  await testInfo.attach('pwa-update-evidence', {
    body: JSON.stringify({ releases, before, after: await storedData(page), beforeOrigin,
      afterOrigin: await page.evaluate(() => performance.timeOrigin), beforeCache,
      afterCache: await cachePaths(page), errors, brokenAssets, remoteRequests }, null, 2),
    contentType: 'application/json',
  })
  await context.setOffline(false)
})
