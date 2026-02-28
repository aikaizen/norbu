export function nanoid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}
