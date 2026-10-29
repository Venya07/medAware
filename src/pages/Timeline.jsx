import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import { useMedications } from '../context/MedicationContext.jsx'
import { formatDate, todayISO } from '../utils/dates.js'

const KINDS = {
  start: { label: 'Medication start', dot: 'bg-lav-600', chip: 'bg-lav-100 text-lav-800' },
  review: { label: 'Doctor review date', dot: 'bg-sky-500', chip: 'bg-sky-50 text-sky-700' },
  appointment: { label: 'Appointment', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700' },
  symptom: { label: 'Symptom log', dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700' },
}

export default function Timeline() {
  const { medications, appointments, symptoms } = useMedications()
  const [hidden, setHidden] = useState(new Set())

  // Only dates the user actually entered appear here; stop dates are never estimated.
  const events = useMemo(() => {
    const list = []
    for (const m of medications) {
      if (m.startDate) list.push({ id: `s-${m.id}`, kind: 'start', date: m.startDate, title: `Started ${m.name}`, detail: m.reason })
      if (m.reviewDate) list.push({ id: `r-${m.id}`, kind: 'review', date: m.reviewDate, title: `Review ${m.name} with provider`, detail: m.prescriber })
    }
    for (const a of appointments) {
      list.push({ id: a.id, kind: 'appointment', date: a.date, title: a.purpose || 'Appointment', detail: a.provider })
    }
    for (const s of symptoms) {
      list.push({ id: s.id, kind: 'symptom', date: s.date, title: `${s.name} — ${s.severity}/10`, detail: s.notes })
    }
    return list.sort((a, b) => b.date.localeCompare(a.date))
  }, [medications, appointments, symptoms])

  const visible = events.filter((e) => !hidden.has(e.kind))
  const today = todayISO()
  const todayIndex = visible.findIndex((e) => e.date <= today)

  const toggle = (kind) =>
    setHidden((prev) => {
      const next = new Set(prev)
      next.has(kind) ? next.delete(kind) : next.add(kind)
      return next
    })

  return (
    <>
      <PageHeader
        eyebrow="Medication timeline"
        title="Your timeline"
        description="Start dates, doctor-specified review dates, appointments, and symptom logs in one place. MedAware never estimates when a medication should stop — that's a decision for you and your provider."
      />

      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter events">
        {Object.entries(KINDS).map(([kind, meta]) => (
          <button
            key={kind}
            type="button"
            aria-pressed={!hidden.has(kind)}
            onClick={() => toggle(kind)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              hidden.has(kind) ? 'border-slate-200 text-slate-400' : 'border-lav-200 bg-white text-slate-700 hover:bg-lav-50'
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${hidden.has(kind) ? 'bg-slate-300' : meta.dot}`} />
            {meta.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="card text-center text-slate-500">Nothing to show yet. Add medications, appointments, or symptom logs.</div>
      ) : (
        <ol className="relative ml-3 border-l-2 border-lav-100">
          {visible.map((event, index) => (
            <li key={event.id} className="fade-in">
              {index === todayIndex && (
                <div className="relative -ml-3 mb-4 flex items-center gap-2">
                  <span className="rounded-full bg-lav-600 px-3 py-1 text-xs font-bold text-white">Today · {formatDate(today)}</span>
                  <span className="h-px flex-1 bg-lav-300" />
                </div>
              )}
              <div className="relative mb-4 pl-8">
                <span className={`absolute -left-[9px] top-5 h-4 w-4 rounded-full border-[3px] border-white ${KINDS[event.kind].dot}`} />
                <div className={`card p-4 ${event.date > today ? 'border-dashed' : ''}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-500">{formatDate(event.date)}</span>
                    <span className={`badge ${KINDS[event.kind].chip}`}>{KINDS[event.kind].label}</span>
                    {event.date > today && <span className="badge bg-slate-100 text-slate-500">Upcoming</span>}
                  </div>
                  <p className="mt-1 font-semibold text-lav-900">{event.title}</p>
                  {event.detail && <p className="text-sm text-slate-500">{event.detail}</p>}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  )
}
