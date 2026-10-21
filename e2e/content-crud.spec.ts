import { expect, test, type Locator, type Page } from '@playwright/test'
import { enableCentro } from './helpers'

type FormValues = Record<string, string>

interface CollectionCase {
  collection: string
  module: string
  panel: string
  scene: string
  section: string
  bodyField: string
  values: FormValues
  selects?: string[]
}

const imageFixture = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
const collections: CollectionCase[] = [
  {
    collection: 'reasons', module: 'Razones', panel: 'reasons',
    scene: '100 razones', section: 'razones', bodyField: 'text',
    values: { title: '', text: 'Una razón escrita desde el formulario.' },
  },
  {
    collection: 'promises', module: 'Promesas', panel: 'promises',
    scene: 'Promesas', section: 'promesas', bodyField: 'text',
    values: { title: '', text: 'Una promesa escrita desde el formulario.', tag: 'Prueba local' },
  },
  {
    collection: 'importantDates', module: 'Fechas', panel: 'dates',
    scene: 'Promesas', section: 'fechas', bodyField: 'description',
    values: { date: '2026-10-02', title: '', description: 'Una fecha para recordar.', tag: 'Encuentro' },
  },
  {
    collection: 'futureDreams', module: 'Sueños', panel: 'dreams',
    scene: 'Promesas', section: 'wishlist', bodyField: 'description',
    values: { category: 'Viajes', title: '', description: 'Un sueño guardado en este navegador.' },
  },
  {
    collection: 'timeline', module: 'Historia', panel: 'timeline',
    scene: 'Diario', section: 'historia', bodyField: 'description',
    values: {
      chapter: 'Capítulo de prueba', date: '2 de octubre de 2026', title: '',
      subtitle: 'Una página nueva', description: 'Historia creada desde el editor.',
      quote: 'Un recuerdo sintético.', details: 'Primer detalle\nSegundo detalle', mood: 'Encuentro',
    },
  },
  {
    collection: 'blackHoleGallery', module: 'Galería', panel: 'blackhole',
    scene: 'Agujero negro', section: 'galeria-agujero-negro', bodyField: 'description',
    values: {
      date: '2026-10-02', title: '', description: 'Un recuerdo con imagen de prueba.',
      image: imageFixture, alt: 'Imagen sintética de un píxel', tag: 'Recuerdo', videoUrl: '',
    },
  },
  {
    collection: 'playlist', module: 'Música', panel: 'playlist',
    scene: 'Música', section: 'playlist', bodyField: 'description', selects: ['sourceType'],
    values: {
      title: '', artist: 'Artista de prueba', description: 'Una canción añadida desde el CMS.',
      sourceType: 'local', src: '/audio/prueba-local.mp3', link: '', tag: 'Local',
    },
  },
  {
    collection: 'monthlyLetters', module: 'Cartas', panel: 'monthly',
    scene: 'Cartas', section: 'cartas', bodyField: 'content', selects: ['locked'],
    values: {
      month: 'Octubre de prueba', title: '', preview: 'Adelanto mensual',
      content: 'Primer párrafo mensual.\nSegundo párrafo mensual.', tag: 'Mensual', locked: '',
    },
  },
  {
    collection: 'openWhenLetters', module: 'Abrir cuando', panel: 'openwhen',
    scene: 'Cartas', section: 'abrir-cuando', bodyField: 'content', selects: ['locked'],
    values: {
      mood: 'Cuando quieras una prueba', title: '', preview: 'Adelanto para este momento',
      content: 'Primer párrafo del momento.\nSegundo párrafo del momento.', tag: 'Momento', locked: '',
    },
  },
]

function field(page: Page, spec: CollectionCase, name: string, original = false) {
  return page.locator(`#${original ? 'base-' : ''}${spec.collection}-${name}`)
}

function row(page: Page, panel: Locator, title: string) {
  return panel.locator('.reason-item-row').filter({ has: page.getByText(title, { exact: true }) })
}

