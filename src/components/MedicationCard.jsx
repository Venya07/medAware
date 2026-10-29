import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMedications } from '../context/MedicationContext.jsx'
import { CHECKLIST_ITEMS, needsAttention } from '../data/checklist.js'
import { formatDate } from '../utils/dates.js'
import MedicationForm from './MedicationForm.jsx'

function ChecklistStatus({ checklist }) {
  if (!checklist) {
    return <span className="badge bg-amber-50 text-amber-700">○ Checklist not started</span>
  }
  const open = CHECKLIST_ITEMS.filter((item) => needsAttention(checklist.answers[item.key])).length
  return open === 0 ? (
    <span className="badge bg-emerald-50 text-emerald-700">✓ Checklist complete</span>
  ) : (
    <span className="badge bg-lav-100 text-lav-800">
      ✓ Completed · {open} topic{open === 1 ? '' : 's'} to discuss
    </span>
  )
}

export default function MedicationCard({ medication }) {
  const { checklists, updateMedication, removeMedication } = useMedications()
  const [editing, setEditing] = useState(false)
  const [confirmingRemove, setConfirmingRemove] = useState(false)

  if (editing) {
    return (
      <div className="card">
        <h3 className="mb-4 text-lg font-bold text-lav-900">Edit {medication.name}</h3>
        <MedicationForm
          initial={medication}
          submitLabel="Save changes"
          onCancel={() => setEditing(false)}
          onSubmit={(changes) => {
            updateMedication(medication.id, changes)
            setEditing(false)
          }}
        />
      </div>
    )
  }

  const fdaLink = medication.fdaId
    ? `/medication/${medication.fdaId}`
    : `/search?q=${encodeURIComponent(medication.name)}&for=${medication.id}`

  return (
    <article className="card fade-in flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_32px_-12px_rgba(91,62,180,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-lav-900">{medication.name}</h3>
          {medication.reason && <p className="mt-0.5 text-sm text-slate-600">{medication.reason}</p>}
        </div>
        {medication.isDemo && <span className="badge shrink-0 bg-slate-100 text-slate-600">Fictional demo</span>}
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Started</dt>
          <dd className="font-medium text-slate-700">{formatDate(medication.startDate)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Doctor review date</dt>
          <dd className="font-medium text-slate-700">{medication.reviewDate ? formatDate(medication.reviewDate) : 'Not set'}</dd>
        </div>
        {medication.dosage && (
          <div className="col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Dosage (from provider)</dt>
            <dd className="text-slate-700">{medication.dosage}</dd>
          </div>
        )}
        {medication.prescriber && (
          <div className="col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Prescriber</dt>
            <dd className="text-slate-700">{medication.prescriber}</dd>
          </div>
        )}
      </dl>

      <div>
        <ChecklistStatus checklist={checklists[medication.id]} />
      </div>

      <div className="mt-auto flex flex-wrap gap-2 border-t border-lav-100 pt-4">
        <Link to={`/checklist/${medication.id}`} className="btn-primary px-4 py-2">
          {checklists[medication.id] ? 'View results' : 'Start checklist'}
        </Link>
        <Link to={fdaLink} className="btn-secondary px-4 py-2">
          {medication.fdaId ? 'FDA info' : 'Find FDA label'}
        </Link>
        <button type="button" className="btn-ghost px-3 py-2" onClick={() => setEditing(true)}>Edit</button>
        {confirmingRemove ? (
          <span className="flex items-center gap-1">
            <button type="button" className="btn px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100" onClick={() => removeMedication(medication.id)}>
              Confirm remove
            </button>
            <button type="button" className="btn-ghost px-3 py-2" onClick={() => setConfirmingRemove(false)}>Keep</button>
          </span>
        ) : (
          <button type="button" className="btn-ghost px-3 py-2 hover:text-rose-600" onClick={() => setConfirmingRemove(true)}>
            Remove
          </button>
        )}
      </div>
    </article>
  )
}
