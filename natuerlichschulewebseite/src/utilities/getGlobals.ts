import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import type { Footer, Header } from '@/payload-types'
import config from '@/payload.config'
import { globalsTag } from '@/hooks/revalidate'

const findGlobal = async <T>(slug: 'header' | 'footer'): Promise<T> => {
  const payload = await getPayload({ config: await config })
  return payload.findGlobal({ slug, depth: 1 }) as Promise<T>
}

export const getHeader = unstable_cache(() => findGlobal<Header>('header'), ['global', 'header'], {
  tags: [globalsTag],
})

export const getFooter = unstable_cache(() => findGlobal<Footer>('footer'), ['global', 'footer'], {
  tags: [globalsTag],
})