async function openEditor(page: Page, spec: CollectionCase, original = false) {
  const cms = page.locator('#centro-universo')
  await expect(cms).toBeVisible()
  const moduleButton = cms.locator('.crud-central-shell').getByRole('button', { name: spec.module, exact: true })
  await moduleButton.click()
  await expect(moduleButton).toHaveClass(/active/)
  const actionButton = cms.getByRole('button', { name: original ? 'Originales' : 'Tus creaciones', exact: true })
  await actionButton.click()
  await expect(actionButton).toHaveClass(/active/)
  const panel = page.locator(`#${original ? 'base' : 'local'}-${spec.panel}-editor`)
  await expect(panel).toBeVisible()
  await expect(panel.locator('.editor-form')).toBeVisible()
  return panel
}

async function fillFields(page: Page, spec: CollectionCase, values: FormValues, original = false) {
  for (const [name, value] of Object.entries(values)) {
    const control = field(page, spec, name, original)
    if (spec.selects?.includes(name)) await control.selectOption(value)
    else await control.fill(value)
  }
}

async function expectFields(page: Page, spec: CollectionCase, values: FormValues, original = false) {
  for (const [name, value] of Object.entries(values)) {
    await expect(field(page, spec, name, original)).toHaveValue(value)
  }
}

async function reloadApp(page: Page) {
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.locator('.loading-intro')).toBeHidden({ timeout: 15_000 })
  await expect(page.locator('#centro-universo')).toBeVisible({ timeout: 20_000 })
}

/** These checks read the experience after navigating with its real scene buttons. */
async function expectExperienceItem(
  page: Page, spec: CollectionCase, title: string, present: boolean, body?: string,
) {
  await page.locator('.scene-portal').getByRole('button', { name: spec.scene, exact: true }).click()
  const section = page.locator(`#${spec.section}`)
  await expect(section).toBeVisible()

  if (spec.collection === 'reasons') {
    // Hearts move continuously; their title identifies the item without forcing a pointer hit.
    const heart = section.getByTitle(title, { exact: true })
    if (present) await expect(heart).toBeVisible()
    else await expect(heart).toHaveCount(0)
    return
  }

  if (spec.collection === 'timeline') {
    const entry = section.getByRole('button', { name: `Ir a ${title}`, exact: true })
    if (!present) {
      await expect(entry).toHaveCount(0)
      return
    }
    await entry.click()
    await expect(section.getByRole('heading', { name: title, exact: true })).toBeVisible()
    if (body) await expect(section.locator('.diary-description')).toHaveText(body)
    return
  }

  if (spec.collection === 'blackHoleGallery') {
    if (!(await section.locator('.blackhole-portal').isVisible())) {
      await section.getByRole('button', { name: 'Entrar al agujero negro', exact: true }).click()
      await expect(section.locator('.blackhole-portal')).toBeVisible({ timeout: 10_000 })
    }
    const card = section.locator('.blackhole-photo-card').filter({
      has: page.getByRole('heading', { name: title, exact: true }),
    })
    if (!present) {
      await expect(card).toHaveCount(0)
      return
    }
    await card.click()
    await expect(section.locator('.portal-info').getByRole('heading', { name: title, exact: true })).toBeVisible()
    if (body) await expect(section.locator('.portal-info p')).toHaveText(body)
    return
  }

  const heading = section.getByRole('heading', { name: title, exact: true })
  if (!present) {
    await expect(heading).toHaveCount(0)
    return
  }
  await expect(heading).toBeVisible()
  if (spec.bodyField === 'content' && body) {
    await section.locator('article').filter({
      has: page.getByRole('heading', { name: title, exact: true }),
    }).getByRole('button').click()
    await expect(section.locator('.letter-reader-content p')).toHaveText(body.split('\n'))
    await section.getByRole('button', { name: 'Volver a las cartas', exact: true }).click()
    await expect(heading).toBeVisible()
  } else if (body) {
    await expect(section.getByText(body, { exact: true })).toBeVisible()
  }
}

