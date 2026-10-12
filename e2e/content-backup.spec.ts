import { readFile } from 'node:fs/promises'
import { expect, test, type Dialog, type Page } from '@playwright/test'
import { enableCentro } from './helpers'

interface BackupItem {
  id: string | number
  title: string
  isLocal: boolean
  [key: string]: unknown
}

interface Backup {
  version: number
  content: Record<string, BackupItem[]>
  overrides: Record<string, Record<string, Record<string, unknown>>>
  hidden: Record<string, string[]>
}

const collections = [
  { name: 'reasons', label: 'Razones', panel: 'reasons', baseId: '1', hiddenId: '2' },
  { name: 'promises', label: 'Promesas', panel: 'promises', baseId: '1', hiddenId: '2' },
  { name: 'importantDates', label: 'Fechas', panel: 'dates', baseId: '1', hiddenId: '2' },
  { name: 'futureDreams', label: 'Sueños', panel: 'dreams', baseId: '1', hiddenId: '2' },
  { name: 'timeline', label: 'Historia', panel: 'timeline', baseId: 'capitulo-1', hiddenId: 'capitulo-2' },
  { name: 'blackHoleGallery', label: 'Galería', panel: 'blackhole', baseId: '1', hiddenId: '2' },
  { name: 'playlist', label: 'Música', panel: 'playlist', baseId: 'song-1', hiddenId: 'song-2' },
  { name: 'monthlyLetters', label: 'Cartas', panel: 'monthly', baseId: 'm1', hiddenId: 'm2' },
  { name: 'openWhenLetters', label: 'Abrir cuando', panel: 'openwhen', baseId: 'ow1', hiddenId: 'ow2' },
] as const

function backupFixture(versionLabel: string): Backup {
  const backup: Backup = { version: 2, content: {}, overrides: {}, hidden: {} }
  for (const collection of collections) {
    backup.content[collection.name] = [{
      // The same IDs deliberately recur across fixture versions; one is numeric.
      id: collection.name === 'promises' ? 8001 : `backup-local-${collection.name}`,
      title: `${versionLabel} local ${collection.name}`,
      isLocal: true,
      displayLabel: 'Local 7',
      text: `${versionLabel} texto ${collection.name}`,
      description: `${versionLabel} descripción ${collection.name}`,
      date: '2026-10-02',
      category: 'Prueba',
      chapter: 'Capítulo de respaldo',
      details: ['Detalle uno', 'Detalle dos'],
      month: 'Octubre de prueba',
      mood: 'Un momento de prueba',
      preview: `${versionLabel} vista previa`,
      content: [`${versionLabel} primer párrafo`, `${versionLabel} segundo párrafo`],
      locked: false,
      sourceType: 'local',
      src: '/audio/respaldo-prueba.mp3',
      image: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      alt: 'Imagen sintética de respaldo',
      createdBy: 'local-user1',
      updatedBy: 'local-user2',
      createdAt: '2026-09-01T12:00:00.000Z',
      updatedAt: '2026-09-02T12:00:00.000Z',
      source: 'local-dev',
      spaceId: 'backup-test-space',
      compatibleMetadata: { label: 'Conservar este campo', revision: 7 },
    }]
    backup.overrides[collection.name] = {
      [collection.baseId]: {
        id: collection.baseId,
        title: `${versionLabel} original ${collection.name}`,
        updatedAt: '2026-09-03T12:00:00.000Z',
      },
    }
    backup.hidden[collection.name] = [collection.hiddenId]
  }
  return backup
}

function snapshot(backup: Backup) {
  return { content: backup.content, overrides: backup.overrides, hidden: backup.hidden }
}

async function importBackup(page: Page, payload: unknown, success = true) {
  const confirmations: string[] = []
  const acceptConfirmation = async (dialog: Dialog) => {
    confirmations.push(dialog.message())
    await dialog.accept()
  }
  page.on('dialog', acceptConfirmation)
  try {
    const input = page.locator('.backup-card input[type="file"]')
    await input.setInputFiles({
      name: 'respaldo-e2e.json', mimeType: 'application/json',
      buffer: Buffer.from(typeof payload === 'string' ? payload : JSON.stringify(payload)),
    })
    // Cleared in finally only after file reading, confirmation and restoration finish.
    await expect(input).toHaveValue('')
    await expect(page.locator('.backup-status')).toHaveClass(success ? /success/ : /error/)
    if (success) expect(confirmations).toHaveLength(1)
  } finally {
    page.off('dialog', acceptConfirmation)
  }
  return confirmations
}

