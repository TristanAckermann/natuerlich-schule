import type { GlobalConfig } from 'payload'
import { LinkFeature, ParagraphFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

import { authenticated } from '@/access'
import { linkField } from '@/fields/link'
import { revalidateGlobals } from '@/hooks/revalidate'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
    update: authenticated,
  },
  admin: { group: 'Website' },
  fields: [
    {
      name: 'columns',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Überschrift',
          required: true,
        },
        {
          name: 'body',
          type: 'richText',
          admin: { description: 'Zeilenumbruch mit Umschalt + Enter.' },
          editor: lexicalEditor({
            features: () => [ParagraphFeature(), LinkFeature()],
          }),
          label: 'Inhalt',
          required: true,
        },
      ],
      labels: { plural: 'Spalten', singular: 'Spalte' },
      label: 'Spalten',
      maxRows: 4,
    },
    {
      name: 'organization',
      type: 'group',
      admin: {
        description:
          'Strukturierte Angaben für Suchmaschinen (schema.org EducationalOrganization). Sie erscheinen nicht sichtbar auf der Seite.',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Name der Schule',
          required: true,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'streetAddress',
              type: 'text',
              admin: { width: '50%' },
              label: 'Strasse und Nummer',
            },
            {
              name: 'postalCode',
              type: 'text',
              admin: { width: '20%' },
              label: 'PLZ',
            },
            {
              name: 'addressLocality',
              type: 'text',
              admin: { width: '30%' },
              label: 'Ort',
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'addressRegion',
              type: 'text',
              admin: { description: 'Kanton, z. B. BE.', width: '30%' },
              label: 'Kanton',
            },
            {
              name: 'email',
              type: 'text',
              admin: { width: '70%' },
              label: 'E-Mail-Adresse',
            },
          ],
        },
      ],
      label: 'Angaben für Suchmaschinen',
    },
    {
      name: 'legalNote',
      type: 'text',
      admin: { description: 'Einzeilige Angabe ganz unten links.' },
      label: 'Fusszeile',
    },
    {
      name: 'legalLinks',
      type: 'array',
      fields: [linkField({ required: false })],
      labels: { plural: 'Rechtliche Links', singular: 'Rechtlicher Link' },
      label: 'Rechtliche Links',
    },
  ],
  hooks: {
    afterChange: [revalidateGlobals],
  },
  label: 'Fusszeile',
}
