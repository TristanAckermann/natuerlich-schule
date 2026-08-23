import React from 'react'

import type { DayTimelineBlock } from '@/payload-types'

import styles from './index.module.css'

export const DayTimelineComponent: React.FC<DayTimelineBlock> = ({ entries, heading }) => (
  <section className={styles.section} data-block="dayTimeline">
    <div className={styles.inner}>
      <h2 className={styles.heading}>{heading}</h2>
      {/*
       * Zeit und Aktivität sind eine Zuordnung, keine Aufzählung — deshalb
       * eine Definitionsliste (Spec 5.4).
       */}
      {entries && entries.length > 0 ? (
        <dl className={styles.list}>
          {entries.map((entry, index) => (
            <div className={styles.row} key={entry.id ?? index}>
              <dt className={styles.time}>{entry.time}</dt>
              <dd className={styles.description}>{entry.description}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  </section>
)
