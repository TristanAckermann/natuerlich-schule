import React from 'react'

import { RichText } from '@/components/RichText'
import type { TextIntroBlock } from '@/payload-types'

import styles from './index.module.css'

/**
 * Die Überschrift ist ein Textarea-Feld: die Redaktion setzt die Umbrüche
 * selbst, das Design lebt davon. Aus jedem Zeilenumbruch wird ein <br> —
 * über React-Fragmente, nicht über dangerouslySetInnerHTML.
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
 * Ohne Überschrift wird aus dem Block ein reiner Fliesstext-Abschnitt: eine
 * Spalte, etwas grössere Schrift, mehr Luft. So lassen sich längere Passagen
 * in mehrere ruhige Abschnitte teilen, ohne dafür Zwischentitel zu erfinden.
 */
export const TextIntroComponent: React.FC<TextIntroBlock> = ({ body, heading }) => {
  const hatUeberschrift = Boolean(heading && heading.trim())

  return (
    <section className={styles.section} data-block="textIntro">
      <div className={hatUeberschrift ? styles.inner : styles.innerProse}>
        {hatUeberschrift ? <h2 className={styles.heading}>{withLineBreaks(heading!)}</h2> : null}
        <RichText
          className={hatUeberschrift ? styles.body : `${styles.body} ${styles.bodyProse}`}
          data={body}
        />
      </div>
    </section>
  )
}
