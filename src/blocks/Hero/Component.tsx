import React from 'react'

import { CmsLink, resolveHref } from '@/components/CmsLink'
import type { HeroBlock, Media } from '@/payload-types'

import { HeroVideo } from './HeroVideo'
import styles from './index.module.css'

/** Rückfallwert, falls in den Daten keine Pause hinterlegt ist (Spec 5.4). */
const DEFAULT_LOOP_PAUSE = 4

/**
 * Upload-Felder liefern je nach Tiefe die ID oder das aufgelöste Dokument.
 * Nur im zweiten Fall gibt es überhaupt eine Datei-URL.
 */
const resolveMedia = (value: HeroBlock['video']): Media | null =>
  value && typeof value === 'object' ? value : null

/**
 * Serverteil des Hero-Blocks.
 *
 * Kicker, Titel, Lead und das Teaser-Band werden hier fertig gerendert und als
 * Slots an die Client-Hülle gereicht. Damit steht die <h1> im ausgelieferten
 * HTML, ist das LCP-Element und bleibt auch ohne JavaScript sichtbar (Spec 9.2).
 * In der Hülle steckt ausschliesslich das, was Interaktion braucht: Video,
 * Scrim und Fortschrittslinie.
 *
 * Die Akzentfarbe wird nicht hier gesetzt — RenderBlocks hängt `data-accent` an
 * den Seitenwrapper, das CSS liest var(--ns-accent).
 */
export const HeroComponent: React.FC<HeroBlock> = ({
  heading,
  kicker,
  lead,
  loopPause,
  poster,
  showProgress,
  softenAfter,
  teasers,
  video,
}) => {
  const posterMedia = resolveMedia(poster)
  const videoMedia = resolveMedia(video)

  const copy = (
    <div className={styles.copy}>
      {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
      <h1 className={styles.title}>{heading}</h1>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
    </div>
  )

  const band =
    teasers && teasers.length > 0 ? (
      <ul className={styles.bandGrid}>
        {teasers.map((teaser, index) => (
          <li className={styles.bandItem} key={teaser.id ?? index}>
            <p className={styles.bandText}>{teaser.text}</p>
            {/*
             * Nur ein Link, der auch irgendwohin führt. Teaser ohne Ziel sind
             * blosse Bezeichnungen — ein totes „Mehr erfahren“ wäre Text, den
             * niemand geschrieben hat.
             */}
            {teaser.link && resolveHref(teaser.link) ? (
              <CmsLink className={styles.bandLink} link={teaser.link} withArrow />
            ) : null}
          </li>
        ))}
      </ul>
    ) : null

  return (
    <HeroVideo
      band={band}
      copy={copy}
      loopPause={typeof loopPause === 'number' ? loopPause : DEFAULT_LOOP_PAUSE}
      poster={posterMedia?.url ?? undefined}
      posterAlt={posterMedia?.alt ?? undefined}
      showProgress={showProgress !== false}
      softenAfter={softenAfter !== false}
      videoSrc={videoMedia?.url ?? undefined}
      videoType={videoMedia?.mimeType ?? undefined}
    />
  )
}
