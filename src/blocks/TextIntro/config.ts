import type { Block } from 'payload'
import {
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const TextIntro: Block = {
  slug: 'textIntro',
  fields: [
    {
      name: 'heading',
      type: 'textarea',
      admin: {
        description: 'Zeilenumbrüche werden übernommen — das Design bricht die Überschrift bewusst um.',
      },
      label: 'Überschrift',
      required: true,
    },
    {
      name: 'body',
      type: 'richText',
      editor: lexicalEditor({
        features: () => [ParagraphFeature(), BoldFeature(), ItalicFeature(), LinkFeature()],
      }),
      label: 'Text',
      required: true,
    },
  ],
  interfaceName: 'TextIntroBlock',
  labels: { plural: 'Einleitungen', singular: 'Einleitung' },
}
