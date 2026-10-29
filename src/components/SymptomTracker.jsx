import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useMedications } from '../context/MedicationContext.jsx'
import { formatDate, todayISO } from '../utils/dates.js'

const severityTone = (n) =>
  n >= 8 ? 'bg-rose-50 text-rose-700' : n >= 5 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'

function SeverityTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const entry = payload[0].payload
  return (
    <div className="rounded-xl border border-lav-100 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-slate-800">{formatDate(entry.date)}</p>
      <p className="text-slate-600">Severity: {entry.severity}/10</p>
      {entry.notes && <p className="mt-1 max-w-56 text-xs text-slate-500">{entry.notes}</p>}
    </div>
  )
}

function SymptomForm({ knownNames, onAdd }) {
  const [form, setForm] = useState({ name: '', severity: 5, date: todayISO(), notes: '' })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onAdd({ ...form, name: form.name.trim(), severity: Number(form.severity) })
    setForm((f) => ({ ...f, notes: '' }))
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
      <h2 className="text-lg font-bold text-lav-900">Log a symptom</h2>
      <div>
        <label className="label" htmlFor="sym-name">Symptom</label>
        <input id="sym-name" className="input" list="known-symptoms" value={form.name} onChange={set('name')} placeholder="e.g. Headache" required />
        <datalist id="known-symptoms">
          {knownNames.map((n) => <option key={n} value={n} />)}
        </datalist>
      </div>
      <div>
        <label className="label" htmlFor="sym-severity">
          Severity: <span className="font-bold text-lav-700">{form.severity}/10</span>
        </label>
        <input id="sym-severity" type="range" min="1" max="10" value={form.severity} onChange={set('severity')} className="w-full accent-lav-600" />
        <div className="flex justify-between text-xs text-slate-400"><span>Mild</span><span>Severe</span></div>
      </div>
      <div>
        <label className="label" htmlFor="sym-date">Date</label>
        <input id="sym-date" type="date" className="input" value={form.date} max={todayISO()} onChange={set('date')} required />
      </div>
      <div>
        <label className="label" htmlFor="sym-notes">Notes</label>
        <textarea id="sym-notes" rows={3} className="input" value={form.notes} onChange={set('notes')} placeholder="When it started, what you were doing…" />
      </div>
      <button type="submit" className="btn-primary">Add entry</button>
    </form>
  )
}

export default function SymptomTracker() {
  const { symptoms, addSymptom, removeSymptom } = useMedications()
  const knownNames = useMemo(() => [...new Set(symptoms.map((s) => s.name))].sort(), [symptoms])
  const [selected, setSelected] = useState('')
  const chartSymptom = knownNames.includes(selected) ? selected : knownNames[0]

  const chartData = useMemo(
    () => symptoms.filter((s) => s.name === chartSymptom).sort((a, b) => a.date.localeCompare(b.date)),
    [symptoms, chartSymptom],
  )
  const history = useMemo(() => [...symptoms].sort((a, b) => b.date.localeCompare(a.date)), [symptoms])

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
      <SymptomForm knownNames={knownNames} onAdd={addSymptom} />

      <div className="flex min-w-0 flex-col gap-6">
        <section className="card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-lav-900">
              Severity over time{chartSymptom ? `: ${chartSymptom}` : ''}
            </h2>
            {knownNames.length > 1 && (
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Choose symptom">
                {knownNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelected(name)}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                      name === chartSymptom ? 'bg-lav-600 text-white' : 'bg-lav-50 text-lav-700 hover:bg-lav-100'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {chartData.length === 0 ? (
            <p className="py-12 text-center text-slate-400">Log a symptom to see a chart.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke="#efeaff" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => formatDate(d, { month: 'short', day: 'numeric' })}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e0d7fe' }}
                    tickLine={false}
                  />
                  <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<SeverityTooltip />} cursor={{ stroke: '#c8b8fc', strokeWidth: 1 }} />
                  <Line
                    type="monotone"
                    dataKey="severity"
                    stroke="#7c5cd6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#7c5cd6', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <p className="mt-3 text-xs text-slate-500">
            This chart shows what you logged. It can't tell whether a symptom is related to any medication — share your
            log with your provider to discuss it.
          </p>
        </section>

        <section className="card">
          <h2 className="text-lg font-bold text-lav-900">History</h2>
          {history.length === 0 ? (
            <p className="mt-3 text-slate-400">No entries yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-lav-100">
              {history.map((entry) => (
                <li key={entry.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-800">{entry.name}</span>
                      <span className={`badge ${severityTone(entry.severity)}`}>{entry.severity}/10</span>
                      {entry.isDemo && <span className="badge bg-slate-100 text-slate-500">Fictional demo</span>}
                    </div>
                    <p className="text-sm text-slate-500">{formatDate(entry.date)}{entry.notes && ` · ${entry.notes}`}</p>
                  </div>
                  <button type="button" className="btn-ghost px-3 py-1.5 hover:text-rose-600" onClick={() => removeSymptom(entry.id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
