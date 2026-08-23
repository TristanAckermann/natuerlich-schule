import type { GroupField, Validate } from 'payload'

export type LinkFieldOptions = {
  /** Feldname der Gruppe. Default `link`. */
  name?: string
  /** Sichtbares Label der Gruppe im Admin. */
  label?: string
  /** Vorbelegung des Linktexts, z. B. `Mehr erfahren`. */
  labelDefault?: string
  /**
   * Ist die Gruppe zwingend auszufüllen? Steuert nur die Validierung des
   * Ziels — `label` ist immer Pflicht.
   */
  required?: boolean
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const requireWhen =
  (type: 'internal' | 'external' | 'email', message: string): Validate<unknown, unknown, unknown, object> =>
  (value, { siblingData }) => {
    const data = siblingData as { type?: string } | undefined
    if (data?.type !== type) return true
    if (value === undefined || value === null || value === '') return message
    return true
  }

/**
 * Einheitliche Link-Semantik für Blöcke und Globals.
 *
 * Die Zielfelder sind bewusst **nicht** `required`, weil Payload `required`
 * auch dann erzwingt, wenn `admin.condition` das Feld ausblendet. Stattdessen
 * validiert jedes Zielfeld selbst gegen `type` — so ist immer genau eines von
 * `page` / `url` / `email` gesetzt.
 */
export const linkField = ({
  name = 'link',
  label = 'Link',
  labelDefault,
  required = true,
}: LinkFieldOptions = {}): GroupField => ({
  name,
  type: 'group',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'radio',
          admin: { layout: 'horizontal', width: '50%' },
          defaultValue: 'internal',
          label: 'Ziel',
          options: [
            { label: 'Interne Seite', value: 'internal' },
            { label: 'Externe URL', value: 'external' },
            { label: 'E-Mail', value: 'email' },
          ],
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          admin: {
            description: 'Der sichtbare Linktext. Ohne Pfeil — den setzt das Layout.',
            width: '50%',
          },
          defaultValue: labelDefault,
          label: 'Linktext',
          required: true,
        },
      ],
    },
    {
      name: 'page',
      type: 'relationship',
      admin: {
        condition: (_data, siblingData) => siblingData?.type === 'internal',
      },
      label: 'Seite',
      relationTo: 'pages',
      validate: required
        ? requireWhen('internal', 'Bitte eine Seite auswählen.')
        : undefined,
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (_data, siblingData) => siblingData?.type === 'external',
        description: 'Vollständige Adresse inklusive https://',
      },
      label: 'URL',
      validate: ((value, options) => {
        const siblingData = options.siblingData as { type?: string } | undefined
        if (siblingData?.type !== 'external') return true
        if (typeof value !== 'string' || value === '') return 'Bitte eine URL angeben.'
        try {
          const parsed = new URL(value)
          if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return 'Nur http:// und https:// sind erlaubt.'
          }
          return true
        } catch {
          return 'Das ist keine gültige URL.'
        }
      }) as Validate<unknown, unknown, unknown, object>,
    },
    {
      name: 'email',
      type: 'text',
      admin: {
        condition: (_data, siblingData) => siblingData?.type === 'email',
      },
      label: 'E-Mail-Adresse',
      validate: ((value, options) => {
        const siblingData = options.siblingData as { type?: string } | undefined
        if (siblingData?.type !== 'email') return true
        if (typeof value !== 'string' || value === '') return 'Bitte eine E-Mail-Adresse angeben.'
        return EMAIL_PATTERN.test(value) ? true : 'Das ist keine gültige E-Mail-Adresse.'
      }) as Validate<unknown, unknown, unknown, object>,
    },
    {
      name: 'newTab',
      type: 'checkbox',
      admin: {
        condition: (_data, siblingData) => siblingData?.type === 'external',
      },
      defaultValue: false,
      label: 'In neuem Tab öffnen',
    },
  ],
  interfaceName: 'LinkField',
  label,
})
