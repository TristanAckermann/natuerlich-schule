import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import {
  type DefaultNodeTypes,
  type SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import Link from 'next/link'
import React from 'react'

import type { Page } from '@/payload-types'

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }): string => {
  const relationTo = linkNode.fields.doc?.relationTo
  const value = linkNode.fields.doc?.value

  if (relationTo === 'pages' && value && typeof value === 'object') {
    const { slug } = value as unknown as Page
    return slug === 'home' ? '/' : `/${slug}`
  }

  return '#'
}

const converters: JSXConvertersFunction<DefaultNodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  link: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })

    if (node.fields.linkType === 'internal') {
      return <Link href={internalDocToHref({ linkNode: node })}>{children}</Link>
    }

    const opensInNewTab = Boolean(node.fields.newTab)

    return (
      <a
        href={node.fields.url ?? '#'}
        rel={opensInNewTab ? 'noopener noreferrer' : undefined}
        target={opensInNewTab ? '_blank' : undefined}
      >
        {children}
      </a>
    )
  },
})

export type RichTextProps = {
  className?: string
  data: Parameters<typeof LexicalRichText>[0]['data']
}

/**
 * Rendert Lexical-Inhalte ohne die Payload-Standardklassen.
 *
 * `disableContainer` lässt den Renderer ein blankes Fragment zurückgeben — er
 * verwirft dabei auch `className`. Deshalb setzt diese Komponente den Rahmen
 * selbst, sobald eine Klasse übergeben wird.
 */
export const RichText: React.FC<RichTextProps> = ({ className, data }) => {
  const content = <LexicalRichText converters={converters} data={data} disableContainer />

  if (!className) return content

  return <div className={className}>{content}</div>
}
