'use client'

import React, { useEffect, useRef, useState } from 'react'

import styles from './index.module.css'

export type HeroVideoProps = {
  /** Fertig gerendertes Teaser-Band aus Component.tsx. */
  band: React.ReactNode
  /** Fertig gerenderte Textspalte (Kicker, h1, Lead) aus Component.tsx. */
  copy: React.ReactNode
  loopPause: number
  poster?: string
  posterAlt?: string
  showProgress: boolean
  softenAfter: boolean
  videoSrc?: string
  videoType?: string
}

/**
 * „idle" — alles sichtbar, nichts läuft (Serverzustand und Zustand ab dem
 * zweiten Durchlauf). „armed" — erster Durchlauf, die Texte fahren gestaffelt
 * ein. „soft" — Video weichgezeichnet, Text im Vordergrund.
 */
type HeroState = 'idle' | 'armed' | 'soft'

type NetworkInformation = {
  effectiveType?: string
  saveData?: boolean
}

/** Rückfalldauer für die Staffelung der Wipe-In-Animation (Spec 7.1). */
const FALLBACK_PASS_SECONDS = 14

const SPARSE_CONNECTIONS = ['slow-2g', '2g']

/**
 * Reduzierte Bewegung, Sparmodus oder eine sehr langsame Verbindung: in allen
 * drei Fällen läuft kein Video, kein Wipe-In, kein Weichzeichnen und keine
 * Fortschrittslinie.
 */
const prefersQuiet = (): boolean => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true

  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection
  if (!connection) return false
  if (connection.saveData === true) return true

  return SPARSE_CONNECTIONS.includes(connection.effectiveType ?? '')
}

/**
 * Interaktive Hülle des Hero-Blocks: Video, Scrim, Fortschrittslinie und die
 * Zustandsverwaltung für Wipe-In und Weichzeichnen. Die Texte kommen fertig
 * gerendert vom Server (siehe Component.tsx) und werden hier nur eingehängt.
 */
export const HeroVideo: React.FC<HeroVideoProps> = ({
  band,
  copy,
  loopPause,
  poster,
  posterAlt,
  showProgress,
  softenAfter,
  videoSrc,
  videoType,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const fillRef = useRef<HTMLSpanElement | null>(null)
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firstPassDone = useRef(false)

  /*
   * Serverseitig und beim ersten Render im Browser steht `motionAllowed` auf
   * false. Zwei Gründe: das ausgelieferte HTML ist identisch zum ersten
   * Client-Render (keine Hydration-Abweichung), und das Video wird erst
   * angefordert, nachdem geprüft ist, ob es überhaupt laufen darf. Ohne
   * JavaScript bleibt es beim Standbild.
   *
   * Bewusste Entscheidung gegen ein <video> ohne autoplay: ein stummgeschaltetes
   * Video im DOM lädt je nach Browser trotzdem Daten und taucht in der
   * Medienbedienung des Betriebssystems auf. Das <img> ist die ehrlichere
   * Variante — es zeigt exakt dasselbe Standbild und kostet nichts.
   */
  const [motionAllowed, setMotionAllowed] = useState(false)
  const [state, setState] = useState<HeroState>('idle')
  const [pass, setPass] = useState(FALLBACK_PASS_SECONDS)

  const showVideo = motionAllowed && Boolean(videoSrc)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const evaluate = () => setMotionAllowed(!prefersQuiet())

    evaluate()
    query.addEventListener('change', evaluate)

    return () => query.removeEventListener('change', evaluate)
  }, [])

  /*
   * Ohne Abhängigkeitsliste: läuft nach jedem Render. iOS Safari setzt `muted`
   * gelegentlich von sich aus zurück, deshalb wird es zusätzlich zu
   * `loadedmetadata` und `playing` auch hier erneut gesetzt (Spec 7.1).
   */
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = true
    video.volume = 0
  })

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const enforceMuted = () => {
      video.muted = true
      video.volume = 0
    }

    const start = () => {
      // Die Autoplay-Richtlinie darf den Start ablehnen. Dann bleibt schlicht
      // das Standbild stehen — das ist kein Fehlerfall.
      void video.play().catch(() => {})
    }

    const onLoadedMetadata = () => {
      enforceMuted()
      if (Number.isFinite(video.duration) && video.duration > 0) setPass(video.duration)
    }

    const onPlaying = () => {
      enforceMuted()
      if (!firstPassDone.current) setState('armed')
    }

    const onTimeUpdate = () => {
      const fill = fillRef.current
      if (!fill) return
      if (!Number.isFinite(video.duration) || video.duration <= 0) return

      const ratio = Math.min(1, Math.max(0, video.currentTime / video.duration))
      // Direkt ins DOM geschrieben: über State wären das rund 30 Renders je
      // Sekunde (Spec 7.1).
      fill.style.width = `${(ratio * 100).toFixed(2)}%`
    }

    const onEnded = () => {
      firstPassDone.current = true
      // Ab jetzt sind alle Texte sofort sichtbar — „soft" und „idle" tragen
      // beide keine Animation.
      setState(softenAfter ? 'soft' : 'idle')

      pauseTimer.current = setTimeout(
        () => {
          if (fillRef.current) fillRef.current.style.width = '0%'
          video.currentTime = 0
          start()
        },
        Math.max(0, loopPause) * 1000,
      )
    }

    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('playing', onPlaying)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('ended', onEnded)

    enforceMuted()
    start()

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('ended', onEnded)

      if (pauseTimer.current) {
        clearTimeout(pauseTimer.current)
        pauseTimer.current = null
      }
    }
  }, [loopPause, showVideo, softenAfter])

  const showProgressLine = showProgress && Boolean(videoSrc)
  const hasBand = Boolean(band) || showProgressLine

  return (
    <section
      className={styles.section}
      data-block="hero"
      data-hero-state={state}
      data-hero-video={showVideo ? 'on' : 'off'}
      data-on-dark=""
      style={{ '--ns-hero-pass': `${pass}s` } as React.CSSProperties}
    >
      <div className={styles.media}>
        {poster ? (
          // Kein next/image: ohne sharp gibt es keine Bildvarianten, die Datei
          // liegt fertig in R2. Der Alternativtext kommt aus der Medienablage;
          // ist er leer, gilt das Bild als rein dekorativ.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={posterAlt ?? ''}
            className={styles.poster}
            decoding="async"
            src={poster}
          />
        ) : null}

        {showVideo ? (
          <video
            aria-hidden="true"
            autoPlay
            className={styles.video}
            disableRemotePlayback
            muted
            playsInline
            poster={poster}
            preload="auto"
            ref={videoRef}
            tabIndex={-1}
          >
            <source src={videoSrc} type={videoType} />
          </video>
        ) : null}

        <span aria-hidden="true" className={styles.scrim} />
        <span aria-hidden="true" className={styles.scrimSoft} />
      </div>

      <div className={styles.stage}>{copy}</div>

      {hasBand ? (
        <div className={styles.band}>
          {band}
          {showProgressLine ? (
            <div aria-hidden="true" className={styles.progress}>
              <span className={styles.progressFill} ref={fillRef} />
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
