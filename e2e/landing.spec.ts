import { test, expect } from '@playwright/test'

test.describe('PublicLanding', () => {
  test('renders hero with couple names and CTA button', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Hero headline
    await expect(page.locator('h1')).toContainText('Para ti,')
    await expect(page.locator('h1')).toBeVisible()

    // Couple names container (names may be empty in dev config, but container exists)
    await expect(page.locator('.hero-names')).toBeVisible()

    // CTA button navigates to /app
    const enterBtn = page.getByRole('button', { name: 'Entrar al universo' })
    await expect(enterBtn).toBeVisible()
    await enterBtn.click()
    await expect(page).toHaveURL(/\/app/)
  })

  test('rotating phrases cycle every ~3s', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // First phrase visible immediately
    const firstPhrase = page.getByText('Un universo donde la distancia no existe')
    await expect(firstPhrase).toBeVisible()

    // Second phrase appears within 6s
    const secondPhrase = page.getByText('Cartas que viajan entre estrellas')
    await expect(secondPhrase).toBeVisible({ timeout: 6000 })
  })

  test('footer is visible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('Distancia Cero')).toBeVisible()
    await expect(page.getByText('Desde 2024')).toBeVisible()
  })

  test('la bienvenida conserva nombres largos y controles dentro de 320 px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.addInitScript(() => localStorage.setItem('distancia-cero-site-settings', JSON.stringify({
      couple: { yourName: 'A'.repeat(80), herName: 'B'.repeat(80) },
      hero: { titleName: 'Universo'.repeat(10) },
    })))
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1')).toContainText('Universo'.repeat(10))
    await expect(page.locator('.hero-names')).toContainText('A'.repeat(80))
    await expect.poll(() => page.locator('.public-landing').evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1)
    const pause = page.getByRole('button', { name: 'Pausar animaciones', exact: true })
    await pause.scrollIntoViewIfNeeded()
    await expect(pause).toBeInViewport()
    const enter = page.getByRole('button', { name: 'Entrar al universo', exact: true })
    await page.setViewportSize({ width: 375, height: 812 })
    await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
    await enter.focus()
    await page.keyboard.press('Tab')
    await expect(pause).toBeFocused()
    await expect(pause).toBeInViewport({ ratio: 1 })
    await enter.focus()
    await enter.press('Enter')
    await expect(page).toHaveURL(/\/app/)
  })

  test('la bienvenida mantiene el botón estable y permite pausar o reducir las animaciones', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const landing = page.locator('.public-landing')
    const enter = page.getByRole('button', { name: 'Entrar al universo', exact: true })
    // Text must be mounted and laid out before fonts.ready can cover its fonts.
    await expect(enter).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    const top = (await enter.boundingBox())!.y
    await expect(page.getByText('Cartas que viajan entre estrellas')).toBeVisible({ timeout: 6000 })
    expect(Math.abs((await enter.boundingBox())!.y - top)).toBeLessThanOrEqual(1)
    await expect.poll(() => landing.evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1)
    const pause = page.getByRole('button', { name: 'Pausar animaciones', exact: true })
    await pause.focus()
    await expect(pause).toBeFocused()
    await pause.press('Space')
    await expect(landing).toHaveAttribute('data-motion-paused', 'true')
    await expect(page.locator('.orb').first()).toHaveCSS('animation-play-state', 'paused')
    const phrase = await page.locator('.landing-phrase').innerText()
    await page.waitForTimeout(3300) // Observe a full rotation interval while paused.
    await expect(page.locator('.landing-phrase')).toHaveText(phrase)
    await page.getByRole('button', { name: 'Reanudar animaciones', exact: true }).click()
    await expect(landing).toHaveAttribute('data-motion-paused', 'false')
    await expect.poll(() => page.locator('.landing-phrase').innerText(), { timeout: 6000 }).not.toBe(phrase)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect(landing).toHaveAttribute('data-motion-paused', 'true')
    await expect(page.getByRole('button', { name: /animaciones/ })).toHaveCount(0)
  })
})
