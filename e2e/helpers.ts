import { expect, type Page } from '@playwright/test'

/**
 * Navigate to /app with localStorage reset.
 * `?reset=1` clears localStorage + sessionStorage and reloads.
 * Accepts the confirm dialog that guards the reset action.
 * Waits for LoadingIntro to disappear before returning.
 */
export async function gotoApp(page: Page, path = '/app') {
  // Accept the window.confirm() dialog triggered by ?reset=1.
  // Playwright auto-dismisses dialogs by default (confirm returns false),
  // which would skip the reset. We must explicitly accept it.
  page.once('dialog', dialog => dialog.accept())
  await page.goto(`${path}?reset=1`, { waitUntil: 'domcontentloaded' })
  // LoadingIntro is sessionStorage-gated, shows ~3.3s on every fresh session
  await expect(page.locator('.loading-intro')).toBeHidden({ timeout: 15_000 })
}

/**
 * Enable CMS "Centro del Universo" via settings menu.
 * Toggles: Ajustes → Centro del Universo ON → close
 */
export async function enableCentro(page: Page) {
  await page.getByRole('button', { name: 'Ajustes' }).click()
  await page.getByRole('button', { name: /Centro del Universo/ }).click()
  await page.getByRole('button', { name: 'Ajustes' }).click()
  await expect(page.locator('#centro-universo')).toBeVisible({ timeout: 20_000 })
}
