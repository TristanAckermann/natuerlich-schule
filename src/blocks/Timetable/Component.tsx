import React from 'react'

import type { TimetableBlock } from '@/payload-types'
import { slugify } from '@/utilities/slugify'

import { buildDays, buildRows } from './grid'
import styles from './index.module.css'

/**
 * Zeilenumbrüche aus den Textareas als echte Umbrüche rendern — ohne
 * `dangerouslySetInnerHTML`, der Inhalt bleibt reiner Text.
 */
const multiline = (text: string): React.ReactNode =>
  text.split('\n').map((zeile, index) => (
    <React.Fragment key={index}>
      {index > 0 ? <br /> : null}
      {zeile}
    </React.Fragment>
  ))

/** `colSpan`/`rowSpan` nur ausgeben, wenn sie tatsächlich verbinden. */
const attrSpan = (value: number): number | undefined => (value > 1 ? value : undefined)

export const TimetableComponent: React.FC<TimetableBlock> = ({
  heading,
  columns,
  id,
  legend,
  rows,
}) => {
  const columnList = columns ?? []
  const rowList = rows ?? []
  // Beide Ansichten stammen aus derselben Platzierung, siehe grid.ts.
  const tableRows = buildRows(rowList, columnList.length)
  const days = buildDays(rowList, columnList)

  // Stabile ID ohne `useId()` — die Komponente rendert auf dem Server.
  const tableId = `stundenplan-${id ?? slugify(heading)}`

  return (
    <section className={styles.section} data-block="timetable">
      <div className={styles.inner}>
        <h2 className={styles.heading} id={tableId}>
          {heading}
        </h2>

        {/*
         * Tabelle und Kartenansicht stehen beide im DOM, das CSS blendet je
         * nach Breite eine per `display: none` aus. Ein Umbau derselben
         * Elemente per CSS (`display: block` auf der Tabelle) wäre zwar
         * kompakter, zerstört aber die Tabellensemantik für Screenreader und
         * lässt die Zeitangabe pro Zelle verschwinden. So bleibt oben eine
         * echte Tabelle und unten eine echte Leseordnung.
         */}
        {rowList.length > 0 && columnList.length > 0 ? (
          <>
            <div
              aria-label={`${heading} — horizontal scrollbar`}
              className={styles.scroller}
              role="region"
              tabIndex={0}
            >
              <table aria-labelledby={tableId} className={styles.table}>
                <thead>
                  <tr>
                    {/* Die Ecke oben links beschriftet nichts und bleibt deshalb ein <td>. */}
                    <td className={styles.corner} />
                    {columnList.map((column, index) => (
                      <th className={styles.columnHead} key={column.id ?? index} scope="col">
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, rowIndex) => (
                    <tr key={rowList[rowIndex]?.id ?? rowIndex}>
                      <th className={styles.rowHead} scope="row">
                        {row.time ? multiline(row.time) : null}
                      </th>
                      {row.cells.map(({ cell, colSpan, rowSpan }, cellIndex) => (
                        <td
                          className={styles.cell}
                          colSpan={attrSpan(colSpan)}
                          data-variant={cell.variant}
                          key={cell.id ?? cellIndex}
                          rowSpan={attrSpan(rowSpan)}
                        >
                          {cell.text ? multiline(cell.text) : null}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.cards}>
              {days.map((day, dayIndex) => (
                <section className={styles.day} key={columnList[dayIndex]?.id ?? dayIndex}>
                  <h3 className={styles.dayHeading}>{day.label}</h3>
                  {/* Zeit und Inhalt sind eine Zuordnung, keine Aufzählung — wie im Tagesablauf. */}
                  <dl className={styles.dayList}>
                    {day.entries.map((entry, entryIndex) => (
                      <div className={styles.dayRow} key={entryIndex}>
                        <dt className={styles.dayTime}>
                          {entry.time ? multiline(entry.time) : null}
                        </dt>
                        <dd className={styles.dayText} data-variant={entry.variant}>
                          {multiline(entry.text)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          </>
        ) : null}

        {legend && legend.length > 0 ? (
          <dl className={styles.legend}>
            {legend.map((entry, index) => (
              <div className={styles.legendRow} key={entry.id ?? index}>
                <dt className={styles.legendTerm}>{entry.abbreviation}</dt>
                <dd className={styles.legendMeaning}>{entry.meaning}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  )
}
