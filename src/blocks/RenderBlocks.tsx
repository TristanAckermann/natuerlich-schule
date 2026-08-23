import React from 'react'

import type { Page } from '@/payload-types'

import { CtaBannerComponent } from './CtaBanner/Component'
import { DayTimelineComponent } from './DayTimeline/Component'
import { HeroComponent } from './Hero/Component'
import { PillarCardsComponent } from './PillarCards/Component'
import { QuoteComponent } from './Quote/Component'
import { TextIntroComponent } from './TextIntro/Component'

type Block = Page['layout'][number]

const blockComponents = {
  ctaBanner: CtaBannerComponent,
  dayTimeline: DayTimelineComponent,
  hero: HeroComponent,
  pillarCards: PillarCardsComponent,
  quote: QuoteComponent,
  textIntro: TextIntroComponent,
} as const

/**
 * Die Akzentfarbe wird einmal im Hero gesetzt und über eine CSS-Variable an
 * alle nachgelagerten Blöcke weitergereicht (Spec 5.5). Ohne Hero gilt Salbei.
 */
const accentOf = (blocks: Block[]): 'sage' | 'fir' | 'graphite' => {
  const hero = blocks.find((block) => block.blockType === 'hero')
  return hero && 'accent' in hero ? hero.accent : 'sage'
}

export const RenderBlocks: React.FC<{ blocks: Block[] }> = ({ blocks }) => {
  if (!Array.isArray(blocks) || blocks.length === 0) return null

  return (
    <div data-accent={accentOf(blocks)}>
      {blocks.map((block, index) => {
        // Unbekannte Blocktypen werden übersprungen statt zu werfen — sonst
        // bricht die Seite, sobald ein Typ entfernt wird, bevor die Inhalte
        // migriert sind.
        const Component = blockComponents[block.blockType as keyof typeof blockComponents] as unknown as
          | React.ComponentType<Record<string, unknown>>
          | undefined
        if (!Component) return null

        return <Component key={block.id ?? index} {...(block as unknown as Record<string, unknown>)} />
      })}
    </div>
  )
}
