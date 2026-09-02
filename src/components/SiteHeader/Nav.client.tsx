'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useId, useRef, useState } from 'react'

import styles from './index.module.css'

/**
 * Ein aufgelöster Navigationseintrag. Die Auflösung passiert im Server-Teil
 * (index.tsx) — hier kommen nur noch einfache, serialisierbare Werte an.
 */
export type NavLink = {
  href: string
  /**
   * true, wenn `resolveHref()` kein Ziel liefern konnte. Die Unterseiten
   * existieren noch nicht (Spec Abschnitt 2, „Out of Scope"); der Eintrag
   * wird sichtbar, aber als `aria-disabled` gerendert.
   */
  isPlaceholder: boolean
  label: string
  newTab: boolean
}

export type NavGroup = {
  items: NavLink[]
  label: string
}

export type NavUtilityLink = NavLink & {
  /** Hebt den Eintrag in der Akzentfarbe hervor. */
  highlight: boolean
}

export type NavLogo = {
  height: number | null
  src: string
  width: number | null
}

export type NavProps = {
  groups: NavGroup[]
  homeLabel: string
  /** Fehlt das Bild, tritt die Wortmarke als Text an seine Stelle. */
  logo: NavLogo | null
  searchEnabled: boolean
  utility: NavUtilityLink[]
  wordmark: string
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'

/* Dekorative Symbole aus dem Mockup — ohne eigene Semantik. */

const HouseIcon: React.FC = () => (
  <svg aria-hidden="true" focusable="false" height="18" viewBox="0 0 24 24" width="18">
    <path
      d="M3.5 10.2 12 3.6l8.5 6.6V20a.9.9 0 0 1-.9.9h-4.4v-6.3H8.8v6.3H4.4a.9.9 0 0 1-.9-.9z"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
)

const MenuIcon: React.FC = () => (
  <svg aria-hidden="true" focusable="false" height="19" viewBox="0 0 24 24" width="19">
    <path
      d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
    />
  </svg>
)

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    focusable="false"
    height="17"
    viewBox="0 0 24 24"
    width="17"
  >
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.4 15.4 4.6 4.6" />
    </g>
  </svg>
)

const CloseIcon: React.FC = () => (
  <svg aria-hidden="true" focusable="false" height="20" viewBox="0 0 24 24" width="20">
    <path
      d="m5.5 5.5 13 13m0-13-13 13"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
    />
  </svg>
)

const ChevronIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    focusable="false"
    height="14"
    viewBox="0 0 24 24"
    width="14"
  >
    <path
      d="m5 9 7 7 7-7"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
)

const classNames = (...values: (string | false | undefined)[]): string =>
  values.filter(Boolean).join(' ')

/**
 * Rendert einen aufgelösten Eintrag. Interne Ziele (führender Schrägstrich)
 * laufen über `next/link`, alles andere über ein `<a>`. Ohne Ziel bleibt der
 * Eintrag sichtbar, ist aber als `aria-disabled` gekennzeichnet.
 */
const NavAnchor: React.FC<{
  className: string
  item: NavLink
  onNavigate?: () => void
  placeholderClassName: string
}> = ({ className, item, onNavigate, placeholderClassName }) => {
  if (item.isPlaceholder) {
    return (
      <a aria-disabled="true" className={classNames(className, placeholderClassName)} href="#">
        {item.label}
      </a>
    )
  }

  if (item.href.startsWith('/')) {
    return (
      <Link className={className} href={item.href} onClick={onNavigate}>
        {item.label}
      </Link>
    )
  }

  return (
    <a
      className={className}
      href={item.href}
      onClick={onNavigate}
      rel={item.newTab ? 'noopener noreferrer' : undefined}
      target={item.newTab ? '_blank' : undefined}
    >
      {item.label}
    </a>
  )
}

/**
 * Das gesamte Verhalten der Kopfzeile (Spec 7.2).
 *
 * Die Komponente liefert bewusst ein Fragment aus zwei Geschwistern: die obere
 * Zeile und die aufklappende Unterzeile. Die Unterzeile spannt sich über die
 * volle Breite und trägt eine eigene Haarlinie — sie darf deshalb nicht in der
 * gepolsterten oberen Zeile stecken. Weil ihr Zustand hier liegt, gehört auch
 * die obere Zeile inklusive Logo in diese Client-Komponente; der Server-Teil
 * reicht nur Daten herein, keine React-Elemente.
 */
