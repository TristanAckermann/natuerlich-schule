// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from '@opennextjs/cloudflare/config'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'

export default defineCloudflareConfig({
  // Braucht das R2-Binding NEXT_INC_CACHE_R2_BUCKET aus wrangler.jsonc.
  incrementalCache: r2IncrementalCache,
})
