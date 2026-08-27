/**
 * Lexical-Hilfsfunktionen für die Seed-Skripte.
 *
 * Die richText-Felder speichern einen Lexical-Baum. Der Seed schreibt ihn von
 * Hand — es gibt ausserhalb des Admin-Editors keinen Serialisierer dafür. Die
 * Bäume bleiben deshalb bewusst einfach: Absätze, Zeilenumbrüche, Links.
 *
 * Die Funktionen liegen hier und nicht in einem einzelnen Seed, weil inzwischen
 * mehrere Seiten Fliesstext befüllen und sonst jede ihren eigenen Baumbauer
 * mitbrächte.
 */
import type { TextIntroBlock } from '@/payload-types'

/** Der Typ ist für alle richText-Felder im Projekt derselbe. */
export type RichTextValue = TextIntroBlock['body']

/** Ein beliebiger Lexical-Knoten. Mehr Struktur braucht der Seed nicht. */
export type LexicalNode = { type: string; version: number; [key: string]: unknown }

export const textNode = (text: string): LexicalNode => ({
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  type: 'text',
  version: 1,
})

export const linebreakNode = (): LexicalNode => ({ type: 'linebreak', version: 1 })

/** Wandelt `\n` innerhalb eines Absatzes in Lexical-Zeilenumbrüche um. */
export const inlineChildren = (text: string): LexicalNode[] =>
  text
    .split('\n')
    .flatMap((zeile, index) =>
      index === 0 ? [textNode(zeile)] : [linebreakNode(), textNode(zeile)],
    )

export const paragraphNode = (children: LexicalNode[]): LexicalNode => ({
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  type: 'paragraph',
  version: 1,
})

export const rootNode = (children: LexicalNode[]): RichTextValue => ({
  root: {
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
})

/**
 * Baut einen Lexical-Baum aus einfachen Absätzen. Jedes Argument ist ein Absatz,
 * ein `\n` darin wird zum Zeilenumbruch.
 */
export const paragraphs = (...texte: string[]): RichTextValue =>
  rootNode(texte.map((text) => paragraphNode(inlineChildren(text))))
