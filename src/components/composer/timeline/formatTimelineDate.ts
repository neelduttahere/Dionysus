export function formatTimelineDate(datetime: string | null, index: number): string {
  if (!datetime) {
    return `Item ${index + 1}`
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(datetime))
}
