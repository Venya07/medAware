import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMedications } from '../context/MedicationContext.jsx'
import { ANSWERS, CHECKLIST_ITEMS, needsAttention } from '../data/checklist.js'
import { displayName, findMedicationByName, getMedicationById } from '../services/fdaApi.js'
import { formatDate, todayISO } from '../utils/dates.js'
import FdaSection from './FdaSection.jsx'

const answerLabel = (value) => ANSWERS.find((a) => a.value === value)?.label ?? '—'

function useFdaLabel(medication) {
  const [state, setState] = useState({ status: 'loading', label: null, matchedByName: false, error: '' })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading', label: null, matchedByName: false, error: '' })
    const lookup = medication.fdaId ? getMedicationById(medication.fdaId) : findMedicationByName(medication.name)
    lookup
      .then((label) => !cancelled && setState({ status: 'done', label, matchedByName: !medication.fdaId, error: '' }))
      .catch((err) => !cancelled && setState({ status: 'error', label: null, matchedByName: false, error: err.message }))
    return () => {
      cancelled = true
    }
  }, [medication.fdaId, medication.name])

  return state
}

function FollowUpInfo({ medication }) {
  const { appointments } = useMedications()
  const upcoming = appointments.filter((a) => a.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date))
  return (
    <div className="rounded-2xl bg-lav-50/60 p-4 text-sm text-slate-700">
      <h4 className="font-semibold text-lav-900">What you've saved in MedAware</h4>
      <p className="mt-1">
        Doctor-specified review date for {medication.name}:{' '}
        <strong>{medication.reviewDate ? formatDate(medication.reviewDate) : 'not recorded'}</strong>
      </p>
      <p className="mt-1">
        Upcoming appointments:{' '}
        {upcoming.length ? upcoming.map((a) => `${formatDate(a.date)} (${a.provider || 'provider'})`).join(', ') : 'none saved'}
      </p>
      <p className="mt-2 text-xs text-slate-500">FDA labels don't include personal follow-up schedules — only your care team can set these.</p>
    </div>
  )
}

export default function ChecklistResults({ medication, checklist, onRetake }) {
  const fda = useFdaLabel(medication)
  const flagged = CHECKLIST_ITEMS.filter((item) => needsAttention(checklist.answers[item.key]))
  const understood = CHECKLIST_ITEMS.length - flagged.length
  const percent = Math.round((understood / CHECKLIST_ITEMS.length) * 100)

  return (
    <div className="fade-in flex flex-col gap-6">
      <section className="card flex flex-col items-start gap-6 bg-gradient-to-br from-white to-lav-50 sm:flex-row sm:items-center">
        <div
          className="grid h-28 w-28 shrink-0 place-items-center rounded-full"
          style={{ background: `conic-gradient(var(--color-lav-600) ${percent * 3.6}deg, var(--color-lav-100) 0deg)` }}
          role="img"
          aria-label={`${understood} of ${CHECKLIST_ITEMS.length} topics understood`}
        >
          <div className="grid h-22 w-22 place-items-center rounded-full bg-white text-center">
            <span className="text-2xl font-extrabold text-lav-800">{understood}/{CHECKLIST_ITEMS.length}</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-lav-500">Your transparency results</p>
          <h2 className="mt-1 text-2xl font-bold text-lav-900">{medication.name}</h2>
          <p className="mt-2 text-slate-600">
            {flagged.length === 0
              ? 'You told us you understand all six topics. Keep asking questions whenever something changes.'
              : `You flagged ${flagged.length} topic${flagged.length === 1 ? '' : 's'} to learn more about. Below is what the FDA label says, plus questions you can bring to your provider.`}
          </p>
          <p className="mt-2 text-xs text-slate-400">Completed {new Date(checklist.completedAt).toLocaleString()}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Link to="/appointments" className="btn-primary">Prepare for appointment</Link>
          <button type="button" className="btn-secondary" onClick={onRetake}>Retake checklist</button>
        </div>
      </section>

      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {CHECKLIST_ITEMS.map((item) => {
          const answer = checklist.answers[item.key]
          return (
            <div key={item.key} className="flex items-center justify-between gap-3 rounded-2xl border border-lav-100 bg-white px-4 py-3">
              <span className="text-sm font-medium text-slate-700">{item.topic}</span>
              <span
                className={`badge ${
                  answer === 'yes' ? 'bg-emerald-50 text-emerald-700' : answer === 'no' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                }`}
              >
                {answer === 'yes' ? '✓' : answer === 'no' ? '✕' : '?'} {answerLabel(answer)}
              </span>
            </div>
          )
        })}
      </section>

      {flagged.length > 0 && (
        <div className="text-sm">
          {fda.status === 'loading' && <p className="text-slate-500">Loading FDA label information…</p>}
          {fda.status === 'error' && (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-rose-800">Couldn't load FDA information: {fda.error}</p>
          )}
          {fda.status === 'done' && !fda.label && (
            <p className="rounded-2xl bg-amber-50 px-4 py-3 text-amber-800">
              No FDA label found for “{medication.name}”.{' '}
              <Link className="font-semibold underline" to={`/search?q=${encodeURIComponent(medication.name)}&for=${medication.id}`}>
                Search for the right label
              </Link>
            </p>
          )}
          {fda.status === 'done' && fda.label && (
            <p className="rounded-2xl border border-lav-200 bg-white px-4 py-3 text-slate-600">
              FDA information below is from the openFDA label for <strong>{displayName(fda.label)}</strong>
              {fda.label.manufacturer && ` (${fda.label.manufacturer})`}.{' '}
              {fda.matchedByName && 'This label was matched by name — it may not be your exact product. '}
              <Link className="font-semibold text-lav-700 underline" to={`/search?q=${encodeURIComponent(medication.name)}&for=${medication.id}`}>
                {fda.matchedByName ? 'Choose the exact label' : 'Change label'}
              </Link>
            </p>
          )}
        </div>
      )}

      {flagged.map((item) => (
        <section key={item.key} className="card fade-in">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-bold text-lav-900">{item.topic}</h3>
            <span className="badge bg-lav-100 text-lav-800">You answered: {answerLabel(checklist.answers[item.key])}</span>
          </div>

          <div className="mt-4 grid gap-3">
            {item.key === 'followUp' && <FollowUpInfo medication={medication} />}
            {fda.label &&
              item.fdaFields.map(({ field, label }) => <FdaSection key={field} title={label} text={fda.label[field]} />)}
          </div>

          <div className="mt-5">
            <h4 className="text-sm font-semibold text-slate-700">Questions to ask your healthcare provider</h4>
            <ul className="mt-2 space-y-2">
              {item.providerQuestions.map((q) => (
                <li key={q} className="flex gap-2 text-sm text-slate-700">
                  <span className="text-lav-500">→</span> {q}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-slate-400">These have been added to your appointment questions.</p>
          </div>
        </section>
      ))}
    </div>
  )
}
