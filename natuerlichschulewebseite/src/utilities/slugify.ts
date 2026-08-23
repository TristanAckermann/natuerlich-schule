const UMLAUTS: Record<string, string> = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  Ä: 'ae',
  Ö: 'oe',
  Ü: 'ue',
  ß: 'ss',
}

/**
 * URL-Slug aus einem beliebigen Titel. Deutsche Umlaute werden transliteriert
 * (ä → ae), alle übrigen Diakritika über NFD entfernt.
 */
export const slugify = (input: string): string =>
  input
    .replace(/[äöüÄÖÜß]/g, (char) => UMLAUTS[char] ?? char)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
