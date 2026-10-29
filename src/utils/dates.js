// Dates are stored as YYYY-MM-DD strings; parse them as local dates so they
// don't shift a day in negative-offset timezones.
export function parseDate(value) {
  if (!value) return null
  const [y, m, d] = value.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDate(value, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  const date = parseDate(value)
  return date ? date.toLocaleDateString(undefined, options) : '—'
}

export function todayISO() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now - offset).toISOString().slice(0, 10)
}
