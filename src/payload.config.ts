import path from 'path'
import sharp from 'sharp'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Events } from './collections/Events'
import { Header } from './globals/Header'
import { Footer } from './globals/Footer'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/*
 * Die Datenbank ist eine einzelne SQLite-Datei. Auf dem Hosting muss
 * DATABASE_URI auf ein Verzeichnis ausserhalb des Deployment-Ordners zeigen,
 * sonst überschreibt sie das nächste Deployment. Lokal genügt die Datei im
 * Projektstamm.
 */
const databaseURI = process.env.DATABASE_URI || `file:${path.resolve(dirname, '..', 'payload.db')}`

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Pages, Events],
  globals: [Header, Footer],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: databaseURI,
    },
    prodMigrations: migrations,
    /*
     * Kein automatisches Schema-Push in der Entwicklung. Die lokale Datenbank
     * wird wie die produktive über `payload migrate` aufgebaut; liefe zusätzlich
     * der Dev-Push, kollidierte er mit den bereits migrierten Indizes.
     */
    push: false,
    /*
     * Transaktionen waren unter D1 nicht möglich und deshalb abgeschaltet. Eine
     * echte SQLite-Datei kann sie: Das Speichern einer Seite schreibt in ein
     * Dutzend Block-Tabellen und ist jetzt wieder ganz oder gar nicht.
     */
    transactionOptions: {},
  }),
  /*
   * Uploads liegen als Dateien neben der Anwendung — siehe `upload.staticDir`
   * in src/collections/Media.ts. Es braucht deshalb kein Storage-Plugin mehr.
   */
  sharp,
})
