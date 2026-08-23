import { expect, test } from '@playwright/test'

/**
 * Rauchtest des Frontends: Läuft die Startseite überhaupt, stimmen Sprache,
 * Landmarks und Skip-Link? Die inhaltlichen Prüfungen stehen in
 * `homepage.e2e.spec.ts`.
 */

const BASE_URL = 'http://localhost:3000'

test.describe('Frontend', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })

  test('liefert die Startseite mit Titel und genau einer h1 aus', async ({ page }) => {
    await expect(page).toHaveTitle(/Natürlich Schule/)

    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)
    await expect(h1).toHaveText('Natürlich Schule')
  })

  test('setzt lang="de-CH" und die drei Landmarks', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'de-CH')

    await expect(page.getByRole('banner')).toHaveCount(1)
    await expect(page.getByRole('main')).toHaveCount(1)
    await expect(page.getByRole('contentinfo')).toHaveCount(1)
    await expect(page.getByRole('navigation').first()).toBeVisible()
  })

  test('holt den Skip-Link beim ersten Tabulator in den Sichtbereich', async ({ page }) => {
    const skipLink = page.getByRole('link', { name: /zum inhalt springen/i })

    await expect(skipLink).toHaveCount(1)
    await expect(skipLink).not.toBeInViewport()

    await page.keyboard.press('Tab')
    await expect(skipLink).toBeFocused()
    await expect(skipLink).toBeInViewport()

    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#inhalt$/)
  })

  test('rendert die Blöcke innerhalb von <main>', async ({ page }) => {
    const bloecke = page.getByRole('main').locator('[data-block]')

    test.skip(
      (await bloecke.count()) === 0,
      'Kein [data-block] gefunden — die Startseite ist nicht geseedet.',
    )

    await expect(page.getByRole('main').locator('[data-block="hero"]')).toHaveCount(1)
  })
})
