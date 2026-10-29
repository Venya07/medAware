import MedicationSearch from '../components/MedicationSearch.jsx'
import PageHeader from '../components/PageHeader.jsx'

export default function Search() {
  return (
    <>
      <PageHeader
        eyebrow="openFDA Drug Label API"
        title="Search medications"
        description="Find official label information: purpose, side effects, warnings, and any treatment-duration details the label includes."
      />
      <MedicationSearch />
    </>
  )
}
