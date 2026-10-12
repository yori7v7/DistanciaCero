import { expect, test } from '@playwright/test'
import { enableCentro } from './helpers'

test('lectores y CMS comparten simulación y reset sin recargar ni borrar cartas', async ({ page }, testInfo) => {
  test.setTimeout(60_000)
  const pageErrors: string[] = []
  const remoteRequests: string[] = []
  page.on('pageerror', error => pageErrors.push(error.message))
  await page.route(/https?:\/\/[^/]*supabase\.[^/]+\//, route => {
    remoteRequests.push(route.request().url())
    return route.abort()
  })
  // Fixtures only: every interaction being verified below uses the actual UI.
  await page.addInitScript(() => {
    if (sessionStorage.getItem('phase1-letter-fixtures')) return
    for (const collection of ['monthlyLetters', 'openWhenLetters']) {
      localStorage.setItem(`distancia-cero-content-${collection}`, JSON.stringify([
        { id: 'phase1-locked', month: 'Mes de prueba', mood: 'Momento de prueba', title: 'Carta bloqueada de prueba',
          content: ['Contenido simulado de prueba'], preview: 'Carta bloqueada', locked: true, isLocal: true },
        { id: 'phase1-open', month: 'Otro mes', mood: 'Otro momento', title: 'Carta disponible de prueba',
          content: ['Contenido disponible de prueba'], preview: 'Carta disponible', locked: false, isLocal: true },
      ]))
    }
    localStorage.setItem('distancia-cero-legacy-migrated-v1', '1')
    sessionStorage.setItem('phase1-letter-fixtures', '1')
  })

  await page.goto('/app#/cartas')
  await expect(page.locator('.loading-intro')).toBeHidden({ timeout: 15_000 })
  const readers = [page.locator('#cartas'), page.locator('#abrir-cuando')]
  for (const reader of readers) {
    await expect(reader.getByRole('heading', { name: 'Carta bloqueada de prueba' })).toBeVisible()
    await expect(reader.locator('article').filter({ hasText: 'Carta bloqueada de prueba' }).getByRole('button')).toBeDisabled()
  }

  await enableCentro(page)
  const controls = page.locator('#centro-universo .control-actions')
  await controls.getByRole('button', { name: 'Activar Modo Prueba', exact: true }).click()
  await expect(controls.getByRole('button', { name: 'Desactivar Modo Prueba', exact: true })).toBeVisible()
  for (const reader of readers) {
    await reader.getByRole('button', { name: 'Abrir (Sim)', exact: true }).click()
    await expect(reader.getByText('Contenido simulado de prueba')).toBeVisible()
  }
  await expect(page.locator('#centro-universo .stat-card').filter({ hasText: 'Abiertas' }).locator('strong')).toHaveText(['1', '1'])

  await controls.getByRole('button', { name: 'Desactivar Modo Prueba', exact: true }).click()
  for (const reader of readers) {
    await expect(reader.getByText('Contenido simulado de prueba')).toHaveCount(0)
    await expect(reader.locator('article').filter({ hasText: 'Carta bloqueada de prueba' }).getByRole('button')).toBeDisabled()
    await reader.locator('article').filter({ hasText: 'Carta disponible de prueba' }).getByRole('button').click()
    await expect(reader.getByText('Contenido disponible de prueba')).toBeVisible()
  }

  page.once('dialog', dialog => dialog.accept())
  await controls.getByRole('button', { name: 'Resetear Progreso' }).click()
  for (const reader of readers) {
    await expect(reader.getByText('Contenido disponible de prueba')).toHaveCount(0)
    await expect(reader.locator('.letters-counter')).toContainText('0 / 5')
    await expect(reader.getByRole('heading', { name: 'Carta disponible de prueba' })).toBeVisible()
  }
  await expect(page.locator('#centro-universo .stat-card').filter({ hasText: 'Abiertas' }).locator('strong')).toHaveText(['0', '0'])

  await readers[0].locator('article').filter({ hasText: 'Carta disponible de prueba' }).getByRole('button').click()
  await page.reload()
  await expect(readers[0].locator('article').filter({ hasText: 'Carta disponible de prueba' }).getByRole('button', { name: 'Releer carta' })).toBeVisible()
  await expect(readers[1].locator('article').filter({ hasText: 'Carta disponible de prueba' }).getByRole('button', { name: 'Abrir carta' })).toBeVisible()
  await readers[0].screenshot({ path: testInfo.outputPath('cartas-refactor.png') })
  expect(pageErrors).toEqual([])
  expect(remoteRequests).toEqual([])
})
