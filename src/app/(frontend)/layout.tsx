import { Rethink_Sans } from 'next/font/google'
import React from 'react'

import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { getServerSideURL } from '@/utilities/getURL'

import './tokens.css'
import './globals.css'

/*
 * Rethink Sans kommt über next/font — kein <link> auf fonts.googleapis.com.
 * Das spart zwei Roundtrips und vermeidet Layoutsprünge beim Schriftwechsel.
 */
const rethinkSans = Rethink_Sans({
  display: 'swap',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-rethink-sans',
})

export const metadata = {
  metadataBase: new URL(getServerSideURL()),
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={rethinkSans.variable} lang="de-CH">
      <body>
        <a className="ns-skip-link" href="#inhalt">
          Zum Inhalt springen
        </a>
        <SiteHeader />
        <main id="inhalt">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
