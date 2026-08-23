import React from 'react'

import type { QuoteBlock } from '@/payload-types'

import styles from './index.module.css'

export const QuoteComponent: React.FC<QuoteBlock> = ({ attribution, quote }) => (
  <section className={styles.section} data-block="quote">
    {/*
     * Die Anführungszeichen setzt ausschliesslich das CSS (quotes +
     * open-quote/close-quote). Im Feld steht der blanke Satz — so kann
     * kein gerades Zeichen in den Inhalt geraten (Spec 5.4).
     */}
    <blockquote className={styles.quote}>{quote}</blockquote>
    {attribution ? <footer className={styles.attribution}>{attribution}</footer> : null}
  </section>
)
