/**
 * Basis-URL der Website. Lokal fällt sie auf den Next-Devserver zurück.
 */
export const getServerSideURL = (): string => {
  const fromEnv = process.env.NEXT_PUBLIC_SERVER_URL
  if (fromEnv) return fromEnv.replace(/\/$/, '')

  const port = process.env.PORT || '3000'
  return `http://localhost:${port}`
}
