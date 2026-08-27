'use client'

import React, { useMemo, useSyncExternalStore } from 'react'

import styles from './index.module.css'

/**
 * Die Schuljahr-Karten samt Hervorhebung der laufenden bzw. der als Nächstes
 * anstehenden Ferien.
 *
 * Warum die Auswertung im Browser läuft: die Seiten dieses Repos werden
 * unbegrenzt gecacht und nur über `revalidateTag` neu gebaut (siehe
 * `export const revalidate = false` in src/app/(frontend)/[slug]/page.tsx). Ein
 * auf dem Server aus `new Date()` abgeleiteter Zustand friert damit auf dem
 * Zeitpunkt des letzten Builds ein und zeigt Monate später immer noch dieselben
 * Ferien als „läuft“.
 *
 * Formatiert wird trotzdem auf dem Server (siehe Component.tsx): hier kommen
 * fertige Zeichenketten plus die ISO-Tage an. So bleibt `Intl` aus dem Bundle
 * und die Daten stehen vollständig im ausgelieferten HTML.
 *
 * `today` ist beim ersten Render bewusst `null` — dieser Render muss dem
 * Server-HTML gleichen, sonst gibt es eine Hydration-Abweichung. Ohne
 * JavaScript bleibt es dabei: die Liste ist vollständig, nur ohne
 * Hervorhebung.
 */

/** Massgeblich ist der Kalendertag in der Schweiz, nicht der des Geräts. */
const TIME_ZONE = 'Europe/Zurich'

const LABELS = { current: 'läuft', next: 'als Nächstes' } as const

type EntryState = 'current' | 'next' | 'past' | undefined

export type HolidayPeriod = {
  /** Fehlt bei einem einzelnen freien Tag. */
  end?: string
  endIso?: string
  start: string
  startIso: string
}

export type HolidayEntryView = {
  /** Rohwert, falls das Datum nicht lesbar war. */
  fallback?: string
  key: string
  name: string
  note?: null | string
  period?: HolidayPeriod
}

export type HolidayYearView = {
  entries: HolidayEntryView[]
  key: string
  label: string
}

/**
 * Heutiger Kalendertag als `YYYY-MM-DD`. In diesem Format lassen sich die
 * Datumsangaben als Zeichenketten vergleichen — ohne erneutes Parsen und ohne
 * Zeitzonenfallen.
 */
const currentDay = (): string => {
  const parts = new Intl.DateTimeFormat('de-CH', {
    day: '2-digit',
    month: '2-digit',
    timeZone: TIME_ZONE,
    year: 'numeric',
  }).formatToParts(new Date())

  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((entry) => entry.type === type)?.value ?? ''

  return `${part('year')}-${part('month')}-${part('day')}`
}

/** Zustand je Eintrag, in derselben Verschachtelung wie die Einträge selbst. */
const deriveStates = (years: HolidayYearView[], today: null | string): EntryState[][] => {
  if (!today) return years.map((year) => year.entries.map((): EntryState => undefined))

  let hasCurrent = false
  let nextFrom = ''
  let nextAt: [number, number] | null = null

  const states = years.map((year, yearIndex): EntryState[] =>
    year.entries.map((entry, entryIndex): EntryState => {
      const from = entry.period?.startIso
      if (!from) return undefined

      // Ein einzelner Tag endet an seinem Anfangstag.
      const to = entry.period?.endIso ?? from

      if (to < today) return 'past'
      if (from <= today) {
        hasCurrent = true
        return 'current'
      }

      // Über alle Schuljahre hinweg, nicht je Karte: gesucht ist der eine
      // nächste Termin.
      if (!nextFrom || from < nextFrom) {
        nextFrom = from
        nextAt = [yearIndex, entryIndex]
      }

      return undefined
    }),
  )

  // Läuft gerade etwas, ist das die Antwort — der übernächste Termin
  // interessiert dann nicht.
  if (!hasCurrent && nextAt) states[nextAt[0]][nextAt[1]] = 'next'

  return states
}

/*
 * Der heutige Tag ist ein Wert ausserhalb von React — gelesen über
 * `useSyncExternalStore` statt über `setState` in einem Effekt. Beim
 * Server-Render und beim Hydrieren gilt `getServerSnapshot`, also `null`: der
 * erste Render gleicht damit exakt dem ausgelieferten HTML. Die Uhr meldet sich
 * nicht von selbst, deshalb bleibt `subscribe` leer.
 */
const subscribe = (): (() => void) => () => {}
const getServerSnapshot = (): null => null

export const HolidayYears: React.FC<{ years: HolidayYearView[] }> = ({ years }) => {
  const today = useSyncExternalStore(subscribe, currentDay, getServerSnapshot)

  const states = useMemo(() => deriveStates(years, today), [today, years])

  return (
    <div className={styles.years}>
      {years.map((year, yearIndex) => (
        <section className={styles.year} key={year.key}>
          <h3 className={styles.yearHeading}>{year.label}</h3>

          {/*
           * Ferienname und Zeitraum sind eine Zuordnung, keine Aufzählung —
           * deshalb eine Definitionsliste, wie im Tagesablauf und in den
           * Tageskarten des Stundenplans.
           */}
          <dl className={styles.list}>
            {year.entries.map((entry, entryIndex) => {
              const state = states[yearIndex]?.[entryIndex]

              return (
                <div className={styles.row} data-state={state} key={entry.key}>
                  <dt className={styles.name}>{entry.name}</dt>
                  <dd className={styles.period}>
                    {entry.period ? (
                      <>
                        <time dateTime={entry.period.startIso}>{entry.period.start}</time>
                        {entry.period.end ? (
                          <>
                            {' – '}
                            <time dateTime={entry.period.endIso}>{entry.period.end}</time>
                          </>
                        ) : null}
                      </>
                    ) : (
                      // Unlesbares Datum darf die Seite nicht zum Absturz
                      // bringen: der Rohwert steht immer noch da.
                      entry.fallback
                    )}

                    {entry.note ? <span className={styles.note}> ({entry.note})</span> : null}

                    {/*
                     * Der Zustand darf nicht allein an der Farbe hängen: die
                     * Beschriftung steht als Text in der Zeile und wird
                     * mitgelesen.
                     */}
                    {state === 'current' || state === 'next' ? (
                      <span className={styles.flag}>{LABELS[state]}</span>
                    ) : null}
                  </dd>
                </div>
              )
            })}
          </dl>
        </section>
      ))}
    </div>
  )
}
