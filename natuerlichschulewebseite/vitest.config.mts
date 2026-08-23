import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    /*
     * `node`, nicht `jsdom`: die Integrationstests laufen über die Local API und
     * damit über den Wrangler-Proxy. Dessen esbuild bricht unter jsdom ab
     * („new TextEncoder().encode('') instanceof Uint8Array is incorrectly false"),
     * weil jsdom eine eigene TextEncoder-Implementierung mitbringt.
     */
    environment: 'node',
    // Alle Dateien teilen sich dieselbe lokale D1 — parallel gäbe das Sperrfehler.
    fileParallelism: false,
    include: ['tests/int/**/*.int.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 30_000,
  },
})
