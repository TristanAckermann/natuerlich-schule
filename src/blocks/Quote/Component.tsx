import React from 'react'

import type { QuoteBlock } from '@/payload-types'

import styles from './index.module.css'

/** Aus jedem Zeilenumbruch im Feld wird ein <br> — das Zitat behält seinen Takt. */
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
 * Mehrzeilige oder lange Zitate laufen im grossen Zitatgrad aus dem Ruhigen
 * heraus. Ab dieser Länge schaltet der Block eine Stufe kleiner — gleiche
 * Anmutung, nur ohne Wand aus Buchstaben.
 */
const LANGES_ZITAT_AB = 120

export const QuoteComponent: React.FC<QuoteBlock> = ({ attribution, quote }) => {
  const lang = quote.length > LANGES_ZITAT_AB || quote.includes('\n')

  return (
    <section className={styles.section} data-block="quote">
      {/*
       * Die Anführungszeichen setzt ausschliesslich das CSS (quotes +
       * open-quote/close-quote). Im Feld steht der blanke Satz — so kann
       * kein gerades Zeichen in den Inhalt geraten (Spec 5.4).
       */}
      <blockquote className={lang ? `${styles.quote} ${styles.quoteLong}` : styles.quote}>
        {withLineBreaks(quote)}
      </blockquote>
      {attribution ? <footer className={styles.attribution}>{attribution}</footer> : null}
    </section>
  )
}
