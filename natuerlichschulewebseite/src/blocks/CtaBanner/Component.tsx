import React from 'react'

import { CmsLink } from '@/components/CmsLink'
import type { CtaBannerBlock } from '@/payload-types'

import styles from './index.module.css'

/**
 * `data-on-dark` schaltet den hellen Fokusring aus globals.css frei —
 * das Band steht auf Tannengrün.
 */
export const CtaBannerComponent: React.FC<CtaBannerBlock> = ({ heading, link, text }) => (
  <section className={styles.section} data-block="ctaBanner" data-on-dark="">
    <div className={styles.inner}>
      <div className={styles.copy}>
        <h2 className={styles.heading}>{heading}</h2>
        {text ? <p className={styles.text}>{text}</p> : null}
      </div>
      <CmsLink className={styles.action} link={link} withArrow />
    </div>
  </section>
)
