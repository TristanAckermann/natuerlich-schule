import React from 'react'

import type { Event, Media } from '@/payload-types'

import styles from './index.module.css'

/** Alle Daten werden in Schweizer Ortszeit dargestellt, nicht in UTC. */
const TIME_ZONE = 'Europe/Zurich'

const dayFormat = new Intl.DateTimeFormat('de-CH', { day: '2-digit', timeZone: TIME_ZONE })
const monthFormat = new Intl.DateTimeFormat('de-CH', { month: 'short', timeZone: TIME_ZONE })
const yearFormat = new Intl.DateTimeFormat('de-CH', { year: 'numeric', timeZone: TIME_ZONE })
const timeFormat = new Intl.DateTimeFormat('de-CH', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: TIME_ZONE,
})
const fullFormat = new Intl.DateTimeFormat('de-CH', { dateStyle: 'full', timeZone: TIME_ZONE })

/** „Aug.“ kommt mit Punkt aus Intl — im Datumsfeld steht er als Versalie ohne. */
const monthLabel = (date: Date): string => monthFormat.format(date).replace(/\.$/, '')

/**
 * Upload-Felder liefern je nach Tiefe die ID oder das aufgelöste Dokument.
 * Nur im zweiten Fall gibt es überhaupt eine Datei-URL.
 */
const resolveMedia = (value: Event['image']): Media | null =>
  value && typeof value === 'object' ? value : null

export type EventCardProps = {
  event: Event
}

/**
 * Eine Eventkarte: Bild oben, Datumsfeld als Marke darüber, darunter Titel,
 * Kurzbeschreibung und Ort.
 *
 * Kein `next/image` — gleiches Vorgehen wie im Hero und in der Kopfzeile.
 * Seit dem Wechsel auf Node wäre die Bildoptimierung von Next verfügbar; ein
 * Umstieg ist offen und würde Lighthouse helfen (siehe docs/features/media.md).
 */
export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { date, description, image, location, slug, title } = event
  const media = resolveMedia(image)
  const parsed = new Date(date)
  const isValidDate = !Number.isNaN(parsed.getTime())

  /*
   * Wer im Datumsfeld nur einen Tag wählt, bekommt 00:00 — das ist keine
   * Startzeit, sondern eine fehlende Angabe. Sie wird deshalb nicht angezeigt.
   */
  const time = isValidDate ? timeFormat.format(parsed) : null
  const showTime = time !== null && time !== '00:00'

  return (
    <article className={styles.card} id={slug || undefined}>
      <div className={styles.figure}>
        {media?.url ? (
          // eslint-disable-next-line @next/next/no-img-element -- siehe Begründung oben
          <img
            alt={media.alt ?? ''}
            className={styles.image}
            height={media.height ?? undefined}
            loading="lazy"
            src={media.url}
            width={media.width ?? undefined}
          />
        ) : null}

        {isValidDate ? (
          /*
           * Das sichtbare Datum ist auf Tag und Monat verkürzt; die
           * ausgeschriebene Fassung steht für Screenreader daneben und im
           * `datetime`-Attribut maschinenlesbar.
           */
          <time className={styles.date} dateTime={date}>
            <span aria-hidden="true" className={styles.day}>
              {dayFormat.format(parsed)}
            </span>
            <span aria-hidden="true" className={styles.month}>
              {monthLabel(parsed)}
            </span>
            <span aria-hidden="true" className={styles.year}>
              {yearFormat.format(parsed)}
            </span>
            <span className="ns-visually-hidden">{fullFormat.format(parsed)}</span>
          </time>
        ) : null}
      </div>

      <div className={styles.body}>
        <h2 className={styles.title}>{title}</h2>

        {description ? <p className={styles.description}>{description}</p> : null}

        {location || showTime ? (
          <ul className={styles.meta}>
            {showTime ? <li className={styles.metaItem}>{time} Uhr</li> : null}
            {location ? <li className={styles.metaItem}>{location}</li> : null}
          </ul>
        ) : null}
      </div>
    </article>
  )
}
