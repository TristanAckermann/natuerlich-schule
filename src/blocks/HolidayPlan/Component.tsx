import React from 'react'

import type { HolidayPlanBlock } from '@/payload-types'

import type { HolidayEntryView, HolidayPeriod, HolidayYearView } from './HolidayYears.client'

import { HolidayYears } from './HolidayYears.client'
import styles from './index.module.css'

type Entry = NonNullable<NonNullable<HolidayPlanBlock['years']>[number]['entries']>[number]

/*
 * `timeZone: 'UTC'` ist zwingend, nicht kosmetisch: die Datumsfelder stehen als
 * 12:00 UTC des gewählten Tages in der Datenbank (siehe config.ts). In lokaler
 * Zeit formatiert würde daraus westlich von Greenwich der Vortag.
 */
const day = new Intl.DateTimeFormat('de-CH', { day: 'numeric', timeZone: 'UTC' })
const dayMonth = new Intl.DateTimeFormat('de-CH', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})
const dayMonthYear = new Intl.DateTimeFormat('de-CH', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric',
})
const weekday = new Intl.DateTimeFormat('de-CH', { timeZone: 'UTC', weekday: 'short' })

const parse = (value?: null | string): Date | null => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Tagesdatum als `YYYY-MM-DD` — für `dateTime` und den Vergleich im Browser. */
const isoDay = (date: Date): string => date.toISOString().slice(0, 10)

/**
 * Zeitraum in Lesefassung. Monat und Jahr stehen so oft, wie sie gebraucht
 * werden, und nicht öfter: innerhalb desselben Monats nur einmal am Ende
 * („13. – 21. Februar 2027“), über den Monatswechsel hinweg mit beiden Monaten
 * („19. September – 11. Oktober 2026“), über den Jahreswechsel hinweg
 * ausgeschrieben auf beiden Seiten. Ein einzelner Tag bekommt zusätzlich den
 * Wochentag — bei einem freien Tag ist er die eigentliche Information.
 */
const buildPeriod = (entry: Entry): HolidayPeriod | null => {
  const from = parse(entry.from)
  if (!from) return null

  const to = parse(entry.to)
  const fromIso = isoDay(from)

  if (!to || isoDay(to) === fromIso) {
    return { start: `${weekday.format(from)}, ${dayMonthYear.format(from)}`, startIso: fromIso }
  }

  const sameYear = from.getUTCFullYear() === to.getUTCFullYear()
  const sameMonth = sameYear && from.getUTCMonth() === to.getUTCMonth()

  // `day` liefert im Deutschen die blosse Zahl; der Punkt der Ordnungszahl
  // gehört hier dazu.
  const start = sameMonth
    ? `${day.format(from)}.`
    : sameYear
      ? dayMonth.format(from)
      : dayMonthYear.format(from)

  return {
    end: dayMonthYear.format(to),
    endIso: isoDay(to),
    start,
    startIso: fromIso,
  }
}

/**
 * Die Zeilen rendert eine Client-Komponente, damit sich die Hervorhebung bei
 * jedem Render neu aus dem Inhalt ableitet. Formatiert wird aber hier, auf dem
 * Server: `Intl` bleibt damit aus dem Bundle und die Daten stehen im
 * ausgelieferten HTML.
 */
const buildYears = (years: HolidayPlanBlock['years']): HolidayYearView[] =>
  (years ?? []).map((year, yearIndex) => ({
    entries: (year.entries ?? []).map((entry, entryIndex): HolidayEntryView => {
      const period = buildPeriod(entry)

      return {
        fallback: period ? undefined : (entry.from ?? ''),
        key: entry.id ?? String(entryIndex),
        name: entry.name,
        note: entry.note,
        period: period ?? undefined,
      }
    }),
    key: year.id ?? String(yearIndex),
    label: year.label,
  }))

export const HolidayPlanComponent: React.FC<HolidayPlanBlock> = ({ heading, years }) => {
  const yearList = buildYears(years)

  return (
    <section className={styles.section} data-block="holidayPlan">
      <div className={styles.inner}>
        <h2 className={styles.heading}>{heading}</h2>

        {yearList.length > 0 ? <HolidayYears years={yearList} /> : null}
      </div>
    </section>
  )
}
