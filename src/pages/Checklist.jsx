import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ChecklistResults from '../components/ChecklistResults.jsx'
import MedicationChecklist from '../components/MedicationChecklist.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { useMedications } from '../context/MedicationContext.jsx'

export default function Checklist() {
  const { medId } = useParams()
  const { getMedication, checklists, saveChecklist } = useMedications()
  const medication = getMedication(medId)
  const checklist = checklists[medId]
  const [retaking, setRetaking] = useState(false)

  if (!medication) {
    return (
      <div className="card mx-auto max-w-md text-center">
        <p className="text-slate-700">That medication isn't on your dashboard.</p>
        <Link to="/dashboard" className="btn-primary mt-4">Go to dashboard</Link>
      </div>
    )
  }

  const showResults = checklist && !retaking

  return (
    <>
      <PageHeader
        eyebrow="Medication transparency checklist"
        title={medication.name}
        description={
          showResults
            ? 'Here is what you understand so far, and where to dig deeper.'
            : 'Answer honestly — there are no wrong answers. Anything you are unsure about becomes a question for your provider.'
        }
      />
      {showResults ? (
        <ChecklistResults medication={medication} checklist={checklist} onRetake={() => setRetaking(true)} />
      ) : (
        <MedicationChecklist
          key={checklist?.completedAt ?? 'new'}
          medication={medication}
          initialAnswers={checklist?.answers}
          onComplete={(answers) => {
            saveChecklist(medication.id, answers)
            setRetaking(false)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      )}
    </>
  )
}
