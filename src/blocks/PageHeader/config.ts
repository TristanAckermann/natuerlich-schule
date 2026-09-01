import type { Block } from 'payload'

/**
 * Auftakt einer Unterseite: die einzige Stelle ausser dem Hero, die ein `h1`
 * rendert. Der Hero passt dafür nicht — er verlangt genau drei Teaser und ist
 * auf das Videoband der Startseite zugeschnitten.
 *
 * Gehört an den Anfang einer Seite. Zwei Seitenköpfe auf derselben Seite
 * ergäben zwei `h1` und sind redaktionell zu vermeiden; erzwungen wird das
 * nicht, weil Payload die Position eines Blocks im Layout nicht validieren kann.
 */
export const PageHeader: Block = {
  slug: 'pageHeader',
  fields: [
    {
      name: 'icon',
      type: 'upload',
      admin: {
        description:
          'Optionales, rein dekoratives Symbol über dem Titel — zum Beispiel das Signet ' +
          'der Schule. Es wird ohne Alternativtext ausgegeben, weil der Titel direkt ' +
          'darunter steht; für ein Bild mit eigener Aussage ist dieses Feld nicht ' +
          'gedacht. Ohne Bild beginnt die Seite direkt mit dem Titel.',
      },
      filterOptions: () => ({ mimeType: { like: 'image' } }),
      label: 'Symbol',
      relationTo: 'media',
    },
    {
      name: 'heading',
      type: 'textarea',
      admin: {
        description:
          'Der Titel der Seite. Zeilenumbrüche werden übernommen — das Design bricht die Überschrift bewusst um.',
      },
      label: 'Titel',
      required: true,
    },
    {
      name: 'lead',
      type: 'textarea',
      admin: {
        description: 'Ein bis zwei Sätze neben dem Titel. Leer lassen für einen Titel allein.',
      },
      label: 'Lead',
    },
  ],
  interfaceName: 'PageHeaderBlock',
  labels: { plural: 'Seitenköpfe', singular: 'Seitenkopf' },
}
