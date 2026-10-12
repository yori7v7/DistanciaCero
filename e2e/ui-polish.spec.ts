import { test, expect, type Locator } from '@playwright/test'
import { gotoApp, enableCentro } from './helpers'

test.use({ serviceWorkers: 'block' })

declare global {
  interface Window { __dcSceneDraws: Record<string, number> }
}

async function expectReachable(control: Locator) {
  await control.scrollIntoViewIfNeeded()
  await expect.poll(() => control.evaluate(element => {
    const rect = element.getBoundingClientRect()
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)
    return Boolean(hit && (hit === element || element.contains(hit)))
  })).toBe(true)
}

test('Universo pausa oculto, conserva selección y permite girar con movimiento reducido', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => {
    sessionStorage.setItem('distancia-cero-intro-seen', 'true')
    window.__dcSceneDraws = {}
    for (const prototype of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
      for (const name of ['drawElements', 'drawArrays'] as const) {
        const methods = prototype as unknown as Record<string, (...args: unknown[]) => unknown>
        const original = methods[name]
        methods[name] = function (this: WebGLRenderingContext, ...args: unknown[]) {
          const section = (this.canvas as HTMLCanvasElement).closest('section')?.id || 'unknown'
          window.__dcSceneDraws[section] = (window.__dcSceneDraws[section] || 0) + 1
          return original.apply(this, args)
        }
      }
    }
  })
  const draws = () => page.evaluate(() => window.__dcSceneDraws.universo || 0)
  await page.goto('/app#/universo')
  const canvas = page.locator('#universo canvas')
  await expect.poll(draws).toBeGreaterThan(0)
  const canvasNode = await canvas.elementHandle()
  const nav = page.getByRole('navigation', { name: 'Navegación principal' })
  await nav.getByRole('button', { name: 'Cartas', exact: true }).click()
  await expect(page.locator('#universo')).toBeHidden()
  await page.waitForTimeout(500)
  const paused = await draws()
  await page.waitForTimeout(650)
  expect(await draws()).toBe(paused)
  await nav.getByRole('button', { name: 'Universo', exact: true }).click()
  await expect.poll(draws).toBeGreaterThan(paused)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await canvas.scrollIntoViewIfNeeded()
  await page.waitForTimeout(700)
  const calm = await draws()
  await page.waitForTimeout(650)
  expect(await draws()).toBe(calm)
  const box = (await canvas.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2, { steps: 5 })
  await page.mouse.up()
  await expect.poll(draws).toBeGreaterThan(calm)
  const center = page.getByRole('button', { name: 'Explorar Nosotros', exact: true })
  await expect(center).toBeEnabled()
  await center.focus()
  await center.press('Enter')
  const detail = page.locator('#universo .universe-selected-card h3')
  await expect(detail).toBeFocused()
  await detail.press('Escape')
  await expect(center).toBeFocused()
  const planet = page.getByRole('button', { name: 'Explorar Confianza', exact: true })
  await planet.click()
  await expect(detail).toBeFocused()
  await expect(detail).toHaveText('Confianza')
  await expect(planet).toHaveAttribute('aria-pressed', 'true')
  const selected = await detail.textContent()
  await nav.getByRole('button', { name: 'Cartas', exact: true }).click()
  await nav.getByRole('button', { name: 'Universo', exact: true }).click()
  await expect(detail).toHaveText(selected!)
  await expect(detail).toBeVisible()
  expect(await canvas.evaluate((element, previous) => element === previous, canvasNode!)).toBe(true)
  expect(errors).toEqual([])
})

