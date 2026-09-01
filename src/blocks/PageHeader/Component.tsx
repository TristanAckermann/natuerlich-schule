import React from 'react'

import type { Media, PageHeaderBlock } from '@/payload-types'

import styles from './index.module.css'

/**
 * Titel und Lead sind Textarea-Felder: die Redaktion setzt die Umbrüche selbst,
 * das Design lebt davon. Aus jedem Zeilenumbruch wird ein <br> — über
 * React-Fragmente, nicht über dangerouslySetInnerHTML.
 */
const withLineBreaks = (value: string): React.ReactNode[] => {
  const lines = value.split(/\r?\n/)

  return lines.map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </React.Fragment>
  ))
}

/**
 * Upload-Felder liefern je nach Tiefe die ID oder das aufgelöste Dokument.
 * Nur im zweiten Fall gibt es überhaupt eine Datei-URL.
 */
const resolveMedia = (value: PageHeaderBlock['icon']): Media | null =>
  value && typeof value === 'object' ? value : null

/**
 * Seitenkopf einer Unterseite. Die Überschrift ist bewusst ein <h1> und nicht
 * wie sonst ein <h2>: der Block ist der Seitenauftakt und liefert die einzige
 * Überschrift erster Ebene der Seite.
 *
 * Ohne Lead steht der Titel allein und darf die volle Breite nutzen — sonst
 * bliebe die zweite Rasterspalte als leere Fläche stehen.
 *
 * Das Symbol ist optional und rein dekorativ: es steht über dem Titel und trägt
 * deshalb einen leeren Alternativtext, damit Screenreader die Überschrift nicht
 * doppelt vorlesen.
 */
export const PageHeaderComponent: React.FC<PageHeaderBlock> = ({ heading, icon, lead }) => {
  const hatLead = Boolean(lead && lead.trim())
  const symbol = resolveMedia(icon)

  return (
    <section className={styles.section} data-block="pageHeader">
      {symbol?.url ? (
        // eslint-disable-next-line @next/next/no-img-element -- ohne sharp gibt es auf Cloudflare Workers keine Bildvarianten
        <img
          alt=""
          className={styles.icon}
          decoding="async"
          height={symbol.height ?? undefined}
          src={symbol.url}
          width={symbol.width ?? undefined}
        />
      ) : null}
      <div className={hatLead ? styles.inner : styles.innerSolo}>
        <h1 className={styles.heading}>{withLineBreaks(heading)}</h1>
        {hatLead ? <p className={styles.lead}>{withLineBreaks(lead!)}</p> : null}
      </div>
    </section>
  )
}
