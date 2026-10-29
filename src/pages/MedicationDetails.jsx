import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Disclaimer from '../components/Disclaimer.jsx'
import FdaSection from '../components/FdaSection.jsx'
import MedicationForm from '../components/MedicationForm.jsx'
import { useMedications } from '../context/MedicationContext.jsx'
import { displayName, getMedicationById } from '../services/fdaApi.js'
import { formatDate } from '../utils/dates.js'

const SECTIONS = [
  ['purpose', 'Purpose / indications'],
  ['durationInfo', 'Treatment duration information'],
  ['dosage', 'Dosage and administration'],
  ['sideEffects', 'Side effects (adverse reactions)'],
  ['warnings', 'Warnings'],
  ['whenToAskDoctor', 'When to stop use / ask a doctor'],
  ['interactions', 'Drug interactions'],
]

export default function MedicationDetails() {
  const { fdaId } = useParams()
  const navigate = useNavigate()
  const { medications, addMedication } = useMedications()
  const [state, setState] = useState({ status: 'loading', drug: null, error: '' })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading', drug: null, error: '' })
    getMedicationById(fdaId)
      .then((drug) => !cancelled && setState({ status: 'done', drug, error: '' }))
      .catch((err) => !cancelled && setState({ status: 'error', drug: null, error: err.message }))
    return () => {
      cancelled = true
    }
  }, [fdaId])

  if (state.status === 'loading') {
    return <div className="card animate-pulse py-20 text-center text-slate-400">Loading FDA label…</div>
  }
  if (state.status === 'error' || !state.drug) {
    return (
      <div className="card text-center">
        <p className="text-slate-700">{state.error || 'This FDA label could not be found.'}</p>
        <Link to="/search" className="btn-secondary mt-4">Back to search</Link>
      </div>
    )
  }

  const drug = state.drug
  const saved = medications.find((m) => m.fdaId === drug.id)

  return (
    <div className="flex flex-col gap-6">
      <button type="button" onClick={() => navigate(-1)} className="btn-ghost self-start px-3">← Back</button>

      <section className="card bg-gradient-to-br from-white to-lav-50">
        <span className="badge bg-lav-100 text-lav-700">Source: openFDA Drug Label API</span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-lav-900">{displayName(drug)}</h1>
        <p className="mt-1 text-slate-600">
          {[drug.genericName, drug.route, drug.productType, drug.manufacturer].filter(Boolean).join(' · ')}
        </p>
        {drug.effectiveTime && (
          <p className="mt-1 text-xs text-slate-400">Label effective {formatDate(`${drug.effectiveTime.slice(0, 4)}-${drug.effectiveTime.slice(4, 6)}-${drug.effectiveTime.slice(6, 8)}`)}</p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          {saved ? (
            <Link to={`/checklist/${saved.id}`} className="btn-primary">Open my checklist</Link>
          ) : (
            !adding && <button type="button" className="btn-primary" onClick={() => setAdding(true)}>+ Add to my medications</button>
          )}
        </div>
      </section>

      {adding && (
        <section className="card">
          <h2 className="mb-4 text-lg font-bold text-lav-900">Add {displayName(drug)}</h2>
          <MedicationForm
            initial={{ name: displayName(drug), fdaId: drug.id }}
            submitLabel="Add & start checklist"
            onCancel={() => setAdding(false)}
            onSubmit={(med) => navigate(`/checklist/${addMedication(med)}`)}
          />
        </section>
      )}

      <div className="grid gap-3">
        {SECTIONS.map(([field, title]) => (
          <FdaSection
            key={field}
            title={title}
            text={drug[field]}
            emptyText={
              field === 'durationInfo'
                ? 'This label does not state a treatment duration. Ask your provider how long you should take it.'
                : undefined
            }
          />
        ))}
      </div>

      <Disclaimer>
        Label text is shown as published by the FDA and may not reflect your exact product, dose, or situation. It is
        not a substitute for advice from your healthcare provider or pharmacist.
      </Disclaimer>
    </div>
  )
}
