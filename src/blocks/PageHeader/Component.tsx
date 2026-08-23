import React from 'react'

import type { PageHeaderBlock } from '@/payload-types'

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
 * Seitenkopf einer Unterseite. Die Überschrift ist bewusst ein <h1> und nicht
 * wie sonst ein <h2>: der Block ist der Seitenauftakt und liefert die einzige
 * Überschrift erster Ebene der Seite.
 *
 * Ohne Lead steht der Titel allein und darf die volle Breite nutzen — sonst
 * bliebe die zweite Rasterspalte als leere Fläche stehen.
 */
export const PageHeaderComponent: React.FC<PageHeaderBlock> = ({ heading, lead }) => {
  const hatLead = Boolean(lead && lead.trim())

  return (
    <section className={styles.section} data-block="pageHeader">
      <div className={hatLead ? styles.inner : styles.innerSolo}>
        <h1 className={styles.heading}>{withLineBreaks(heading)}</h1>
        {hatLead ? <p className={styles.lead}>{withLineBreaks(lead!)}</p> : null}
      </div>
    </section>
  )
}
