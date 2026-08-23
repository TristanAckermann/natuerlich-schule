import React from 'react'

import { CmsLink } from '@/components/CmsLink'
import { RichText } from '@/components/RichText'
import { getFooter } from '@/utilities/getGlobals'

import styles from './index.module.css'

/**
 * Fusszeile der Website (Spec 5.8, Mockup-Abschnitt „Fusszeile").
 *
 * Der Inhalt stammt vollständig aus dem Global `footer`. Die Gruppe
 * `organization` bleibt hier bewusst aussen vor — sie speist ausschliesslich
 * die strukturierten Daten (siehe OrganizationJsonLd) und ist nicht sichtbar.
 */
export const SiteFooter = async () => {
  const footer = await getFooter()

  if (!footer) return null

  const columns = footer.columns ?? []
  const legalLinks = footer.legalLinks ?? []
  const hasLegalRow = Boolean(footer.legalNote) || legalLinks.length > 0

  // Ohne Spalten und ohne Fusszeile gäbe es nur eine leere Fläche.
  if (columns.length === 0 && !hasLegalRow) return null

  return (
    <footer className={styles.footer}>
      {columns.length > 0 ? (
        <div className={styles.columns}>
          {columns.map((column, index) => (
            <div className={styles.column} key={column.id ?? index}>
              {/*
               * Ebene h2: Die Fusszeile ist ein eigenes Landmark neben <main>
               * und keiner Blocküberschrift untergeordnet. Direkt unter der
               * einzigen h1 der Seite ist h2 damit die lückenlose nächste
               * Stufe; ein h3 würde eine Unterordnung behaupten, die es
               * strukturell nicht gibt.
               */}
              <h2 className={styles.columnTitle}>{column.title}</h2>
              <RichText className={styles.columnBody} data={column.body} />
            </div>
          ))}
        </div>
      ) : null}

      {hasLegalRow ? (
        <div className={styles.legal}>
          {footer.legalNote ? <p className={styles.legalNote}>{footer.legalNote}</p> : null}
          {legalLinks.length > 0 ? (
            <ul className={styles.legalLinks}>
              {legalLinks.map((item, index) => (
                <li key={item.id ?? index}>
                  <CmsLink className={styles.legalLink} link={item.link} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </footer>
  )
}
