import Link from 'next/link'
import React from 'react'

import type { LinkField, Page } from '@/payload-types'

export type CmsLinkProps = {
  children?: React.ReactNode
  className?: string
  link: LinkField
  /**
   * Hängt einen dekorativen Pfeil an. Er steht in einem eigenen
   * `aria-hidden`-Element, damit Screenreader kein „Pfeil nach rechts" vorlesen.
   */
  withArrow?: boolean
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children' | 'className'>

const pathForPage = (page: LinkField['page']): string | null => {
  if (!page || typeof page === 'number') return null
  const { slug } = page as Page
  if (!slug) return null
  return slug === 'home' ? '/' : `/${slug}`
}

/** Löst eine Link-Gruppe (siehe src/fields/link.ts) in eine URL auf. */
export const resolveHref = (link: LinkField | null | undefined): string | null => {
  if (!link) return null

  switch (link.type) {
    case 'internal':
      return pathForPage(link.page)
    case 'external':
      return link.url || null
    case 'email':
      return link.email ? `mailto:${link.email}` : null
    default:
      return null
  }
}

/**
 * Einheitlicher Renderer für alle redaktionellen Links.
 * Interne Ziele laufen über `next/link`, externe und `mailto:` über ein `<a>`.
 * Fehlt das Ziel noch (Seite existiert nicht), wird `#` gerendert — so bleibt
 * die Startseite auch dann vollständig, wenn die Unterseiten noch fehlen.
 */
export const CmsLink: React.FC<CmsLinkProps> = ({
  children,
  className,
  link,
  withArrow = false,
  ...rest
}) => {
  const href = resolveHref(link)
  const label = children ?? link?.label
  const content = (
    <>
      <span>{label}</span>
      {withArrow ? <span aria-hidden="true">→</span> : null}
    </>
  )

  if (!href) {
    return (
      <a aria-disabled="true" className={className} href="#" {...rest}>
        {content}
      </a>
    )
  }

  if (link.type === 'internal') {
    return (
      <Link className={className} href={href} {...rest}>
        {content}
      </Link>
    )
  }

  const opensInNewTab = link.type === 'external' && Boolean(link.newTab)

  return (
    <a
      className={className}
      href={href}
      rel={opensInNewTab ? 'noopener noreferrer' : undefined}
      target={opensInNewTab ? '_blank' : undefined}
      {...rest}
    >
      {content}
    </a>
  )
}