export const Nav: React.FC<NavProps> = ({
  groups,
  homeLabel,
  logo,
  searchEnabled,
  utility,
  wordmark,
}) => {
  const pathname = usePathname()
  const isHome = pathname === '/'

  const baseId = useId()
  const subrowId = `${baseId}-unterzeile`
  const overlayId = `${baseId}-overlay`
  const searchInputId = `${baseId}-suche`
  const overlaySearchInputId = `${baseId}-suche-mobil`

  const [openGroup, setOpenGroup] = useState<number | null>(null)
  /**
   * Die zuletzt geöffnete Gruppe bleibt beim Schliessen im Markup stehen —
   * sonst wäre die Unterzeile während der .34s-Transition leer.
   */
  const [renderedGroup, setRenderedGroup] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  const groupButtons = useRef<(HTMLButtonElement | null)[]>([])
  const utilityRef = useRef<HTMLDetailsElement | null>(null)
  const utilitySummaryRef = useRef<HTMLElement | null>(null)
  const burgerRef = useRef<HTMLButtonElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const overlayCloseRef = useRef<HTMLButtonElement | null>(null)

  const toggleGroup = useCallback((index: number) => {
    setRenderedGroup(index)
    setOpenGroup((current) => (current === index ? null : index))
  }, [])

  const closeMobile = useCallback(() => {
    setMobileOpen(false)
    burgerRef.current?.focus()
  }, [])

  /* Escape schliesst von innen nach aussen und gibt den Fokus zurück. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      if (mobileOpen) {
        closeMobile()
        return
      }

      if (utilityRef.current?.open) {
        utilityRef.current.open = false
        utilitySummaryRef.current?.focus()
        return
      }

      if (openGroup !== null) {
        const trigger = groupButtons.current[openGroup]
        setOpenGroup(null)
        trigger?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [closeMobile, mobileOpen, openGroup])

  /* Ein Klick ausserhalb der Kopfzeile schliesst Gruppe und Menü. */
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null

      if (utilityRef.current?.open && !utilityRef.current.contains(target)) {
        utilityRef.current.open = false
      }

      if (openGroup === null) return
      if (target?.closest?.('[data-site-header]')) return
      setOpenGroup(null)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [openGroup])

  /* Solange das Overlay offen ist, scrollt nur das Overlay. */
  useEffect(() => {
    if (!mobileOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    overlayCloseRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileOpen])

  /* Wird der Viewport breit genug, übernimmt wieder die normale Zeile. */
  useEffect(() => {
    if (!mobileOpen) return

    const query = window.matchMedia('(min-width: 768px)')
    const onChange = () => {
      if (query.matches) setMobileOpen(false)
    }

    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [mobileOpen])

  /* Fokusfalle: Tab läuft im Overlay im Kreis. */
  const onOverlayKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return

    const root = overlayRef.current
    if (!root) return

    const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (element) => element.getClientRects().length > 0,
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement

    if (event.shiftKey && active === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }, [])

  const subrowItems = groups[renderedGroup]?.items ?? []

  /*
   * Das Logo liegt in einem Link mit aria-label — das Bild bleibt deshalb
   * dekorativ (alt=""), sonst läse ein Screenreader den Namen doppelt vor.
   * Bewusst ein <img> statt <Image>: Ein 34px hohes Logo gewinnt durch die
   * Bildoptimierung nichts, und die expliziten Abmessungen aus der
   * Media-Collection verhindern den Layoutsprung.
   */
  const logoImage = logo ? (
    // eslint-disable-next-line @next/next/no-img-element -- siehe Begründung oben
    <img
      alt=""
      className={styles.logoImage}
      decoding="async"
      fetchPriority="high"
      height={logo.height ?? undefined}
      src={logo.src}
      width={logo.width ?? undefined}
    />
  ) : (
    // Solange kein Logo hochgeladen ist, steht die Wortmarke als Text dort.
    <span className={styles.wordmark}>{wordmark}</span>
  )

  return (
    <>
      <div className={styles.bar} inert={mobileOpen}>
        <Link aria-label="Startseite" className={styles.logo} href="/">
          {logoImage}
        </Link>

        <nav aria-label="Hauptnavigation" className={styles.nav}>
          <Link
            aria-current={isHome ? 'page' : undefined}
            className={styles.homeLink}
            href="/"
            onClick={() => setOpenGroup(null)}
          >
            <HouseIcon />
            <span className={styles.homeLabel}>{homeLabel}</span>
          </Link>

          {groups.length > 0 ? (
            <ul className={styles.groups}>
              {groups.map((group, index) => (
                <li key={group.label}>
                  <button
                    aria-controls={subrowId}
                    aria-expanded={openGroup === index}
                    className={styles.groupButton}
                    onClick={() => toggleGroup(index)}
                    ref={(element) => {
                      groupButtons.current[index] = element
                    }}
                    type="button"
                  >
                    {group.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {utility.length > 0 ? (
            <details className={styles.utility} ref={utilityRef}>
              <summary
                aria-label="Weitere Links"
                className={styles.utilitySummary}
                ref={utilitySummaryRef}
              >
                <MenuIcon />
              </summary>
              <div className={styles.utilityPanel}>
                <ul>
                  {utility.map((item) => (
                    <li key={item.label}>
                      <NavAnchor
                        className={classNames(
                          styles.utilityLink,
                          item.highlight && styles.utilityLinkHighlight,
                        )}
                        item={item}
                        placeholderClassName={styles.utilityLinkPlaceholder}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ) : null}

          {searchEnabled ? (
            <form action="/suche" className={styles.search} role="search">
              <label className="ns-visually-hidden" htmlFor={searchInputId}>
                Suchen
              </label>
              <SearchIcon className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                id={searchInputId}
                name="q"
                placeholder="Suchen"
                type="search"
              />
            </form>
          ) : null}
        </nav>

        <button
          aria-controls={overlayId}
          aria-expanded={mobileOpen}
          aria-label="Menü öffnen"
          className={styles.burger}
          onClick={() => setMobileOpen(true)}
          ref={burgerRef}
          type="button"
        >
          <MenuIcon />
        </button>
      </div>

      {/*
       * Geschlossen ist die Unterzeile inert und aria-hidden — sonst lägen die
       * Links trotz max-height: 0 in der Tabreihenfolge.
       */}
      <div
        aria-hidden={openGroup === null}
        className={styles.subrow}
        data-open={openGroup !== null}
        id={subrowId}
        inert={openGroup === null}
      >
        <ul className={styles.subrowList}>
          {subrowItems.map((item) => (
            <li key={item.label}>
              <NavAnchor
                className={styles.subrowLink}
                item={item}
                onNavigate={() => setOpenGroup(null)}
                placeholderClassName={styles.subrowLinkPlaceholder}
              />
            </li>
          ))}
        </ul>
      </div>

      {/*
       * Das Overlay bleibt im Markup und wird über `hidden` geschaltet — so
       * zeigt `aria-controls` des Burgers immer auf ein vorhandenes Element.
       * `aria-modal` nimmt den Rest der Seite aus dem Screenreader-Baum,
       * `onKeyDown` hält den Tabulator im Overlay.
       */}
      <div
        aria-label="Menü"
        aria-modal="true"
        className={styles.overlay}
        hidden={!mobileOpen}
        id={overlayId}
        onKeyDown={onOverlayKeyDown}
        ref={overlayRef}
        role="dialog"
      >
        <div className={styles.overlayBar}>
          <Link
            aria-label="Startseite"
            className={styles.logo}
            href="/"
            onClick={() => setMobileOpen(false)}
          >
            {logoImage}
          </Link>
          <button
            aria-label="Menü schliessen"
            className={styles.overlayClose}
            onClick={closeMobile}
            ref={overlayCloseRef}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Der Dialog trägt den Namen — die Navigation darin braucht keinen. */}
        <nav className={styles.overlayNav}>
          <Link
            aria-current={isHome ? 'page' : undefined}
            className={styles.overlayHome}
            href="/"
            onClick={() => setMobileOpen(false)}
          >
            <HouseIcon />
            <span>{homeLabel}</span>
          </Link>

          {groups.map((group) => (
            <details className={styles.overlayGroup} key={group.label}>
              <summary className={styles.overlaySummary}>
                {group.label}
                <ChevronIcon className={styles.overlayChevron} />
              </summary>
              <ul className={styles.overlayList}>
                {group.items.map((item) => (
                  <li key={item.label}>
                    <NavAnchor
                      className={styles.overlayLink}
                      item={item}
                      onNavigate={() => setMobileOpen(false)}
                      placeholderClassName={styles.overlayLinkPlaceholder}
                    />
                  </li>
                ))}
              </ul>
            </details>
          ))}

          {utility.length > 0 ? (
            <ul className={styles.overlayUtility}>
              {utility.map((item) => (
                <li key={item.label}>
                  <NavAnchor
                    className={classNames(
                      styles.overlayLink,
                      item.highlight && styles.utilityLinkHighlight,
                    )}
                    item={item}
                    onNavigate={() => setMobileOpen(false)}
                    placeholderClassName={styles.overlayLinkPlaceholder}
                  />
                </li>
              ))}
            </ul>
          ) : null}

          {searchEnabled ? (
            <form action="/suche" className={styles.overlaySearch} role="search">
              <label className="ns-visually-hidden" htmlFor={overlaySearchInputId}>
                Suchen
              </label>
              <SearchIcon className={styles.searchIcon} />
              <input
                className={styles.overlaySearchInput}
                id={overlaySearchInputId}
                name="q"
                placeholder="Suchen"
                type="search"
              />
            </form>
          ) : null}
        </nav>
      </div>
    </>
  )
}
