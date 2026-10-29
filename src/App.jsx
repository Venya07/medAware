import { Link, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Appointments from './pages/Appointments.jsx'
import Checklist from './pages/Checklist.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Home from './pages/Home.jsx'
import MedicationDetails from './pages/MedicationDetails.jsx'
import Search from './pages/Search.jsx'
import Symptoms from './pages/Symptoms.jsx'
import Timeline from './pages/Timeline.jsx'

function NotFound() {
  return (
    <div className="card mx-auto max-w-md text-center">
      <h1 className="text-2xl font-bold text-lav-900">Page not found</h1>
      <Link to="/" className="btn-primary mt-4">Go home</Link>
    </div>
  )
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/medication/:fdaId" element={<MedicationDetails />} />
          <Route path="/checklist/:medId" element={<Checklist />} />
          <Route path="/symptoms" element={<Symptoms />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="border-t border-lav-100 py-6 text-center text-xs text-slate-400 print:hidden">
        MedAware is educational and not medical advice. Medication information comes from the public openFDA Drug Label
        API. Demo data is fictional and stored only in your browser.
      </footer>
    </div>
  )
}
