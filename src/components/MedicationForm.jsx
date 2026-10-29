import { useState } from 'react'

const EMPTY = { name: '', fdaId: null, reason: '', dosage: '', prescriber: '', startDate: '', reviewDate: '', notes: '' }

export default function MedicationForm({ initial, onSubmit, onCancel, submitLabel = 'Save medication' }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial })

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit({ ...form, name: form.name.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="fade-in grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="label" htmlFor="med-name">Medication name *</label>
        <input id="med-name" className="input" value={form.name} onChange={set('name')} placeholder="e.g. Amoxicillin" required />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="med-reason">Why it was prescribed (in your words)</label>
        <input id="med-reason" className="input" value={form.reason} onChange={set('reason')} placeholder="What your provider told you" />
      </div>
      <div>
        <label className="label" htmlFor="med-dosage">Dosage instructions from your provider</label>
        <input id="med-dosage" className="input" value={form.dosage} onChange={set('dosage')} />
      </div>
      <div>
        <label className="label" htmlFor="med-prescriber">Prescriber</label>
        <input id="med-prescriber" className="input" value={form.prescriber} onChange={set('prescriber')} />
      </div>
      <div>
        <label className="label" htmlFor="med-start">Start date</label>
        <input id="med-start" type="date" className="input" value={form.startDate} onChange={set('startDate')} />
      </div>
      <div>
        <label className="label" htmlFor="med-review">Review date (only if your doctor gave one)</label>
        <input id="med-review" type="date" className="input" value={form.reviewDate} onChange={set('reviewDate')} />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="med-notes">Notes</label>
        <textarea id="med-notes" rows={2} className="input" value={form.notes} onChange={set('notes')} />
      </div>
      <p className="text-xs text-slate-500 sm:col-span-2">
        Saved only in this browser. Please use fictional or demo details — don't enter real personal health information.
      </p>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button type="submit" className="btn-primary">{submitLabel}</button>
        {onCancel && (
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  )
}
