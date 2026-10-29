import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MedicationCard from '../components/MedicationCard.jsx'
import MedicationForm from '../components/MedicationForm.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { useMedications } from '../context/MedicationContext.jsx'

function Stat({ label, value }) {
  return (
    <div className="rounded-3xl border border-lav-100 bg-gradient-to-br from-white to-lav-50 px-5 py-4">
      <p className="text-3xl font-extrabold text-lav-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  )
}

export default function Dashboard() {
  const { medications, checklists, questions, addMedication, resetDemoData, clearAllData } = useMedications()
  const [adding, setAdding] = useState(false)
  const [confirming, setConfirming] = useState(null) // 'reset' | 'clear' | null
  const navigate = useNavigate()

  const completed = medications.filter((m) => checklists[m.id]).length
  const openQuestions = questions.filter((q) => !q.asked).length

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="My medications"
        description="Add the medications you're taking, complete a transparency checklist for each, and keep details up to date."
        actions={
          !adding && (
            <button type="button" className="btn-primary" onClick={() => setAdding(true)}>+ Add medication</button>
          )
        }
      />

      <div className="mb-8 grid grid-cols-3 gap-3 sm:gap-4">
        <Stat label="Medications" value={medications.length} />
        <Stat label="Checklists done" value={`${completed}/${medications.length}`} />
        <Stat label="Open questions" value={openQuestions} />
      </div>

      {adding && (
        <section className="card mb-8">
          <h2 className="mb-4 text-lg font-bold text-lav-900">Add a medication</h2>
          <MedicationForm
            onCancel={() => setAdding(false)}
            onSubmit={(med) => {
              const id = addMedication(med)
              setAdding(false)
              navigate(`/checklist/${id}`)
            }}
            submitLabel="Add & start checklist"
          />
        </section>
      )}

      {medications.length === 0 ? (
        <div className="card py-14 text-center">
          <p className="text-lg font-semibold text-lav-900">No medications yet</p>
          <p className="mt-1 text-slate-500">Add one manually, or search openFDA and add it from the label page.</p>
          <div className="mt-5 flex justify-center gap-2">
            <button type="button" className="btn-primary" onClick={() => setAdding(true)}>Add medication</button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/search')}>Search openFDA</button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {medications.map((m) => <MedicationCard key={m.id} medication={m} />)}
        </div>
      )}

      <section className="mt-12 rounded-3xl border border-dashed border-lav-200 p-5 text-sm text-slate-600">
        <p>
          <strong className="text-lav-900">About your data:</strong> everything here is saved only in this browser's
          localStorage. Entries marked “Fictional demo” are made-up examples. Please don't store real personal health
          information.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {confirming ? (
            <>
              <span>{confirming === 'reset' ? 'Replace everything with demo data?' : 'Delete all saved data?'}</span>
              <button
                type="button"
                className="btn px-4 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100"
                onClick={() => {
                  confirming === 'reset' ? resetDemoData() : clearAllData()
                  setConfirming(null)
                }}
              >
                Yes, continue
              </button>
              <button type="button" className="btn-ghost px-4 py-1.5" onClick={() => setConfirming(null)}>Cancel</button>
            </>
          ) : (
            <>
              <button type="button" className="btn-secondary px-4 py-1.5" onClick={() => setConfirming('reset')}>Reset demo data</button>
              <button type="button" className="btn-ghost px-4 py-1.5" onClick={() => setConfirming('clear')}>Clear all data</button>
            </>
          )}
        </div>
      </section>
    </>
  )
}
