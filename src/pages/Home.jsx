import { Link } from 'react-router-dom'
import Disclaimer from '../components/Disclaimer.jsx'
import { useMedications } from '../context/MedicationContext.jsx'

const FEATURES = [
  { to: '/search', title: 'Medication search', text: 'Look up real label information from the openFDA Drug Label API.', icon: '⌕' },
  { to: '/dashboard', title: 'Transparency checklist', text: 'Six questions that show what you understand — and what to ask.', icon: '✓' },
  { to: '/dashboard', title: 'Medication dashboard', text: 'Keep track of your medications and checklist progress.', icon: '▦' },
  { to: '/symptoms', title: 'Symptom tracker', text: 'Log symptoms and severity, then see trends over time.', icon: '∿' },
  { to: '/appointments', title: 'Appointment prep', text: 'Collect questions automatically and print a visit summary.', icon: '✎' },
  { to: '/timeline', title: 'Medication timeline', text: 'Start dates, review dates, visits, and symptom logs in one view.', icon: '↧' },
]

export default function Home() {
  const { medications, checklists } = useMedications()
  const pending = medications.filter((m) => !checklists[m.id])

  return (
    <div className="flex flex-col gap-14">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-lav-100 via-white to-lav-50 px-6 py-14 sm:px-12 sm:py-20">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lav-200/60 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-lav-300/30 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-2xl fade-in">
          <span className="badge bg-white/80 text-lav-700 shadow-sm">Medication transparency, made simple</span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-lav-900 sm:text-5xl">
            Understand every medication you take.
          </h1>
          <p className="mt-5 text-lg text-slate-600">
            MedAware helps you check what you know about your prescriptions, read real FDA label information, and walk
            into appointments with the right questions.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/dashboard" className="btn-primary px-6 py-3 text-base">Open my dashboard</Link>
            <Link to="/search" className="btn-secondary px-6 py-3 text-base">Search a medication</Link>
          </div>
        </div>
      </section>

      {pending.length > 0 && (
        <section className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-lav-900">Ready for your transparency checklist?</h2>
            <p className="text-sm text-slate-600">
              {pending.length} medication{pending.length === 1 ? '' : 's'} on your dashboard {pending.length === 1 ? "hasn't" : "haven't"} been checked yet.
            </p>
          </div>
          <Link to={`/checklist/${pending[0].id}`} className="btn-primary">Start with {pending[0].name}</Link>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-lav-900">Everything in one calm place</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Link key={f.title} to={f.to} className="card group transition-all duration-200 hover:-translate-y-1 hover:border-lav-300">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lav-100 text-xl font-bold text-lav-700 transition group-hover:bg-lav-600 group-hover:text-white">
                {f.icon}
              </span>
              <h3 className="mt-4 font-bold text-lav-900">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <Disclaimer />
    </div>
  )
}
