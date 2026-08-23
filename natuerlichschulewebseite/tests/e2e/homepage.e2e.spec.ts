// HINWEIS: Der Barrierefreiheitstest weiter unten braucht `@axe-core/playwright`.
// Das Paket steht in den devDependencies; fehlt es im node_modules-Baum, hilft
// `pnpm add -D @axe-core/playwright`. Der Import bleibt bewusst statisch: eine
// fehlende Abhängigkeit soll auffallen, nicht stillschweigend übersprungen werden.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import type { TextIntroBlock } from '../../src/payload-types'

/**
 * E2E-Tests der Startseite (Spec 11).
 *
 * Die Tests laufen gegen eine geseedete Datenbank. Fehlen Inhalte, überspringt
 * sich der betroffene Test mit Begründung — echte Fehler bleiben sichtbar.
 */

const BASE_URL = 'http://localhost:3000'

/** Reihenfolge aus Spec 8 — die Blöcke tragen `data-block="<blockType>"`. */
const BLOCK_ORDER = ['hero', 'textIntro', 'pillarCards', 'dayTimeline', 'quote', 'ctaBanner']

const blockTypes = (page: Page): Promise<(string | null)[]> =>
  page
    .locator('[data-block]')
    .evaluateAll((elements) => elements.map((element) => element.getAttribute('data-block')))

/** Breite des Dokuments gegen die des Viewports — für „kein Querscrollen". */
const breiten = (page: Page): Promise<{ clientWidth: number; scrollWidth: number }> =>
  page.evaluate(() => {
    const root = document.documentElement
    return {
      clientWidth: root.clientWidth,
      scrollWidth: Math.max(root.scrollWidth, document.body.scrollWidth),
    }
  })

