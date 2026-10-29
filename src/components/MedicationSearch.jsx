import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMedications } from '../context/MedicationContext.jsx'
import { displayName, searchMedications } from '../services/fdaApi.js'

const SUGGESTIONS = ['Ibuprofen', 'Amoxicillin', 'Lisinopril', 'Metformin', 'Sertraline']

const snippet = (text, length = 160) => {
  if (!text) return null
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > length ? `${flat.slice(0, length).trimEnd()}…` : flat
}

function Field({ label, text }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-lav-600">{label}</dt>
      <dd className={`mt-0.5 text-sm ${text ? 'text-slate-600' : 'italic text-slate-400'}`}>
        {snippet(text) ?? 'Not listed on label'}
      </dd>
    </div>
  )
}

// `for` in the query string means the user is linking a label to one of their
// saved medications (from the dashboard's "Find FDA label" button).
export default function MedicationSearch() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { getMedication, updateMedication } = useMedications()
  const linkTarget = getMedication(params.get('for'))

  const [term, setTerm] = useState(params.get('q') ?? '')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [error, setError] = useState('')

  const query = params.get('q') ?? ''

  useEffect(() => {
    if (!query) return
    let cancelled = false
    setStatus('loading')
    setError('')
    searchMedications(query)
      .then((found) => {
        if (cancelled) return
        setResults(found)
        setStatus('done')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [query])

  const runSearch = (value) => {
    const next = new URLSearchParams(params)
    next.set('q', value.trim())
    setParams(next)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (term.trim()) runSearch(term)
  }

  const linkLabel = (drug) => {
    updateMedication(linkTarget.id, { fdaId: drug.id })
    navigate(`/checklist/${linkTarget.id}`)
  }

  return (
    <div className="flex flex-col gap-6">
      {linkTarget && (
        <div className="rounded-2xl border border-lav-300 bg-lav-50 px-4 py-3 text-sm text-lav-900">
          Choose the FDA label that matches <strong>{linkTarget.name}</strong>. Check the brand, generic name, and
          manufacturer against your prescription or pharmacy label.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-lav-400" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            className="input py-3.5 pl-12 text-base"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search by brand or generic name…"
            aria-label="Medication name"
          />
        </div>
        <button type="submit" className="btn-primary py-3.5" disabled={!term.trim() || status === 'loading'}>
          {status === 'loading' ? 'Searching…' : 'Search openFDA'}
        </button>
      </form>

      {status === 'idle' && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          Try:
          {SUGGESTIONS.map((name) => (
            <button
              key={name}
              type="button"
              className="rounded-full border border-lav-200 px-3 py-1 text-lav-700 transition hover:bg-lav-50"
              onClick={() => {
                setTerm(name)
                runSearch(name)
              }}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {status === 'loading' && (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-5 w-1/2 rounded-full bg-lav-100" />
              <div className="mt-3 h-3 w-1/3 rounded-full bg-lav-50" />
              <div className="mt-6 space-y-2">
                <div className="h-3 rounded-full bg-lav-50" />
                <div className="h-3 w-5/6 rounded-full bg-lav-50" />
              </div>
            </div>
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}{' '}
          <button type="button" className="font-semibold underline" onClick={() => runSearch(query)}>
            Retry
          </button>
        </div>
      )}

      {status === 'done' && results.length === 0 && (
        <div className="card text-center text-slate-600">
          No FDA labels found for “{query}”. Check the spelling, or try the generic name.
        </div>
      )}

      {status === 'done' && results.length > 0 && (
        <>
          <p className="text-sm text-slate-500">
            {results.length} label{results.length === 1 ? '' : 's'} from the openFDA Drug Label API for “{query}”.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((drug) => (
              <article key={drug.id} className="card fade-in flex flex-col gap-4 transition hover:-translate-y-0.5 hover:border-lav-300">
                <div>
                  <h3 className="text-lg font-bold text-lav-900">{displayName(drug)}</h3>
                  <p className="text-sm text-slate-500">
                    {[drug.genericName, drug.route, drug.manufacturer].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <dl className="grid gap-3">
                  <Field label="Purpose" text={drug.purpose} />
                  <Field label="Side effects" text={drug.sideEffects} />
                  <Field label="Warnings" text={drug.warnings} />
                  <Field label="Treatment duration info" text={drug.durationInfo} />
                </dl>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <Link to={`/medication/${drug.id}`} className="btn-secondary px-4 py-2">View full label</Link>
                  {linkTarget && (
                    <button type="button" className="btn-primary px-4 py-2" onClick={() => linkLabel(drug)}>
                      Use for my {linkTarget.name}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
