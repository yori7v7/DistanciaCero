import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { enableCentro, gotoApp } from './helpers'

test('los ajustes actualizan la experiencia, persisten y viajan en el respaldo', async ({ page }, testInfo) => {
  test.setTimeout(120_000)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route(/^https?:\/\/(?!localhost(?=[:/])|127\.0\.0\.1(?=[:/]))/, route => route.abort())
  await gotoApp(page)
  await enableCentro(page)
  await page.getByText('Ajustes generales', { exact: true }).click()
  const form = page.getByRole('form', { name: 'Ajustes generales' })
  const today = await page.evaluate(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  })
  await form.getByLabel('Tu nombre', { exact: true }).fill('Alex')
  await form.getByLabel('Nombre de tu pareja', { exact: true }).fill('Sam')
  await form.getByLabel('Nombre compartido', { exact: true }).fill('A + S')
  await form.getByLabel('Nombre en portada (opcional)', { exact: true }).fill('Mi estrella')
  for (const label of ['Día en que se conocieron', 'Inicio de la relación', 'Próximo encuentro']) {
    await form.getByLabel(label, { exact: true }).fill(today)
  }
  await form.getByRole('button', { name: 'Guardar ajustes', exact: true }).click()
  await expect(page.locator('#inicio h1')).toContainText('Mi estrella')
  await expect(page.locator('#inicio')).toContainText('Alex')
  await expect(page.locator('#inicio')).toContainText('Sam')
  await expect(page.locator('#contador .glass-card h3')).toHaveText(['0', '1', '0', '0'])

  await page.reload({ waitUntil: 'domcontentloaded' })
  await enableCentro(page)
  await page.getByText('Ajustes generales', { exact: true }).click()
  await expect(form.getByLabel('Tu nombre', { exact: true })).toHaveValue('Alex')
  await expect(page.locator('#inicio h1')).toContainText('Mi estrella')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exportar respaldo', exact: true }).click()
  const download = await downloadPromise
  expect(await download.failure()).toBeNull()
  const path = await download.path()
  expect(path).not.toBeNull()
  const raw = await readFile(path!, 'utf8')
  expect(JSON.parse(raw)).toMatchObject({ version: 2, settings: {
    couple: { yourName: 'Alex', herName: 'Sam', mainPairName: 'A + S' },
    hero: { titleName: 'Mi estrella' },
    dates: { metDate: today, relationshipStartDate: today, nextMeetingDate: today },
  } })
  await form.getByLabel('Tu nombre', { exact: true }).fill('Otro nombre')
  await form.getByRole('button', { name: 'Guardar ajustes', exact: true }).click()
  await expect(page.locator('#inicio')).toContainText('Otro nombre')
  page.once('dialog', dialog => dialog.accept())
  await page.getByLabel('Importar respaldo', { exact: true }).setInputFiles({
    name: 'ajustes-locales.json', mimeType: 'application/json', buffer: Buffer.from(raw),
  })
  await expect(page.getByText('Respaldo restaurado. Los cambios ya están disponibles.', { exact: true })).toBeVisible()
  await expect(form.getByLabel('Tu nombre', { exact: true })).toHaveValue('Alex')
  await expect(page.locator('#inicio')).toContainText('Alex')

  await page.setViewportSize({ width: 390, height: 844 })
  await form.scrollIntoViewIfNeeded()
  await expect(form.getByLabel('Próximo encuentro', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('ajustes-movil.png'), fullPage: false })
  expect(errors).toEqual([])
})
