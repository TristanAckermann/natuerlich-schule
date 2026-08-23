import type { Block } from 'payload'

/*
 * Das Datenmodell bildet bewusst die Semantik einer HTML-Tabelle ab: Zeilen
 * enthalten Zellen, und `colSpan` / `rowSpan` verbinden Zellen genau so wie im
 * gedruckten Original-Stundenplan — die „Frühstunde" läuft über alle Wochentage,
 * „Wald" über zwei Lektionen. Zellen, die von einem solchen Verbund bereits
 * überdeckt sind, werden in der Redaktion nicht erneut erfasst.
 *
 * Eine Validierung über mehrere Zeilen hinweg (Summe der Spannen pro Zeile)
 * gibt es absichtlich nicht: Zeilenverbünde ziehen sich über nachfolgende
 * Zeilen, weshalb eine solche Prüfung regelmässig korrekte Pläne fälschlich
 * beanstanden würde.
 */
export const Timetable: Block = {
  slug: 'timetable',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Überschrift',
      required: true,
    },
    {
      name: 'columns',
      type: 'array',
      admin: {
        description: 'Die Kopfzeile der Tabelle, üblicherweise Montag bis Freitag.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Beschriftung',
          required: true,
        },
      ],
      labels: { plural: 'Spalten', singular: 'Spalte' },
      label: 'Spalten (Wochentage)',
      maxRows: 7,
      minRows: 1,
    },
    {
      name: 'rows',
      type: 'array',
      fields: [
        {
          name: 'time',
          type: 'textarea',
          admin: {
            description:
              'Inhalt der linken Kopfspalte, z. B. 08:15-09:00. Zeilenumbrüche werden übernommen. Leer lassen für eine Zeile ohne Zeitangabe.',
          },
          label: 'Zeit',
        },
        {
          name: 'cells',
          type: 'array',
          admin: {
            description:
              'Die Zellen werden wie in HTML von links nach rechts gefüllt. Eine Zelle, die von einem Zeilen- oder Spaltenverbund einer früheren Zelle bereits überdeckt ist, wird hier NICHT noch einmal erfasst.',
          },
          fields: [
            {
              name: 'text',
              type: 'textarea',
              admin: {
                description: 'Leer lassen für eine leere Zelle. Zeilenumbrüche werden übernommen.',
              },
              label: 'Inhalt',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'colSpan',
                  type: 'number',
                  admin: { step: 1, width: '33%' },
                  defaultValue: 1,
                  label: 'Spalten verbinden',
                  max: 7,
                  min: 1,
                },
                {
                  name: 'rowSpan',
                  type: 'number',
                  admin: { step: 1, width: '33%' },
                  defaultValue: 1,
                  label: 'Zeilen verbinden',
                  max: 20,
                  min: 1,
                },
                {
                  name: 'variant',
                  type: 'select',
                  admin: { width: '33%' },
                  defaultValue: 'lektion',
                  label: 'Darstellung',
                  options: [
                    { label: 'Lektion', value: 'lektion' },
                    { label: 'Pause', value: 'pause' },
                    { label: 'Organisatorisch', value: 'organisation' },
                  ],
                  required: true,
                },
              ],
            },
          ],
          labels: { plural: 'Zellen', singular: 'Zelle' },
          label: 'Zellen',
        },
      ],
      labels: { plural: 'Zeilen', singular: 'Zeile' },
      label: 'Zeilen',
      minRows: 1,
    },
    {
      name: 'legend',
      type: 'array',
      admin: {
        description: 'Auflösung der Abkürzungen unterhalb der Tabelle.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'abbreviation',
              type: 'text',
              admin: { width: '30%' },
              label: 'Abkürzung',
              required: true,
            },
            {
              name: 'meaning',
              type: 'text',
              admin: { width: '70%' },
              label: 'Bedeutung',
              required: true,
            },
          ],
        },
      ],
      labels: { plural: 'Einträge', singular: 'Eintrag' },
      label: 'Legende',
    },
  ],
  interfaceName: 'TimetableBlock',
  labels: { plural: 'Stundenpläne', singular: 'Stundenplan' },
}
