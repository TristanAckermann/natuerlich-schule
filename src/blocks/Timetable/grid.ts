import type { TimetableBlock } from '@/payload-types'

export type TimetableRow = NonNullable<TimetableBlock['rows']>[number]
export type TimetableCell = NonNullable<TimetableRow['cells']>[number]
export type TimetableColumn = NonNullable<TimetableBlock['columns']>[number]

/** Eine Zelle mit ihrer tatsächlichen Position und geklemmten Spannen. */
export type PlacedCell = {
  cell: TimetableCell
  colSpan: number
  column: number
  rowSpan: number
}

/** Eine Tabellenzeile, wie sie gerendert wird. */
export type PlacedRow = {
  cells: PlacedCell[]
  time: TimetableRow['time']
}

/** Ein Wochentag für die mobile Kartenansicht. */
export type TimetableDay = {
  label: string
  entries: {
    text: string
    time: string
    variant: TimetableCell['variant']
  }[]
}

/** Klemmt einen möglicherweise leeren oder unsinnigen Spannen-Wert auf 1…max. */
const span = (value: number | null | undefined, max: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 1
  return Math.min(Math.max(Math.trunc(value), 1), Math.max(max, 1))
}

/**
 * Verteilt die redaktionell erfassten Zellen auf das Raster.
 *
 * In den Daten steht — wie in HTML — nur die erste Zelle eines Verbunds; alle
 * von `colSpan` / `rowSpan` überdeckten Positionen werden nicht erneut erfasst.
 * Hier wird genau das rückgängig gemacht: ein Spaltenzeiger läuft je Zeile von
 * links nach rechts und überspringt, was ein Zeilenverbund von oben schon
 * belegt hat.
 *
 * Ergebnis sind zwei Sichten auf denselben Durchlauf:
 * - `placements` — je Zeile die tatsächlich erfassten Zellen mit geklemmten
 *   Spannen. Daraus rendert die Tabelle, damit sie nie breiter wird als ihre
 *   Kopfzeile.
 * - `grid` — die vollständige Matrix, in der jede überdeckte Position auf
 *   dieselbe Zelle zeigt. Daraus entsteht die spaltenweise Kartenansicht.
 *
 * Beide entstehen gemeinsam, damit Tabelle und Karten unter keinen Umständen
 * ein unterschiedliches Raster zeigen.
 *
 * Fehlt eine Zelle (zu wenige Zellen erfasst), bleibt die Position `null`.
 * Reicht eine Zelle über eine bereits belegte Position hinweg, behält die
 * frühere Zelle ihren Platz — ein Überschreiben würde Inhalt verschlucken.
 * Die Funktion wirft nie; ein Redaktionsfehler darf die Seite nicht zerlegen.
 */
const place = (
  rows: TimetableRow[] | null | undefined,
  columnCount: number,
): { grid: (TimetableCell | null)[][]; placements: PlacedRow[] } => {
  const rowList = rows ?? []
  const columns = Math.max(Math.trunc(columnCount) || 0, 0)

  const grid: (TimetableCell | null)[][] = rowList.map(() => new Array(columns).fill(null))
  const placements: PlacedRow[] = rowList.map((row) => ({
    cells: [] as PlacedCell[],
    time: row.time,
  }))

  if (columns === 0) return { grid, placements }

  rowList.forEach((row, rowIndex) => {
    let columnIndex = 0

    for (const cell of row.cells ?? []) {
      // Bereits von einem früheren Zeilenverbund belegte Spalten überspringen.
      while (columnIndex < columns && grid[rowIndex][columnIndex] !== null) columnIndex += 1
      if (columnIndex >= columns) break

      const colSpan = span(cell.colSpan, columns - columnIndex)
      const rowSpan = span(cell.rowSpan, rowList.length - rowIndex)

      placements[rowIndex].cells.push({ cell, colSpan, column: columnIndex, rowSpan })

      for (let r = rowIndex; r < rowIndex + rowSpan; r += 1) {
        for (let c = columnIndex; c < columnIndex + colSpan; c += 1) {
          // Belegte Positionen bleiben, wie sie sind — siehe Kommentar oben.
          if (grid[r][c] === null) grid[r][c] = cell
        }
      }

      columnIndex += colSpan
    }
  })

  return { grid, placements }
}

/** Die vollständige Matrix; jede überdeckte Position zeigt auf ihre Zelle. */
export const expandGrid = (
  rows: TimetableRow[] | null | undefined,
  columnCount: number,
): (TimetableCell | null)[][] => place(rows, columnCount).grid

/** Die Zeilen der Tabelle mit geklemmten Spannen. */
export const buildRows = (
  rows: TimetableRow[] | null | undefined,
  columnCount: number,
): PlacedRow[] => place(rows, columnCount).placements

/**
 * Baut aus dem Raster die spaltenweise Sicht für die mobile Kartenansicht:
 * je Wochentag eine Liste aus Zeit und Inhalt.
 *
 * Eine Zelle, die mehrere Zeilen überdeckt, erscheint hier in JEDER überdeckten
 * Zeit-Zeile. Das ist bewusst redundant: auf dem Handy fehlt der Tabellenkopf
 * als Orientierung, und die Frage „was läuft um 10:15?" wiegt schwerer als die
 * Information, dass zwei Lektionen zusammengehören.
 *
 * Zellen ohne Text werden übersprungen — sie tragen in der Liste nichts bei.
 */
export const buildDays = (
  rows: TimetableRow[] | null | undefined,
  columns: TimetableColumn[] | null | undefined,
): TimetableDay[] => {
  const columnList = columns ?? []
  const rowList = rows ?? []
  const grid = expandGrid(rowList, columnList.length)

  return columnList.map((column, columnIndex) => ({
    label: column.label,
    entries: rowList.flatMap((row, rowIndex) => {
      const cell = grid[rowIndex]?.[columnIndex]
      const text = cell?.text?.trim()
      if (!cell || !text) return []

      return [{ text, time: row.time?.trim() ?? '', variant: cell.variant }]
    }),
  }))
}
