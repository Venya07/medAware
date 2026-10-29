// Thin client for the public openFDA Drug Label API.
// No API key is used; openFDA allows limited keyless requests from the browser.
const BASE_URL = 'https://api.fda.gov/drug/label.json'

async function request(search, limit) {
  const url = `${BASE_URL}?search=${encodeURIComponent(search)}&limit=${limit}`
  let response
  try {
    response = await fetch(url)
  } catch {
    throw new Error('Could not reach openFDA. Check your internet connection and try again.')
  }
  // openFDA answers 404 when a search simply has no matches.
  if (response.status === 404) return []
  if (response.status === 429) {
    throw new Error('openFDA rate limit reached. Please wait a minute and try again.')
  }
  if (!response.ok) {
    throw new Error(`openFDA returned an error (${response.status}).`)
  }
  const data = await response.json()
  return data.results ?? []
}

const clean = (term) => term.trim().replace(/["\\]/g, '')

const joinField = (label, ...keys) => {
  for (const key of keys) {
    const value = label[key]
    if (Array.isArray(value) && value.length) return value.join('\n\n').trim()
  }
  return null
}

const DURATION_PATTERN =
  /\b(\d+\s*(?:to|-)\s*\d+\s*(?:days?|weeks?|months?)|\d+\s*(?:days?|weeks?|months?)|duration|long-term|short-term)\b/i

const DURATION_PHRASE = /(?:\S+\s+){0,6}\d+\s*(?:(?:to|-)\s*\d+\s*)?(?:days?|weeks?|months?)\b/gi

// Pull fragments that mention timing from the label text. Labels rarely state a
// single course length, so we surface what is written and nothing more.
// OTC labels use bullet lists without full stops, so split on bullets too.
function extractDurationInfo(label) {
  const sources = [
    joinField(label, 'dosage_and_administration'),
    joinField(label, 'stop_use'),
    joinField(label, 'directions'),
  ].filter(Boolean)
  const fragments = new Set()
  for (const text of sources) {
    for (const fragment of text.split(/(?<=[.;])\s+|\s*[\u2022\u25a0\u25aa]\s*|\n+/)) {
      const trimmed = fragment.trim()
      if (trimmed.length <= 8 || !DURATION_PATTERN.test(trimmed)) continue
      if (trimmed.length < 400) {
        fragments.add(trimmed)
      } else {
        // Some labels are one unpunctuated run; keep a few words of context instead.
        for (const match of trimmed.matchAll(DURATION_PHRASE)) fragments.add(`…${match[0].trim()}`)
      }
      if (fragments.size >= 4) break
    }
  }
  return fragments.size ? [...fragments].join('\n') : null
}

export function normalizeLabel(label) {
  const openfda = label.openfda ?? {}
  return {
    id: label.set_id ?? label.id,
    brandName: openfda.brand_name?.[0] ?? null,
    genericName: openfda.generic_name?.[0] ?? null,
    manufacturer: openfda.manufacturer_name?.[0] ?? null,
    route: openfda.route?.join(', ') ?? null,
    productType: openfda.product_type?.[0] ?? null,
    purpose: joinField(label, 'purpose', 'indications_and_usage'),
    sideEffects: joinField(label, 'adverse_reactions'),
    warnings: joinField(label, 'boxed_warning', 'warnings_and_cautions', 'warnings', 'precautions'),
    interactions: joinField(label, 'drug_interactions', 'do_not_use', 'ask_doctor_or_pharmacist'),
    whenToAskDoctor: joinField(label, 'stop_use', 'ask_doctor'),
    dosage: joinField(label, 'dosage_and_administration', 'directions'),
    durationInfo: extractDurationInfo(label),
    effectiveTime: label.effective_time ?? null,
  }
}

export function displayName(drug) {
  return drug.brandName ?? drug.genericName ?? 'Unnamed product'
}

// Lower is better: exact generic/brand matches first, then names that start
// with the term, then everything else (e.g. combination products).
function matchRank(drug, q) {
  const generic = drug.genericName?.toLowerCase() ?? ''
  const brand = drug.brandName?.toLowerCase() ?? ''
  if (generic === q || brand === q) return 0
  if (generic.startsWith(q) || brand.startsWith(q)) return 1
  return 2
}

export async function searchMedications(term, limit = 12) {
  const q = clean(term)
  if (!q) return []
  const search = `openfda.brand_name:"${q}" openfda.generic_name:"${q}" openfda.substance_name:"${q}"`
  // Many labels are repackaged copies, so over-fetch and de-duplicate.
  const results = await request(search, 100)
  const seen = new Set()
  const needle = q.toLowerCase()
  return results
    .map(normalizeLabel)
    .filter((drug) => {
      const key = `${drug.brandName}|${drug.genericName}`.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => matchRank(a, needle) - matchRank(b, needle))
    .slice(0, limit)
}

export async function getMedicationById(setId) {
  const results = await request(`set_id:"${clean(setId)}"`, 1)
  return results[0] ? normalizeLabel(results[0]) : null
}

// Best-effort lookup for a medication the user typed in by name.
export async function findMedicationByName(name) {
  const results = await searchMedications(name, 1)
  return results[0] ?? null
}
