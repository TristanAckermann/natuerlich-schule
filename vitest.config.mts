import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    /*
     * `node`, nicht `jsdom`: die Integrationstests laufen über die Local API
     * gegen den libsql-Client, der native Bindings und Node-APIs braucht.
     */
    environment: 'node',
    // Alle Dateien teilen sich dieselbe SQLite-Datei — parallel gäbe das Sperrfehler.
    fileParallelism: false,
    include: ['tests/int/**/*.int.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 30_000,
  },
})