for (const viewport of [
  { width: 320, height: 568 }, { width: 375, height: 812 },
  { width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1440, height: 900 },
]) {
  test(`cartas, reproductor y formulario alcanzables en ${viewport.width}×${viewport.height}`, async ({ page }) => {
    // This journey includes a reader, a CMS save and the first visit to a 3D scene.
    test.setTimeout(60_000)
    await page.setViewportSize(viewport)
    await gotoApp(page)
    const nav = page.getByRole('navigation', { name: 'Navegación principal' })
    for (const name of ['Ajustes', 'Escena anterior', 'Escena siguiente', 'Ir a la banda sonora']) {
      const rect = await nav.getByRole('button', { name, exact: true }).boundingBox()
      expect(rect!.width).toBeGreaterThanOrEqual(44)
      expect(rect!.height).toBeGreaterThanOrEqual(44)
    }
    await nav.getByRole('button', { name: 'Cartas', exact: true }).click()
    await expect(page.locator('#cartas')).toBeVisible()
    expect(await page.locator('#cartas .card-status-badge').evaluateAll(elements => elements.every(element => {
      const range = document.createRange()
      const text = [...element.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())!
      range.selectNode(text)
      return range.getClientRects().length === 1 && element.scrollWidth <= element.clientWidth
    }))).toBe(true)
    await expect(nav.getByRole('button', { name: 'Cartas', exact: true })).toHaveAttribute('aria-current', 'page')
    const open = page.locator('#cartas').getByRole('button', { name: 'Abrir carta', exact: true }).first()
    await expectReachable(open)
    await open.focus()
    await open.press('Enter')
    await expect(page.locator('#cartas .letter-reader h2')).toBeFocused()
    await page.getByRole('button', { name: 'Volver a las cartas' }).click()
    await expect(page.locator('#cartas').getByRole('button', { name: 'Releer carta' }).first()).toBeFocused()

    await nav.getByRole('button', { name: 'Ir a la banda sonora' }).click()
    const player = page.getByRole('region', { name: 'Banda sonora' })
    await expect(player).toBeFocused()
    // A competing smooth scroll must not hide the focused player a moment later.
    await page.waitForTimeout(700)
    await expect.poll(() => player.evaluate(element => element.getBoundingClientRect().top >= document.querySelector('.scene-portal')!.getBoundingClientRect().bottom)).toBe(true)
    expect(await player.evaluate(element => getComputedStyle(element).position)).toBe('relative')
    await expectReachable(player.getByRole('slider', { name: 'Volumen de la banda sonora' }))

    await enableCentro(page)
    const cms = page.locator('#centro-universo')
    expect(await cms.locator('.letter-stats-panel').evaluate(panel => {
      const bounds = panel.getBoundingClientRect()
      return [...panel.querySelectorAll('.stat-card')].every(element => {
        const rect = element.getBoundingClientRect()
        return rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1 && element.scrollWidth <= element.clientWidth
      })
    })).toBe(true)
    const modules = cms.locator('.crud-selector-grid').first()
    await modules.getByRole('button', { name: 'Razones', exact: true }).click()
    await cms.locator('.crud-selector-grid').nth(1).getByRole('button', { name: 'Tus creaciones', exact: true }).click()
    await cms.locator('#reasons-title').fill(`Razón ${viewport.width}`)
    await cms.locator('#reasons-text').fill('Contenido sintético para comprobar el formulario.')
    const save = cms.locator('#local-reasons-editor').getByRole('button', { name: 'Guardar', exact: true })
    await expectReachable(save)
    await save.click()
    await expect(cms.locator('#local-reasons-editor')).toContainText(`Razón ${viewport.width}`)
    const titleField = cms.locator('#reasons-title')
    await titleField.focus()
    await expect.poll(() => titleField.evaluate(element => element.getBoundingClientRect().top >= document.querySelector('.scene-portal')!.getBoundingClientRect().bottom)).toBe(true)
    await nav.getByRole('button', { name: 'Universo', exact: true }).click()
    const worlds = page.getByRole('group', { name: 'Explorar el universo' })
    await expect(worlds).toHaveAttribute('aria-busy', 'false')
    const planet = worlds.getByRole('button', { name: 'Explorar Confianza', exact: true })
    for (const button of await worlds.getByRole('button').all()) {
      const rect = (await button.boundingBox())!
      expect(rect.width).toBeGreaterThanOrEqual(44)
      expect(rect.height).toBeGreaterThanOrEqual(44)
    }
    await expectReachable(planet)
    await planet.click()
    const detail = page.locator('#universo .universe-selected-card h3')
    await expect(detail).toBeFocused()
    await expect(detail).toHaveText('Confianza')
    await detail.press('Escape')
    await expect(planet).toBeFocused()
    // Include the lifetime of the detail's former smooth scroll, not only focus return.
    await page.waitForTimeout(1000)
    await expect.poll(() => planet.evaluate(element => {
      const rect = element.getBoundingClientRect()
      return rect.top >= document.querySelector('.scene-portal')!.getBoundingClientRect().bottom && rect.bottom <= innerHeight
    })).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

test('Banda sonora conserva foco y posición al cerrar un planeta y activarla inmediatamente', async ({ page }) => {
  test.setTimeout(60_000)
  await page.setViewportSize({ width: 320, height: 568 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await gotoApp(page)
  const nav = page.getByRole('navigation', { name: 'Navegación principal' })
  await nav.getByRole('button', { name: 'Universo', exact: true }).click()
  const worlds = page.getByRole('group', { name: 'Explorar el universo' })
  await expect(worlds).toHaveAttribute('aria-busy', 'false')
  const planet = worlds.getByRole('button', { name: 'Explorar Confianza', exact: true })
  await expectReachable(planet)
  await planet.click()
  const detail = page.locator('#universo .universe-selected-card h3')
  await expect(detail).toBeFocused()
  await expect(detail).toHaveText('Confianza')

  // Run both real handlers in one browser task, before the 140 ms return-scroll timer.
  await detail.evaluate(heading => {
    const shortcut = document.querySelector<HTMLButtonElement>('.scene-portal button[aria-label="Ir a la banda sonora"]')
    if (!shortcut) throw new Error('No se encontró el atajo a Banda sonora')
    heading.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    shortcut.click()
  })

  const player = page.getByRole('region', { name: 'Banda sonora' })
  await expect(detail).toHaveCount(0)
  await expect(player).toBeFocused()
  await page.waitForTimeout(1000)
  await expect(player).toBeFocused()
  await expect.poll(() => player.evaluate(element =>
    element.getBoundingClientRect().top >= document.querySelector('.scene-portal')!.getBoundingClientRect().bottom
  )).toBe(true)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})

test('Razones estáticas, diálogo largo y retorno de foco por teclado en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    sessionStorage.setItem('distancia-cero-intro-seen', 'true')
    localStorage.setItem('distancia-cero-content-reasons', JSON.stringify([
      { id: 'ui-long', title: 'Razón larga', text: 'Un recuerdo muy largo para leer con calma. '.repeat(140) },
    ]))
  })
  await page.goto('/app#/inicio')
  await page.getByRole('navigation').getByRole('button', { name: '100 razones', exact: true }).click()
  const grid = page.locator('.reasons-static-grid')
  await expect(grid).toBeVisible()
  const trigger = grid.getByRole('button', { name: 'Abrir razón: Razón larga', exact: true })
  await trigger.focus()
  await trigger.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Razón larga', exact: true })
  await expect(dialog.getByRole('button', { name: 'Cerrar', exact: true }).first()).toBeFocused()
  expect(await dialog.evaluate(element => {
    const rect = element.getBoundingClientRect()
    return rect.top >= 0 && rect.bottom <= innerHeight && element.scrollHeight > element.clientHeight
  })).toBe(true)
  await dialog.getByRole('button', { name: 'Cerrar', exact: true }).last().focus()
  await page.keyboard.press('Tab')
  await expect(dialog.getByRole('button', { name: 'Cerrar', exact: true }).first()).toBeFocused()
  expect(await dialog.getByRole('button', { name: 'Cerrar', exact: true }).first().evaluate(element => {
    const rect = element.getBoundingClientRect()
    return rect.top >= 0 && rect.bottom <= innerHeight
  })).toBe(true)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await trigger.press('Enter')
  await expect(dialog).toBeVisible()
  await page.goBack()
  await expect(dialog).toBeHidden()
  await expect(page.getByRole('navigation').getByRole('button', { name: 'Inicio', exact: true })).toBeFocused()
})

test('la carga diferida se oculta al cambiar de escena y conserva el Canvas al regresar', async ({ page }) => {
  test.setTimeout(60_000)
  let release!: () => void
  const blocked = new Promise<void>(resolve => { release = resolve })
  let requests = 0
  await page.route('**/src/components/UniverseSection.tsx*', async route => {
    requests++
    await blocked
    await route.continue()
  })
  await gotoApp(page)
  expect(requests).toBe(0)
  const nav = page.getByRole('navigation')
  await nav.getByRole('button', { name: 'Universo', exact: true }).click()
  await expect(page.locator('#universo')).toHaveAttribute('aria-busy', 'true')
  await nav.getByRole('button', { name: 'Cartas', exact: true }).click()
  await expect(page.locator('#universo')).toBeHidden()
  release()
  await expect(page.locator('#universo')).not.toHaveAttribute('aria-busy', 'true')
  await expect(page.locator('#universo')).toBeHidden()
  await nav.getByRole('button', { name: 'Universo', exact: true }).click()
  await expect(page.locator('#universo canvas')).toBeVisible()
  await page.locator('#universo canvas').evaluate(element => { (window as any).__visitedCanvas = element })
  await nav.getByRole('button', { name: 'Inicio', exact: true }).click()
  await nav.getByRole('button', { name: 'Universo', exact: true }).click()
  expect(await page.locator('#universo canvas').evaluate(element => element === (window as any).__visitedCanvas)).toBe(true)
  expect(requests).toBe(1)
})

test('un fallo de descarga pertenece a su escena y se recupera recargando', async ({ page }) => {
  test.setTimeout(60_000)
  let fail = true
  await page.route('**/src/components/UniverseSection.tsx*', route => {
    if (fail) { fail = false; return route.abort('failed') }
    return route.continue()
  })
  await gotoApp(page)
  const nav = page.getByRole('navigation')
  await nav.getByRole('button', { name: 'Universo', exact: true }).click()
  await expect(page.locator('#universo').getByRole('alert')).toContainText('No se pudo cargar')
  await nav.getByRole('button', { name: 'Cartas', exact: true }).click()
  await expect(page.locator('#universo')).toBeHidden()
  await expect(page.locator('#cartas')).toBeVisible()
  await nav.getByRole('button', { name: 'Universo', exact: true }).click()
  const origin = await page.evaluate(() => performance.timeOrigin)
  await page.locator('#universo').getByRole('button', { name: 'Recargar página' }).click()
  await expect(page.locator('#universo canvas')).toBeVisible({ timeout: 20_000 })
  expect(await page.evaluate(() => performance.timeOrigin)).not.toBe(origin)
})
