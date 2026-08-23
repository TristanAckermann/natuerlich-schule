import type { Access } from 'payload'

/** Nur eingeloggte Redaktion darf schreiben. */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

/**
 * Anonyme sehen ausschliesslich veröffentlichte Dokumente,
 * eingeloggte Redaktion sieht alles (inkl. Entwürfe).
 */
export const publishedOrAuthenticated: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

/**
 * Wie `authenticated`, blockt aber das Löschen der Startseite.
 * Access-Funktionen dürfen eine Query zurückgeben — Payload hängt sie an das WHERE an.
 */
export const authenticatedExceptHome: Access = ({ req: { user } }) => {
  if (!user) return false
  return { slug: { not_equals: 'home' } }
}
