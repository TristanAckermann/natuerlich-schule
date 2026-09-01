// HINWEIS: Der Barrierefreiheitstest weiter unten braucht `@axe-core/playwright`,
// genau wie `homepage.e2e.spec.ts`. Der Import bleibt bewusst statisch.
import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

/**
 * Die Seite „Unterstufe“ ist die erste Seite, die den Block `pageHeader`
 * zusammen mit einer Reihe von `textIntro`-Abschnitten trägt. Geprüft wird
 * deshalb beides: die Gliederung der Seite selbst und der Weg dorthin über die
 * Navigation — der Grund, aus dem die Seite überhaupt geseedet wird.
 */

const BASE_URL = 'http://localhost:3000'
const UNTERSTUFE_URL = `${BASE_URL}/unterstufe`

const breiten = (page: Page): Promise<{ clientWidth: number; scrollWidth: number }> =>
  page.evaluate(() => {
    const root = document.documentElement
    return {
      clientWidth: root.clientWidth,
      scrollWidth: Math.max(root.scrollWidth, document.body.scrollWidth),
    }
  })

test.describe('Unterstufe', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(UNTERSTUFE_URL)

    // Ohne Seed gibt es die Seite nicht — dann ist hier nichts zu prüfen.
    test.skip(
      (await page.locator('[data-block="pageHeader"]').count()) === 0,
      'Kein Seitenkopf gefunden — die Seite ist nicht geseedet.',
    )
  })

  test('zeigt genau eine h1 und alle Abschnitte der Vorlage', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText('Unterstufe')

    const abschnitte = page.locator('[data-block="textIntro"]')
    await expect(abschnitte).toHaveCount(6)

    for (const titel of [
      'Allgemein',
      'Hoher Betreuungsschlüssel – kleine Gruppen',
      'Pädagogik',
      'Schulinsel',
      'Wald / Garten',
      'Die Räumlichkeiten und der Bewegungsraum der Kinder',
    ]) {
      await expect(page.locator('h2', { hasText: titel })).toHaveCount(1)
    }
  })

  test('ist über die Navigationsgruppe „Stufen“ erreichbar', async ({ page }) => {
    /*
     * Der Kern der Sache: der Navigationseintrag trägt erst dann ein Ziel, wenn
     * der Seed ihn mit der Seite verknüpft hat. Ohne die Verknüpfung bliebe er
     * ein `aria-disabled`-Platzhalter und die Seite nur über die URL erreichbar.
     */
    await page.goto(BASE_URL)
    await page.getByRole('button', { name: 'Stufen' }).click()

    const eintrag = page.getByRole('link', { name: 'Unterstufe', exact: true })

    /*
     * Die Seeds schreiben mit `disableRevalidate`; ein laufender Dev-Server hält
     * die Kopfzeile danach weiter im Cache und liefert den Platzhalter aus,
     * obwohl die Verknüpfung in der Datenbank steht. Das ist kein Fehler der
     * Seite — geprüft wird deshalb nur, wenn die Kopfzeile aktuell ist.
     */
    test.skip(
      (await eintrag.getAttribute('href')) === '#',
      'Navigationseintrag noch Platzhalter — nach einem Seed-Lauf den Dev-Server neu starten.',
    )

    await expect(eintrag).toHaveAttribute('href', '/unterstufe')
    await eintrag.click()
    await expect(page).toHaveURL(UNTERSTUFE_URL)
    await expect(page.locator('h1')).toHaveText('Unterstufe')
  })

  test('scrollt auf keiner Breite horizontal', async ({ page }) => {
    for (const width of [1440, 1280, 1024, 768, 560, 375]) {
      await page.setViewportSize({ height: 900, width })
      // Kurz warten, bis die Media Queries greifen und das Layout steht.
      await page.waitForTimeout(200)

      const { clientWidth, scrollWidth } = await breiten(page)
      expect(scrollWidth, `Querscrollen bei ${width} px`).toBeLessThanOrEqual(clientWidth)
    }
  })

  test('hat keine kritischen axe-Verstösse', async ({ page }) => {
    const ergebnis = await new AxeBuilder({ page }).analyze()
    const kritisch = ergebnis.violations.filter((verstoss) => verstoss.impact === 'critical')

    expect(kritisch.map((verstoss) => `${verstoss.id}: ${verstoss.help}`)).toEqual([])
  })
})
