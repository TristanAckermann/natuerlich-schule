import React from 'react'

import type { PillarCardsBlock } from '@/payload-types'

import styles from './index.module.css'

/**
 * Gedankenstrich im Kicker. Das Zeichen kommt so aus dem Design-Canvas
 * (U+2014). Soll es der schmalere Halbgeviertstrich sein, steht hier U+2013.
 */
const KICKER_DASH = '—'

/**
 * Der Kicker lautet „01 — Hof“. Die Leerzeichen um den Strich sind geschützt
 * (U+00A0), damit Nummer, Strich und Kategorie auf einer Zeile bleiben.
 */
const kickerOf = (index: string, category: string): string =>
  `${index}\u00A0${KICKER_DASH}\u00A0${category}`

export const PillarCardsComponent: React.FC<PillarCardsBlock> = ({ cards }) => {
  if (!cards || cards.length === 0) return null

  return (
    <section className={styles.section} data-block="pillarCards">
      {/*
       * Die Trennlinien entstehen durch die 1-px-Lücke über dem
       * Haarlinien-Hintergrund, nicht durch Rahmen an den Karten.
       */}
      <div className={styles.grid}>
        {cards.map((card, position) => (
          <article className={styles.card} data-position={position + 1} key={card.id ?? position}>
            <p className={styles.kicker}>{kickerOf(card.index, card.category)}</p>
            <h3 className={styles.heading}>{card.heading}</h3>
            <p className={styles.text}>{card.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
