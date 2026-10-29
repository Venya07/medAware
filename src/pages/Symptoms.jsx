import PageHeader from '../components/PageHeader.jsx'
import SymptomTracker from '../components/SymptomTracker.jsx'

export default function Symptoms() {
  return (
    <>
      <PageHeader
        eyebrow="Symptom tracker"
        title="How are you feeling?"
        description="Log symptoms and how strong they feel. A record over time can help you describe things clearly to your provider."
      />
      <SymptomTracker />
    </>
  )
}
