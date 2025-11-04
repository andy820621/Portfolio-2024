/**
 * Provide SSR-stable date/time values to avoid hydration mismatches
 * from using `new Date()` on both server and client separately.
 */
export function useStableDate() {
  return useState<Date>('stable-now', () => new Date())
}

export function useStableYear() {
  // Keep as string to match common schema usage
  return useState<string>('stable-current-year', () => new Date().getFullYear().toString())
}
