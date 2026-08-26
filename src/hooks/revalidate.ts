import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'

/** Cache-Tag einer Seite. */
export const pageTag = (slug: string) => `pages:${slug}`
/** Cache-Tag für Header und Footer zusammen. */
export const globalsTag = 'globals'
/** Cache-Tag der Eventliste. */
export const eventsTag = 'events'

const safeRevalidate = (tag: string) => {
  try {
    // Next 16 verlangt ein cacheLife-Profil als zweites Argument. `updateTag`
    // wäre die Alternative, geht aber nur aus einer Server Action heraus.
    revalidateTag(tag, 'max')
  } catch {
    // Ausserhalb eines Next-Request-Scopes (CLI, Seed, Tests) gibt es nichts zu invalidieren.
  }
}

/**
 * Invalidiert die betroffene Seite. Wird per `context.disableRevalidate`
 * abgeschaltet — sonst feuert jeder Autosave-Tick (alle 375 ms) eine
 * Invalidierung.
 */
export const revalidatePage: CollectionAfterChangeHook = ({ context, doc, previousDoc }) => {
  if (context?.disableRevalidate) return doc

  if (doc?._status === 'published' && typeof doc.slug === 'string') {
    safeRevalidate(pageTag(doc.slug))
  }

  // Slug geändert oder von published auf draft gewechselt: alten Eintrag ebenfalls leeren.
  if (
    typeof previousDoc?.slug === 'string' &&
    previousDoc.slug !== doc?.slug &&
    previousDoc._status === 'published'
  ) {
    safeRevalidate(pageTag(previousDoc.slug))
  }

  /*
   * Kopf- und Fusszeile werden mit `depth: 1` geladen; ihr Cache-Eintrag
   * enthält also den aufgelösten Slug jeder verlinkten Seite. Nach einer
   * Umbenennung zeigte die Navigation sonst weiter auf die alte Adresse und
   * liefe ins Leere, bis der Globals-Tag aus einem anderen Grund fällt.
   */
  if (typeof previousDoc?.slug === 'string' && previousDoc.slug !== doc?.slug) {
    safeRevalidate(globalsTag)
  }

  return doc
}

export const revalidatePageAfterDelete: CollectionAfterDeleteHook = ({ context, doc }) => {
  if (context?.disableRevalidate) return doc
  if (typeof doc?.slug === 'string') safeRevalidate(pageTag(doc.slug))
  return doc
}

export const revalidateGlobals: GlobalAfterChangeHook = ({ context, doc }) => {
  if (context?.disableRevalidate) return doc
  safeRevalidate(globalsTag)
  return doc
}

/**
 * Die Eventliste hängt an einem einzigen Tag: jede Änderung — neu, bearbeitet,
 * veröffentlicht oder zurück auf Entwurf — verschiebt die Reihenfolge oder die
 * Sichtbarkeit und muss die ganze Liste neu aufbauen.
 */
export const revalidateEvents: CollectionAfterChangeHook = ({ context, doc }) => {
  if (context?.disableRevalidate) return doc
  safeRevalidate(eventsTag)
  return doc
}

export const revalidateEventsAfterDelete: CollectionAfterDeleteHook = ({ context, doc }) => {
  if (context?.disableRevalidate) return doc
  safeRevalidate(eventsTag)
  return doc
}