async function exportBackup(page: Page) {
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exportar respaldo', exact: true }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^distancia-cero-respaldo-local-.*\.json$/)
  expect(await download.failure()).toBeNull()
  const path = await download.path()
  expect(path).not.toBeNull()
  const raw = await readFile(path!, 'utf8')
  const backup = JSON.parse(raw) as Backup
  expect(backup.version).toBe(2)
  return { raw, backup }
}

async function expectCmsSnapshot(page: Page, backup: Backup) {
  const cms = page.locator('#centro-universo')
  for (const collection of collections) {
    const moduleButton = cms.locator('.crud-central-shell').getByRole('button', { name: collection.label, exact: true })
    // Bulk backup checks select the named controls through the keyboard.
    // Pointer interaction is covered by the separate CRUD journeys.
    await moduleButton.press('Enter')
    await expect(moduleButton).toHaveClass(/active/)
    const localButton = cms.getByRole('button', { name: 'Tus creaciones', exact: true })
    await localButton.press('Enter')
    await expect(localButton).toHaveClass(/active/)
    await expect(moduleButton).toHaveClass(/active/)
    const localPanel = page.locator(`#local-${collection.panel}-editor`)
    await expect(localPanel).toBeVisible()
    await expect(localPanel.locator('.reason-item-row')).toHaveCount(backup.content[collection.name].length)
    for (const item of backup.content[collection.name]) {
      await expect(localPanel.getByText(item.title, { exact: true })).toBeVisible()
    }
    const originalsButton = cms.getByRole('button', { name: 'Originales', exact: true })
    await originalsButton.press('Enter')
    await expect(originalsButton).toHaveClass(/active/)
    await expect(moduleButton).toHaveClass(/active/)
    const basePanel = page.locator(`#base-${collection.panel}-editor`)
    await expect(basePanel).toBeVisible()
    await expect(basePanel.locator('.reason-item-row.overridden')).toHaveCount(Object.keys(backup.overrides[collection.name]).length)
    await expect(basePanel.locator('.reason-item-row.hidden-item')).toHaveCount(backup.hidden[collection.name].length)
    for (const item of Object.values(backup.overrides[collection.name])) {
      await expect(basePanel.getByText(String(item.title), { exact: true })).toBeVisible()
    }
  }
}

async function expectLetterReaders(page: Page, backup: Backup) {
  await page.locator('.scene-portal').getByRole('button', { name: 'Cartas', exact: true }).click()
  for (const [collection, sectionId] of [['monthlyLetters', 'cartas'], ['openWhenLetters', 'abrir-cuando']]) {
    const section = page.locator(`#${sectionId}`)
    const item = backup.content[collection][0]
    await section.locator('article').filter({
      has: page.getByRole('heading', { name: item.title, exact: true }),
    }).getByRole('button').click()
    await expect(section.locator('.letter-reader-content p')).toHaveText(item.content as string[])
    await section.getByRole('button', { name: 'Volver a las cartas', exact: true }).click()
  }
}

