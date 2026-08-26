import type { Block, Validate } from 'payload'

/*
 * Der Ferienplan ist nach Schuljahren gruppiert, weil die Schule den Plan genau
 * so publiziert: pro Jahr eine Liste aus Ferien und einzelnen freien Tagen.
 * Ein Eintrag ohne `to` ist ein einzelner Tag (z. B. Auffahrt).
 *
 * Zeitzonen: Beide Datumsfelder laufen als `pickerAppearance: 'dayOnly'`. Payload
 * normalisiert solche Werte im Datepicker auf 12:00 UTC des gewählten Tages —
 * unabhängig von der Zeitzone der Redaktion. Der gespeicherte Wert ist damit
 * eindeutig ein Tagesdatum, und das Frontend muss ihn in UTC formatieren
 * (`timeZone: 'UTC'`), sonst würde aus dem 19. September lokal der 18. September.
 * Die `timezone`-Option von Payload wird bewusst NICHT gesetzt: Ferien haben
 * keine Uhrzeit, ein zusätzliches Zeitzonenfeld wäre nur Ballast in Redaktion
 * und Datenbank.
 */
export const HolidayPlan: Block = {
  slug: 'holidayPlan',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Überschrift',
      required: true,
    },
    {
      name: 'years',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          admin: {
            description: 'Beispiel: Schulferien 2026 – 27.',
          },
          label: 'Bezeichnung',
          required: true,
        },
        {
          name: 'entries',
          type: 'array',
          fields: [
            {
              name: 'name',
              type: 'text',
              admin: {
                description: 'Beispiel: Herbstferien.',
              },
              label: 'Bezeichnung',
              required: true,
            },
            {
              name: 'from',
              type: 'date',
              admin: {
                date: {
                  displayFormat: 'dd.MM.yyyy',
                  pickerAppearance: 'dayOnly',
                },
              },
              label: 'Erster Tag',
              required: true,
            },
            {
              name: 'to',
              type: 'date',
              admin: {
                date: {
                  displayFormat: 'dd.MM.yyyy',
                  pickerAppearance: 'dayOnly',
                },
                description: 'Leer lassen für einen einzelnen freien Tag.',
              },
              label: 'Letzter Tag',
              /*
               * Die Prüfung sitzt auf `to`, weil nur dort beide Werte über
               * `siblingData` desselben Eintrags erreichbar sind. Ein eigener
               * `validate` ersetzt Payloads eingebauten `date`-Validator
               * vollständig — die Prüfung auf ein lesbares Datum muss deshalb
               * hier mitlaufen, sonst käme ein unparsbarer Wert über die API
               * ungeprüft durch. `Date.parse(String(...))` spiegelt bewusst,
               * wie Payload selbst ein Datum prüft.
               */
              validate: ((value, options) => {
                // Leer bleibt gültig: das markiert einen einzelnen freien Tag.
                if (!value) return true

                const to = Date.parse(String(value))
                if (Number.isNaN(to)) return 'Bitte ein gültiges Datum angeben.'

                const siblingData = options.siblingData as { from?: unknown } | undefined
                // Fehlt `from` oder ist es kaputt, meldet das dessen eigener Validator.
                if (!siblingData?.from) return true
                const from = Date.parse(String(siblingData.from))
                if (Number.isNaN(from)) return true

                if (to < from) {
                  return 'Der letzte Tag darf nicht vor dem ersten Tag liegen.'
                }
                return true
              }) as Validate<unknown, unknown, unknown, object>,
            },
            {
              name: 'note',
              type: 'text',
              admin: {
                description: 'Kurzer Hinweis in Klammern, z. B. „7 Wochen“.',
              },
              label: 'Zusatz',
            },
          ],
          labels: { plural: 'Einträge', singular: 'Eintrag' },
          label: 'Ferien und freie Tage',
          minRows: 1,
        },
      ],
      labels: { plural: 'Schuljahre', singular: 'Schuljahr' },
      label: 'Schuljahre',
      minRows: 1,
    },
  ],
  interfaceName: 'HolidayPlanBlock',
  labels: { plural: 'Ferienpläne', singular: 'Ferienplan' },
}
