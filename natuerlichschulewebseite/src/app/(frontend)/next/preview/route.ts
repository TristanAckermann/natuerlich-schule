import { draftMode } from 'next/headers'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'

/**
 * Handshake für die Live-Vorschau im Admin.
 *
 * Der Draft-Modus wird nur gesetzt, wenn beides stimmt: das gemeinsame
 * Geheimnis aus `PREVIEW_SECRET` **und** eine gültige Payload-Session.
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')
  const previewSecret = searchParams.get('previewSecret')

  if (!process.env.PREVIEW_SECRET || previewSecret !== process.env.PREVIEW_SECRET) {
    return new Response('Ungültiges Vorschau-Geheimnis.', { status: 403 })
  }

  // Nur seiteninterne Pfade — verhindert eine offene Weiterleitung.
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return new Response('Ungültiger Pfad.', { status: 400 })
  }

  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return new Response('Nicht angemeldet.', { status: 403 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(path)
}
