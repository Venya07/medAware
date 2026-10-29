import { useState } from 'react'
import DoctorQuestions from '../components/DoctorQuestions.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { useMedications } from '../context/MedicationContext.jsx'
import { CHECKLIST_ITEMS, needsAttention } from '../data/checklist.js'
import { formatDate, todayISO } from '../utils/dates.js'

function AppointmentList() {
  const { appointments, addAppointment, removeAppointment } = useMedications()
  const [form, setForm] = useState({ date: '', provider: '', purpose: '' })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const sorted = [...appointments].sort((a, b) => a.date.localeCompare(b.date))
  const today = todayISO()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.date) return
    addAppointment(form)
    setForm({ date: '', provider: '', purpose: '' })
  }

  return (
    <section className="card flex flex-col gap-4">
      <h2 className="text-lg font-bold text-lav-900">Follow-up appointments</h2>
      <ul className="flex flex-col gap-2">
        {sorted.length === 0 && <li className="text-sm text-slate-400">No appointments saved.</li>}
        {sorted.map((a) => (
          <li key={a.id} className={`flex items-start justify-between gap-2 rounded-2xl px-4 py-3 ${a.date >= today ? 'bg-lav-50' : 'bg-slate-50 text-slate-500'}`}>
            <div>
              <p className="font-semibold text-slate-800">{formatDate(a.date)}{a.date < today && ' · past'}</p>
              <p className="text-sm text-slate-600">{[a.provider, a.purpose].filter(Boolean).join(' — ')}</p>
              {a.isDemo && <span className="badge mt-1 bg-white text-slate-500">Fictional demo</span>}
            </div>
            <button type="button" className="btn-ghost px-2.5 py-1 hover:text-rose-600" onClick={() => removeAppointment(a.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="grid gap-2 border-t border-lav-100 pt-4">
        <input type="date" className="input" value={form.date} onChange={set('date')} required aria-label="Appointment date" />
        <input className="input" value={form.provider} onChange={set('provider')} placeholder="Provider" />
        <input className="input" value={form.purpose} onChange={set('purpose')} placeholder="Purpose (e.g. follow-up)" />
        <button type="submit" className="btn-secondary">Add appointment</button>
      </form>
    </section>
  )
}

// Rendered only when printing.
function PrintableSummary() {
  const { medications, checklists, questions, appointments, symptoms } = useMedications()
  const next = [...appointments].filter((a) => a.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date))[0]
  const recentSymptoms = [...symptoms].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)

  return (
    <div className="hidden text-sm text-black print:block">
      <h1 className="text-2xl font-bold">MedAware — Appointment summary</h1>
      <p className="text-xs">Printed {new Date().toLocaleDateString()} · Educational summary, not medical advice.</p>
      {next && <p className="mt-2"><strong>Next appointment:</strong> {formatDate(next.date)} {next.provider && `with ${next.provider}`} {next.purpose && `— ${next.purpose}`}</p>}

      <h2 className="mt-5 border-b text-lg font-bold">Medications</h2>
      <table className="mt-2 w-full text-left">
        <thead><tr><th>Name</th><th>Reason</th><th>Started</th><th>Review date</th><th>Topics to discuss</th></tr></thead>
        <tbody>
          {medications.map((m) => {
            const cl = checklists[m.id]
            const topics = cl ? CHECKLIST_ITEMS.filter((i) => needsAttention(cl.answers[i.key])).map((i) => i.topic).join(', ') || 'None' : 'Checklist not done'
            return (
              <tr key={m.id} className="align-top">
                <td className="pr-2 font-semibold">{m.name}</td>
                <td className="pr-2">{m.reason}</td>
                <td className="pr-2">{formatDate(m.startDate)}</td>
                <td className="pr-2">{m.reviewDate ? formatDate(m.reviewDate) : '—'}</td>
                <td>{topics}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <h2 className="mt-5 border-b text-lg font-bold">Questions to ask</h2>
      <ul className="mt-2 list-none">
        {questions.map((q) => (
          <li key={q.id}>☐ {q.text} <span className="text-xs">({medications.find((m) => m.id === q.medId)?.name ?? 'General'})</span></li>
        ))}
        {questions.length === 0 && <li>No questions saved.</li>}
      </ul>

      <h2 className="mt-5 border-b text-lg font-bold">Recent symptom log</h2>
      <ul className="mt-2">
        {recentSymptoms.map((s) => <li key={s.id}>{formatDate(s.date)} — {s.name}, severity {s.severity}/10{s.notes && ` (${s.notes})`}</li>)}
        {recentSymptoms.length === 0 && <li>No symptoms logged.</li>}
      </ul>

      <h2 className="mt-5 border-b text-lg font-bold">Notes from visit</h2>
      <div className="mt-2 h-32 border" />
    </div>
  )
}

export default function Appointments() {
  return (
    <>
      <PageHeader
        eyebrow="Appointment preparation"
        title="Get ready for your visit"
        description="Your checklist questions are gathered here automatically. Review them, add your own, and print a summary to bring along."
        actions={<button type="button" className="btn-primary" onClick={() => window.print()}>Print summary</button>}
      />
      <div className="grid gap-6 print:hidden lg:grid-cols-[1fr_minmax(0,340px)]">
        <DoctorQuestions />
        <AppointmentList />
      </div>
      <PrintableSummary />
    </>
  )
}
