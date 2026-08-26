// HINWEIS: Der Barrierefreiheitstest weiter unten braucht `@axe-core/playwright`,
// genau wie `homepage.e2e.spec.ts`. Der Import bleibt bewusst statisch.
import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

/**
 * Die Seite „Ferienplan" ist die einzige Seite mit dem Block `holidayPlan`.
 * Der axe-Lauf der Startseite sieht diesen Block deshalb nie — ohne die
 * Prüfungen hier bliebe er dauerhaft ungetestet.
 */

const BASE_URL = 'http://localhost:3000'
const FERIENPLAN_URL = `${BASE_URL}/ferienplan`

const breiten = (page: Page): Promise<{ clientWidth: number; scrollWidth: number }> =>
  page.evaluate(() => {
    const root = document.documentElement
    return {
      clientWidth: root.clientWidth,
      scrollWidth: Math.max(root.scrollWidth, document.body.scrollWidth),
    }
  })

test.describe('Ferienplan', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FERIENPLAN_URL)

    // Ohne Seed gibt es die Seite nicht — dann ist hier nichts zu prüfen.
    test.skip(
      (await page.locator('[data-block="holidayPlan"]').count()) === 0,
      'Kein Ferienplan-Block gefunden — die Seite ist nicht geseedet.',
    )
  })

  test('zeigt genau eine h1 und die Schuljahre als Karten', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText('Ferienplan')

    // Zwei Schuljahre aus dem Seed, jedes mit sieben Einträgen.
    const jahre = page.locator('[data-block="holidayPlan"] dl')
    await expect(jahre).toHaveCount(2)
    await expect(page.locator('[data-block="holidayPlan"] dl > div')).toHaveCount(14)
  })

  test('setzt bei gleichem Monat den Monatsnamen nur einmal', async ({ page }) => {
    // Regressionsschutz für buildPeriod: gleicher Monat, verschiedene Monate,
    // Jahreswechsel und einzelner Tag sind vier verschiedene Formate.
    const plan = page.locator('[data-block="holidayPlan"]')

    await expect(plan).toContainText('13. – 21. Februar 2027')
    await expect(plan).toContainText('19. September – 11. Oktober 2026')
    await expect(plan).toContainText('24. Dezember 2026 – 10. Januar 2027')
    await expect(plan).toContainText('Mo, 17. Mai 2027')
  })

  test('liefert jedes Datum maschinenlesbar als <time>', async ({ page }) => {
    const zeiten = page.locator('[data-block="holidayPlan"] time')

    // 13 Zeiträume mit zwei Daten plus ein einzelner freier Tag, zweimal.
    await expect(zeiten).toHaveCount(26)

    for (const attribut of await zeiten.evaluateAll((elemente) =>
      elemente.map((element) => element.getAttribute('datetime')),
    )) {
      expect(attribut).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  test('hebt höchstens einen Eintrag hervor, und zwar mit Text', async ({ page }) => {
    /*
     * Der Zustand entsteht erst im Browser (siehe HolidayYears.client.tsx), das
     * Server-HTML trägt ihn nicht. Welcher Eintrag markiert ist, hängt am
     * Datum des Testlaufs — geprüft wird deshalb die Invariante, nicht der
     * konkrete Eintrag: laufend und als Nächstes schliessen sich aus, und die
     * Markierung steht nie allein in der Farbe.
     */
    const laufend = page.locator('[data-state="current"]')
    const naechstes = page.locator('[data-state="next"]')

    expect(await laufend.count()).toBeLessThanOrEqual(1)
    expect(await naechstes.count()).toBeLessThanOrEqual(1)
    expect((await laufend.count()) + (await naechstes.count())).toBeLessThanOrEqual(1)

    for (const hervorgehoben of [laufend, naechstes]) {
      if ((await hervorgehoben.count()) === 1) {
        await expect(hervorgehoben).toContainText(/läuft|als Nächstes/)
      }
    }
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