test.describe('Respaldos locales desde la interfaz', () => {
  test.setTimeout(120_000)

  test.beforeEach(async ({ page }) => {
    await page.route(/^https?:\/\/(?!localhost(?=[:/])|127\.0\.0\.1(?=[:/]))/, route => route.abort())
    await page.goto('/app', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.loading-intro')).toBeHidden({ timeout: 15_000 })
    await enableCentro(page)
  })

  test('v2 descarga y restaura las nueve colecciones, IDs y metadata sin recargar el CMS', async ({ page }, testInfo) => {
    const original = backupFixture('Versión guardada')
    const replacement = backupFixture('Versión reemplazada')
    const navigationRequests: string[] = []
    const documentTimeOrigin = await page.evaluate(() => performance.timeOrigin)
    const cmsNode = await page.locator('#centro-universo').elementHandle()
    const initialCmsState = await cmsNode!.evaluate(node => ({
      className: node.className,
      busy: node.getAttribute('aria-busy'),
      hasBackup: Boolean(node.querySelector('.backup-card')),
    }))
    expect(initialCmsState.hasBackup).toBe(true)
    expect(initialCmsState.busy).not.toBe('true')
    page.on('request', request => {
      if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
        navigationRequests.push(request.url())
      }
    })

    await importBackup(page, original)
    await expectCmsSnapshot(page, original)
    const downloaded = await exportBackup(page)
    expect(snapshot(downloaded.backup)).toEqual(snapshot(original))

    await importBackup(page, replacement)
    await expectCmsSnapshot(page, replacement)
    await expectLetterReaders(page, replacement)
    expect(snapshot((await exportBackup(page)).backup)).toEqual(snapshot(replacement))

    // Reimport the actual downloaded JSON, including its original IDs and extra metadata.
    await importBackup(page, downloaded.raw)
    await expectCmsSnapshot(page, original)
    await expectLetterReaders(page, original)
    expect(snapshot((await exportBackup(page)).backup)).toEqual(snapshot(original))
    const documentState = { navigationRequests, documentTimeOrigin, initialCmsState,
      finalTimeOrigin: await page.evaluate(() => performance.timeOrigin),
      cmsPreserved: await cmsNode!.evaluate(node => node.isConnected && node === document.getElementById('centro-universo')).catch(() => false),
    }
    await testInfo.attach('cms-document-preservation', {
      body: JSON.stringify(documentState, null, 2),
      contentType: 'application/json',
    })
    expect(documentState.finalTimeOrigin).toBe(documentTimeOrigin)
    expect(documentState.cmsPreserved).toBe(true)
    expect(navigationRequests).toEqual([])

    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.locator('#centro-universo')).toBeVisible()
    // The three preceding snapshots check all nine collections in the CMS.
    // After reload, exercise the readers and compare all data via a real export.
    await expectLetterReaders(page, original)
    expect(snapshot((await exportBackup(page)).backup)).toEqual(snapshot(original))
  })

  test('v1 parcial cambia solo las cartas incluidas y conserva las colecciones ausentes', async ({ page }) => {
    const original = backupFixture('Conservada')
    await importBackup(page, original)
    const letters = backupFixture('Restaurada v1').content.monthlyLetters
    await importBackup(page, { version: 1, monthlyLetters: letters })
    const expected = { ...original, content: { ...original.content, monthlyLetters: letters } }
    await expectCmsSnapshot(page, expected)
    await expectLetterReaders(page, expected)
    expect(snapshot((await exportBackup(page)).backup)).toEqual(snapshot(expected))
  })

  test('v2 parcial distingue una colección ausente de contenido, overrides y ocultos vacíos', async ({ page }) => {
    const original = backupFixture('Conservada')
    await importBackup(page, original)
    await importBackup(page, {
      version: 2, content: { monthlyLetters: [] }, overrides: { reasons: {} }, hidden: { reasons: [] },
    })
    const expected = {
      ...original,
      content: { ...original.content, monthlyLetters: [] },
      overrides: { ...original.overrides, reasons: {} },
      hidden: { ...original.hidden, reasons: [] },
    }
    await expectCmsSnapshot(page, expected)
    expect(snapshot((await exportBackup(page)).backup)).toEqual(snapshot(expected))
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.locator('#centro-universo')).toBeVisible()
    expect(snapshot((await exportBackup(page)).backup)).toEqual(snapshot(expected))
  })

  test('un JSON dañado o una entrada inválida al final no altera ningún dato ni pide confirmar', async ({ page }) => {
    const original = backupFixture('Intacta')
    await importBackup(page, original)
    const invalidHidden = backupFixture('No debe guardarse')
    const duplicateId = backupFixture('Tampoco debe guardarse')
    duplicateId.content.openWhenLetters.push({ ...duplicateId.content.openWhenLetters[0] })
    const invalidFiles = [
      '{ "version": 2, "content": ',
      { ...invalidHidden, hidden: { ...invalidHidden.hidden, openWhenLetters: [null] } },
      duplicateId,
    ]
    for (const invalid of invalidFiles) {
      const confirmations = await importBackup(page, invalid, false)
      expect(confirmations).toEqual([])
      await expect(page.locator('.backup-status')).not.toHaveClass(/success/)
      expect(snapshot((await exportBackup(page)).backup)).toEqual(snapshot(original))
    }
    await expectCmsSnapshot(page, original)
  })

  test('un fallo de almacenamiento se comunica y revierte las colecciones ya escritas', async ({ page }) => {
    // Fault injection only: fixture content and all mutations still enter through the import UI.
    await page.addInitScript(() => {
      const write = Storage.prototype.setItem
      let failed = false
      Storage.prototype.setItem = function (key: string, value: string) {
        if (!failed && key === 'distancia-cero-content-promises' && value.includes('Fallo transacción E2E')) {
          failed = true
          throw new DOMException('Cuota simulada para la prueba', 'QuotaExceededError')
        }
        return write.call(this, key, value)
      }
    })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.locator('#centro-universo')).toBeVisible()
    const original = backupFixture('Debe conservarse')
    await importBackup(page, original)
    const rejected = backupFixture('Fallo transacción E2E')
    const confirmations = await importBackup(page, rejected, false)
    expect(confirmations).toHaveLength(1)
    await expect(page.locator('.backup-status')).toContainText(/guardar|almacenamiento/i)
    expect(snapshot((await exportBackup(page)).backup)).toEqual(snapshot(original))
    await expectCmsSnapshot(page, original)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.locator('#centro-universo')).toBeVisible()
    expect(snapshot((await exportBackup(page)).backup)).toEqual(snapshot(original))
  })
})
