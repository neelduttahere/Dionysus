export function parseCommaSeparatedUrls(value: string): string[] {
  return value
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)
}
