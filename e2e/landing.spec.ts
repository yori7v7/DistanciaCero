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
})
