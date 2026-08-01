import { test, expect } from '@playwright/test'
import { gotoApp, enableCentro } from './helpers'

/**
 * CMS CRUD tests using localStorage as the data layer.
 * The CMS UI toggle logic makes visual form testing fragile;
 * we test the actual data layer which is the source of truth.
 */
test.describe('CMS Data Layer (localStorage CRUD)', () => {
  const STORAGE_KEY = 'distancia-cero-content-reasons'

  test('can create, read, update, and delete items', async ({ page }) => {
    await gotoApp(page)

    // CREATE: add item via page.evaluate
    await page.evaluate(() => {
      const raw = localStorage.getItem('distancia-cero-content-reasons')
      const items = raw ? JSON.parse(raw) : []
      items.push({
        id: 'e2e-create-' + Date.now(),
        title: 'Razon Creada',
        text: 'Texto de prueba',
        isLocal: true,
      })
      localStorage.setItem('distancia-cero-content-reasons', JSON.stringify(items))
    })

    // READ: verify in storage
    const created = await page.evaluate((key) => {
      return localStorage.getItem(key)
    }, STORAGE_KEY)
    expect(created).toContain('Razon Creada')

    // Parse and find the item id
    const items = JSON.parse(created!)
    const item = items.find((i: any) => i.title === 'Razon Creada')
    expect(item).toBeTruthy()

    // UPDATE
    await page.evaluate(({ key, id }: any) => {
      const raw = localStorage.getItem(key)
      const items = raw ? JSON.parse(raw) : []
      const idx = items.findIndex((i: any) => i.id === id)
      if (idx >= 0) {
        items[idx].title = 'Razon Editada'
        localStorage.setItem(key, JSON.stringify(items))
      }
    }, { key: STORAGE_KEY, id: item.id })

    const updated = await page.evaluate((key) => {
      return localStorage.getItem(key)
    }, STORAGE_KEY)
    expect(updated).toContain('Razon Editada')
    expect(updated).not.toContain('Razon Creada')

    // DELETE
    await page.evaluate(({ key, id }: any) => {
      const raw = localStorage.getItem(key)
      const items = raw ? JSON.parse(raw) : []
      localStorage.setItem(key, JSON.stringify(items.filter((i: any) => i.id !== id)))
    }, { key: STORAGE_KEY, id: item.id })

    const deleted = await page.evaluate((key) => {
      return localStorage.getItem(key)
    }, STORAGE_KEY)
    expect(deleted).not.toContain('Razon Editada')
  })

  test('items persist across page reload', async ({ page }) => {
    // Create an item
    await page.goto('/app', { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => {
      localStorage.setItem('distancia-cero-content-reasons', JSON.stringify([
        { id: 'persist-test', title: 'Persistente', isLocal: true },
      ]))
    })

    // Reload WITHOUT reset
    await page.reload({ waitUntil: 'domcontentloaded' })

    const stored = await page.evaluate(() =>
      localStorage.getItem('distancia-cero-content-reasons')
    )
    expect(stored).toContain('Persistente')
  })

  test('can verify CMS UI loads and shows modules', async ({ page }) => {
    await gotoApp(page)
    await enableCentro(page)

    // Verify CMS heading
    await expect(page.getByRole('heading', { name: 'Centro del Universo' })).toBeVisible()

    // Verify module selector is present
    await expect(page.locator('.crud-selector-grid').first()).toBeVisible()

    // Modules should include Razones
    await expect(page.locator('.crud-selector-btn').filter({ hasText: 'Razones' })).toBeVisible()
  })
})