test.describe('Contenido local: formularios reales de las nueve colecciones', () => {
  test.setTimeout(90_000)

  test.beforeEach(async ({ page }) => {
    // Playwright gives each test an empty browser context. No user storage is cleared or seeded.
    // These CRUD journeys require no external media, authentication or service connections.
    await page.route(/^https?:\/\/(?!localhost(?=[:/])|127\.0\.0\.1(?=[:/]))/, route => route.abort())
    await page.goto('/app', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.loading-intro')).toBeHidden({ timeout: 15_000 })
    await enableCentro(page)
  })

  for (const spec of collections) {
    test(`${spec.module}: crear, editar y borrar una creación persiste y actualiza su sección`, async ({ page, browserName }, testInfo) => {
      // Complete CMS journeys include repeated reloads and native interaction checks in Firefox.
      test.setTimeout(browserName === 'webkit' ? 240_000 : browserName === 'firefox' ? 180_000 : spec.collection === 'blackHoleGallery' ? 120_000 : 90_000)
      const title = `Creación E2E ${spec.collection}`
      const editedTitle = `Creación editada E2E ${spec.collection}`
      const values = { ...spec.values, title }
      const editedBody = `${spec.values[spec.bodyField]}\nContenido editado.`
      const editedValues = { ...values, title: editedTitle, [spec.bodyField]: editedBody }
      // Timeline accepts a Spanish date, then reopens the saved value as ISO.
      const persistedValues = {
        ...editedValues,
        ...(spec.collection === 'timeline' ? { date: '2026-10-02' } : {}),
      }
      let panel = await openEditor(page, spec)

      await test.step('Crear y leer sin recargar', async () => {
        await fillFields(page, spec, values)
        if (spec.collection === 'reasons') {
          await panel.screenshot({ path: testInfo.outputPath('cms-creacion-visible.png') })
        }
        await panel.getByRole('button', { name: 'Guardar', exact: true }).click()
        await expect(row(page, panel, title)).toBeVisible()
        await expect(panel.locator('.reason-item-row')).toHaveCount(1)
        await expect(field(page, spec, 'title')).toHaveValue('')
        await expectExperienceItem(page, spec, title, true, values[spec.bodyField])
      })

      await test.step('Editar y comprobar la actualización inmediata', async () => {
        await row(page, panel, title).getByRole('button', { name: 'Editar', exact: true }).click()
        await expectFields(page, spec, {
          ...values,
          ...(spec.collection === 'timeline' ? { date: '2026-10-02' } : {}),
        })
        await fillFields(page, spec, { title: editedTitle, [spec.bodyField]: editedBody })
        await panel.getByRole('button', { name: 'Actualizar', exact: true }).click()
        await expect(row(page, panel, title)).toHaveCount(0)
        await expect(row(page, panel, editedTitle)).toBeVisible()
        await expect(panel.locator('.reason-item-row')).toHaveCount(1)
        await expectExperienceItem(page, spec, editedTitle, true, editedBody)
        await expectExperienceItem(page, spec, title, false)
      })

      await test.step('Recargar y volver a editar todos los campos guardados', async () => {
        await reloadApp(page)
        panel = await openEditor(page, spec)
        await row(page, panel, editedTitle).getByRole('button', { name: 'Editar', exact: true }).click()
        await expectFields(page, spec, persistedValues)
        await panel.getByRole('button', { name: 'Cancelar', exact: true }).click()
        await expectExperienceItem(page, spec, editedTitle, true, editedBody)
      })

      await test.step('Eliminar y comprobar que no reaparece al recargar', async () => {
        page.once('dialog', dialog => dialog.accept())
        await row(page, panel, editedTitle).getByRole('button', { name: 'Eliminar', exact: true }).click()
        await expect(panel.locator('.reason-item-row')).toHaveCount(0)
        await expect(panel.getByText('No hay elementos tuyos creados.', { exact: true })).toBeVisible()
        await expectExperienceItem(page, spec, editedTitle, false)
        await reloadApp(page)
        panel = await openEditor(page, spec)
        await expect(panel.locator('.reason-item-row')).toHaveCount(0)
        await expectExperienceItem(page, spec, editedTitle, false)
      })
    })

    test(`${spec.module}: editar, ocultar, mostrar y restaurar un original conserva el contenido`, async ({ page, browserName }) => {
      test.setTimeout(browserName === 'webkit' ? 240_000 : browserName === 'firefox' ? 180_000 : spec.collection === 'blackHoleGallery' ? 120_000 : 90_000)
      let panel = await openEditor(page, spec, true)
      await panel.locator('.reason-item-row').first().getByRole('button', { name: 'Editar original', exact: true }).click()
      const originalValues: FormValues = {}
      for (const name of Object.keys(spec.values)) {
        originalValues[name] = await field(page, spec, name, true).inputValue()
      }
      const originalTitle = originalValues.title
      const editedTitle = `Original editado E2E ${spec.collection}`
      const editedBody = `Contenido personalizado de ${spec.collection}.`

      await test.step('Personalizar el original y leerlo', async () => {
        await fillFields(page, spec, { title: editedTitle, [spec.bodyField]: editedBody }, true)
        await panel.getByRole('button', { name: 'Guardar override', exact: true }).click()
        await expect(row(page, panel, editedTitle)).toHaveClass(/overridden/)
        await expect(row(page, panel, originalTitle)).toHaveCount(0)
        await panel.getByRole('button', { name: /Editados/ }).click()
        await expect(panel.locator('.reason-item-row')).toHaveCount(1)
        await expectExperienceItem(page, spec, editedTitle, true, editedBody)
        await reloadApp(page)
        panel = await openEditor(page, spec, true)
        await expect(row(page, panel, editedTitle)).toHaveClass(/overridden/)
      })

      await test.step('Ocultar conserva la personalización y la ausencia tras recarga', async () => {
        page.once('dialog', dialog => dialog.accept())
        await row(page, panel, editedTitle).getByRole('button', { name: 'Ocultar', exact: true }).click()
        await expect(row(page, panel, editedTitle)).toHaveClass(/hidden-item/)
        await panel.getByRole('button', { name: /Ocultos/ }).click()
        await expect(panel.locator('.reason-item-row')).toHaveCount(1)
        await expectExperienceItem(page, spec, editedTitle, false)
        await reloadApp(page)
        panel = await openEditor(page, spec, true)
        await expect(row(page, panel, editedTitle)).toHaveClass(/hidden-item/)
        await expectExperienceItem(page, spec, editedTitle, false)
      })

      await test.step('Mostrar recupera el original con su edición', async () => {
        await row(page, panel, editedTitle).getByRole('button', { name: 'Mostrar', exact: true }).click()
        await expect(row(page, panel, editedTitle)).not.toHaveClass(/hidden-item/)
        await expect(row(page, panel, editedTitle)).toHaveClass(/overridden/)
        await expectExperienceItem(page, spec, editedTitle, true, editedBody)
      })

      await test.step('Restaurar recupera todos los campos del JSON original', async () => {
        await row(page, panel, editedTitle).getByRole('button', { name: 'Restaurar', exact: true }).click()
        await expect(row(page, panel, editedTitle)).toHaveCount(0)
        await expect(row(page, panel, originalTitle)).not.toHaveClass(/overridden|hidden-item/)
        await row(page, panel, originalTitle).getByRole('button', { name: 'Editar original', exact: true }).click()
        await expectFields(page, spec, originalValues, true)
        await panel.getByRole('button', { name: 'Cancelar', exact: true }).click()
        await expectExperienceItem(page, spec, originalTitle, true, originalValues[spec.bodyField])
        await reloadApp(page)
        panel = await openEditor(page, spec, true)
        await expect(row(page, panel, originalTitle)).not.toHaveClass(/overridden|hidden-item/)
        await expect(row(page, panel, editedTitle)).toHaveCount(0)
        await expectExperienceItem(page, spec, originalTitle, true, originalValues[spec.bodyField])
      })
    })
  }
})
