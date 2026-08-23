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

export const TextIntroComponent: React.FC<TextIntroBlock> = ({ body, heading }) => (
  <section className={styles.section} data-block="textIntro">
    <div className={styles.inner}>
      <h2 className={styles.heading}>{withLineBreaks(heading)}</h2>
      <RichText className={styles.body} data={body} />
    </div>
  </section>
)
