import type { LinkField } from '@/payload-types'
import { resolveHref } from '@/components/CmsLink'
import { getHeader } from '@/utilities/getGlobals'

import { Nav, type NavGroup, type NavLink, type NavUtilityLink } from './Nav.client'
import styles from './index.module.css'

/**
 * Löst eine Link-Gruppe aus Payload in einen einfachen Eintrag auf.
 * Ohne Ziel bleibt der Eintrag als Platzhalter stehen — die Unterseiten
 * entstehen erst in späteren Specs (Spec 001, Abschnitt 2).
 */
const toNavLink = (link: LinkField): NavLink => {
  const href = resolveHref(link)

  return {
    href: href ?? '#',
    isPlaceholder: href === null,
    label: link.label,
    newTab: Boolean(link.newTab),
  }
}

/**
 * Server-Teil der Kopfzeile: lädt das Global `header`, löst Logo und Links auf
 * und übergibt ausschliesslich serialisierbare Daten an die Client-Komponente
 * (Spec 6.6 — ausser `Nav.client.tsx` und `HeroVideo.tsx` rendert alles auf
 * dem Server).
 */
export const SiteHeader = async () => {
  const header = await getHeader()

  // Ohne Global gibt es keine Kopfzeile — dann lieber nichts als ein Gerüst.
  if (!header?.wordmark) return null

  const logo = header.logo
  const hasLogo = Boolean(logo && typeof logo !== 'number' && logo.url)

  const groups: NavGroup[] = (header.groups ?? [])
    .map((group) => ({
      items: (group.items ?? []).map((item) => toNavLink(item.link)),
      label: group.label,
    }))
    // Eine Gruppe ohne Unterpunkte hätte nichts aufzuklappen.
    .filter((group) => group.items.length > 0)

  const utility: NavUtilityLink[] = (header.utilityLinks ?? []).map((entry) => ({
    ...toNavLink(entry.link),
    highlight: Boolean(entry.highlight),
  }))

  return (
    /*
     * `data-site-header` ist der Anker für den Klick-ausserhalb-Test in
     * Nav.client.tsx, `data-on-dark` schaltet den hellen Fokusring aus
     * globals.css. Die Fläche selbst regelt das CSS-Modul: über einem
     * Hero-Block liegt die Zeile transparent darüber, sonst auf Tannengrün.
     */
    <header className={styles.header} data-on-dark data-site-header>
      <Nav
        groups={groups}
        homeLabel={header.homeLabel}
        logo={
          hasLogo && typeof logo !== 'number' && logo
            ? { height: logo.height ?? null, src: logo.url as string, width: logo.width ?? null }
            : null
        }
        searchEnabled={Boolean(header.searchEnabled)}
        utility={utility}
        wordmark={header.wordmark}
      />
    </header>
  )
}