test.describe('Startseite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })

  test('rendert alle sechs Blöcke in der Reihenfolge der Spec', async ({ page }) => {
    const blocks = await blockTypes(page)

    test.skip(
      blocks.length === 0,
      'Kein [data-block] auf der Seite — die Startseite ist nicht geseedet.',
    )

    expect(blocks).toEqual(BLOCK_ORDER)
  })

  test('hat genau eine h1 mit „Natürlich Schule"', async ({ page }) => {
    const h1 = page.locator('h1')

    await expect(h1).toHaveCount(1)
    await expect(h1).toHaveText('Natürlich Schule')
  })

  test('öffnet die Unterzeile der Gruppe „Stufen" und schliesst sie mit Escape', async ({
    page,
  }) => {
    const gruppe = page
      .getByRole('button', { name: 'Stufen', exact: true })
      .filter({ visible: true })

    test.skip(
      (await gruppe.count()) === 0,
      'Die Navigationsgruppe „Stufen" fehlt — das Header-Global ist nicht geseedet.',
    )

    const button = gruppe.first()
    // `getByRole` sieht nur, was im Accessibility-Baum steht: die geschlossene
    // Unterzeile ist damit auch ein Test auf `inert` / `aria-hidden` (Spec 7.2).
    const unterpunkt = page
      .getByRole('link', { name: 'Unterstufe', exact: true })
      .filter({ visible: true })
    const geschlossen =
      'Bei geschlossener Unterzeile dürfen die Links nicht in der Tabreihenfolge stehen (inert/aria-hidden, Spec 7.2).'

    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(unterpunkt, geschlossen).toHaveCount(0)

    await button.click()
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await expect(unterpunkt).toHaveCount(1)

    await page.keyboard.press('Escape')
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(button).toBeFocused()
    await expect(unterpunkt, geschlossen).toHaveCount(0)

    // Ein zweiter Klick auf denselben Eintrag schliesst die Zeile wieder (Spec 7.2).
    await button.click()
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await button.click()
    await expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  test('öffnet das Menü „Weitere Links" mit vier Einträgen', async ({ page }) => {
    // Das aria-label darf auf dem <details> oder auf dem <summary> sitzen.
    const beschriftet = page.locator('[aria-label="Weitere Links"]').filter({ visible: true })
    const istBeschriftet = (await beschriftet.count()) > 0
    const menue = istBeschriftet
      ? beschriftet.first().locator('xpath=ancestor-or-self::details[1]')
      : page.locator('header details').filter({ visible: true }).first()

    if (!istBeschriftet) {
      test.skip(
        (await menue.count()) === 0,
        'Kein Menü „Weitere Links" gefunden — das Header-Global ist nicht geseedet.',
      )
    }

    await expect(
      menue,
      'Das Menü „Weitere Links" ist ein <details>/<summary> und funktioniert ohne JS (Spec 7.2).',
    ).toHaveCount(1)

    const hatBeschriftung = await menue.evaluate(
      (element) =>
        element.getAttribute('aria-label') === 'Weitere Links' ||
        element.querySelector('summary')?.getAttribute('aria-label') === 'Weitere Links',
    )
    expect(hatBeschriftung, 'Das Menü braucht aria-label="Weitere Links" (Spec 7.2).').toBe(true)

    await expect(menue).not.toHaveAttribute('open', '')

    await menue.locator('summary').first().click()
    await expect(menue).toHaveAttribute('open', '')

    const eintraege = menue.locator('a[href]').filter({ visible: true })
    await expect(eintraege).toHaveCount(4)

    await page.keyboard.press('Escape')
    await expect(menue).not.toHaveAttribute('open', '')
  })

  test('scrollt auf keiner Breite horizontal', async ({ page }) => {
    for (const width of [1440, 1280, 1024, 768, 560]) {
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

  /*
   * Redaktioneller Durchstich — bewusst übersprungen.
   *
   * Der Test müsste die Local API im Playwright-Prozess aufrufen. Die
   * `afterChange`-Hooks rufen dort zwar `revalidateTag('pages:home')` auf, der
   * Aufruf läuft aber ausserhalb eines Next-Request-Scopes ins Leere (siehe
   * `safeRevalidate` in src/hooks/revalidate.ts). Der Dev-Server behält damit
   * seinen `unstable_cache`-Eintrag und zeigt weiter den alten Text — der Test
   * wäre rot, obwohl die Anwendung korrekt ist.
   *
   * Sobald es eine Revalidierungs-Route gibt (oder der Durchstich über das
   * Admin-UI läuft, das im Server-Prozess revalidiert), hier `test.skip` durch
   * `test` ersetzen. Manuell geprüft wird der Durchstich in T19.
   */
  test.skip('zeigt eine über die Local API geänderte Überschrift nach dem Neuladen', async ({
    page,
  }) => {
    const { getPayload } = await import('payload')
    const { default: config } = await import('../../src/payload.config.js')
    const payload = await getPayload({ config: await config })

    const { docs } = await payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      where: { slug: { equals: 'home' } },
    })

    const home = docs[0]
    expect(home, 'Startseite ist nicht geseedet.').toBeTruthy()

    const layout = home.layout
    const textIntro = layout.find(
      (block): block is TextIntroBlock => block.blockType === 'textIntro',
    )
    expect(textIntro, 'Kein textIntro-Block auf der Startseite.').toBeTruthy()

    const original = textIntro.heading
    const neu = `Durchstich ${Date.now()}`
    const mitUeberschrift = (heading: string) =>
      layout.map((block) => (block === textIntro ? { ...textIntro, heading } : block))

    await payload.update({
      collection: 'pages',
      data: { layout: mitUeberschrift(neu) },
      id: home.id,
    })

    try {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      await expect(page.locator('[data-block="textIntro"]')).toContainText(neu)
    } finally {
      await payload.update({
        collection: 'pages',
        data: { layout: mitUeberschrift(original) },
        id: home.id,
      })
    }
  })
})

test.describe('Startseite bei reduzierter Bewegung', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('spielt kein Video und zeigt alle Hero-Texte sofort', async ({ page }) => {
    await page.goto(BASE_URL)

    const hero = page.locator('[data-block="hero"]')
    test.skip((await hero.count()) === 0, 'Kein Hero-Block — die Startseite ist nicht geseedet.')

    // Autoplay würde in den ersten Millisekunden nach dem Laden greifen.
    await page.waitForTimeout(600)

    const video = hero.locator('video')
    if ((await video.count()) > 0) {
      const pausiert = await video
        .first()
        .evaluate((element) => (element as HTMLVideoElement).paused)
      expect(pausiert, 'Bei reduzierter Bewegung darf das Video nicht laufen.').toBe(true)
    }

    // Kein Wipe-In: im Hero läuft keine Animation mehr.
    const laeuftEineAnimation = await hero
      .first()
      .evaluate((element) =>
        element
          .getAnimations({ subtree: true })
          .some((animation) => animation.playState === 'running'),
      )
    expect(laeuftEineAnimation, 'Bei reduzierter Bewegung darf nichts animiert werden.').toBe(false)

    await expect(page.locator('h1')).toBeVisible()

    const heroTexte = hero.locator('p, li, dd, a')
    const anzahl = await heroTexte.count()
    for (let i = 0; i < anzahl; i++) {
      const element = heroTexte.nth(i)
      const sichtbar = await element.evaluate((node) => {
        const stil = getComputedStyle(node)
        return stil.visibility !== 'hidden' && Number(stil.opacity) > 0
      })
      expect(sichtbar, `Hero-Text ${i} ist nicht sofort sichtbar.`).toBe(true)
    }
  })
})

test.describe('Startseite auf dem Telefon', () => {
  test.use({ viewport: { height: 844, width: 390 } })

  test('öffnet das Burger-Menü und scrollt nicht horizontal', async ({ page }) => {
    await page.goto(BASE_URL)

    // Erst die geschlossene Seite messen — mit offenem Overlay liegt
    // `overflow: hidden` auf dem Body und verfälscht die Breiten.
    const { clientWidth, scrollWidth } = await breiten(page)
    expect(scrollWidth, 'Querscrollen bei 390 px').toBeLessThanOrEqual(clientWidth)

    const burger = page
      .getByRole('button', { name: /menü|menu|navigation/i })
      .filter({ visible: true })
      .first()

    await expect(
      burger,
      'Unter 768 px braucht es einen sichtbaren Burger-Knopf mit zugänglichem Namen (z. B. „Menü öffnen").',
    ).toBeVisible()

    await burger.click()
    await expect(burger).toHaveAttribute('aria-expanded', 'true')

    // Der Hintergrund darf nicht mitscrollen, solange das Overlay offen ist (Spec 7.2).
    const gesperrt = await page.evaluate(() => {
      const werte = [
        getComputedStyle(document.body).overflow,
        getComputedStyle(document.documentElement).overflow,
      ]
      return werte.some((wert) => wert === 'hidden' || wert === 'clip')
    })
    expect(gesperrt, 'Bei offenem Overlay gehört overflow: hidden auf body oder html.').toBe(true)
  })
})
