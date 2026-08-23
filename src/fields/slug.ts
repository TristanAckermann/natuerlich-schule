import type { Field, FieldHook } from 'payload'

import { slugify } from '@/utilities/slugify'

const formatSlug =
  (fallbackField: string): FieldHook =>
  ({ data, operation, originalDoc, value }) => {
    if (typeof value === 'string' && value.trim().length > 0) {
      return slugify(value)
    }

    if (operation === 'create' || typeof originalDoc?.slug !== 'string') {
      const fallback = data?.[fallbackField]
      if (typeof fallback === 'string' && fallback.trim().length > 0) {
        return slugify(fallback)
      }
    }

    return value
  }

/**
 * Slug-Feld mit `beforeValidate`-Hook: leer gelassen wird er aus `fallbackField`
 * abgeleitet, ausgefüllt wird er normalisiert. Bleibt jederzeit editierbar.
 */
export const slugField = (fallbackField = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  admin: {
    description: 'Teil der URL. Leer lassen, um ihn aus dem Titel abzuleiten.',
    position: 'sidebar',
  },
  hooks: {
    beforeValidate: [formatSlug(fallbackField)],
  },
  index: true,
  label: 'Slug',
  required: true,
  unique: true,
})
