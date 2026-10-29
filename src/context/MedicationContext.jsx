import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { CHECKLIST_ITEMS, needsAttention } from '../data/checklist.js'

const STORAGE_KEY = 'medaware-demo-data-v1'

const MedicationContext = createContext(null)

const newId = () => crypto.randomUUID()

const daysFromToday = (offset) => {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

// Fictional demo data. None of it describes a real person, and no medication
// facts are stored here — those are always fetched live from openFDA.
function createDemoData() {
  const ibuprofen = newId()
  const lisinopril = newId()
  return {
    medications: [
      {
        id: ibuprofen,
        name: 'Ibuprofen',
        fdaId: null,
        reason: 'Demo: knee pain after a fictional running injury',
        dosage: 'Demo: as directed by provider',
        prescriber: 'Dr. Demo Rivera (fictional)',
        startDate: daysFromToday(-21),
        reviewDate: daysFromToday(9),
        notes: 'Fictional demo entry.',
        isDemo: true,
      },
      {
        id: lisinopril,
        name: 'Lisinopril',
        fdaId: null,
        reason: 'Demo: fictional blood pressure management',
        dosage: 'Demo: once daily',
        prescriber: 'Dr. Demo Chen (fictional)',
        startDate: daysFromToday(-60),
        reviewDate: '',
        notes: 'Fictional demo entry.',
        isDemo: true,
      },
    ],
    checklists: {},
    symptoms: [
      { id: newId(), name: 'Headache', severity: 4, notes: 'Demo log', date: daysFromToday(-12), isDemo: true },
      { id: newId(), name: 'Headache', severity: 6, notes: 'Demo log', date: daysFromToday(-8), isDemo: true },
      { id: newId(), name: 'Dizziness', severity: 3, notes: 'Demo log', date: daysFromToday(-6), isDemo: true },
      { id: newId(), name: 'Headache', severity: 3, notes: 'Demo log', date: daysFromToday(-3), isDemo: true },
      { id: newId(), name: 'Headache', severity: 2, notes: 'Demo log', date: daysFromToday(-1), isDemo: true },
    ],
    appointments: [
      {
        id: newId(),
        date: daysFromToday(9),
        provider: 'Dr. Demo Rivera (fictional)',
        purpose: 'Demo follow-up visit',
        isDemo: true,
      },
    ],
    questions: [],
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // Fall through to demo data if storage is unavailable or corrupt.
  }
  return createDemoData()
}

export function MedicationProvider({ children }) {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage may be blocked (private mode); the app still works in memory.
    }
  }, [state])

  const update = useCallback((key, fn) => setState((s) => ({ ...s, [key]: fn(s[key]) })), [])

  const actions = useMemo(
    () => ({
      addMedication(med) {
        const id = newId()
        update('medications', (list) => [...list, { ...med, id, isDemo: false }])
        return id
      },
      updateMedication(id, changes) {
        update('medications', (list) => list.map((m) => (m.id === id ? { ...m, ...changes } : m)))
      },
      removeMedication(id) {
        setState((s) => {
          const { [id]: _removed, ...checklists } = s.checklists
          return {
            ...s,
            medications: s.medications.filter((m) => m.id !== id),
            checklists,
            questions: s.questions.filter((q) => q.medId !== id),
          }
        })
      },

      // Saving a checklist regenerates that medication's suggested questions,
      // while keeping any the user has written or edited themselves.
      saveChecklist(medId, answers) {
        setState((s) => {
          const kept = s.questions.filter((q) => q.medId !== medId || q.source !== 'checklist' || q.edited)
          const generated = CHECKLIST_ITEMS.filter((item) => needsAttention(answers[item.key])).flatMap((item) =>
            item.providerQuestions.map((text) => ({
              id: newId(),
              medId,
              topic: item.topic,
              text,
              source: 'checklist',
              edited: false,
              asked: false,
            })),
          )
          return {
            ...s,
            checklists: { ...s.checklists, [medId]: { answers, completedAt: new Date().toISOString() } },
            questions: [...kept, ...generated],
          }
        })
      },

      addSymptom(entry) {
        update('symptoms', (list) => [...list, { ...entry, id: newId(), isDemo: false }])
      },
      removeSymptom(id) {
        update('symptoms', (list) => list.filter((s) => s.id !== id))
      },

      addAppointment(appt) {
        update('appointments', (list) => [...list, { ...appt, id: newId(), isDemo: false }])
      },
      removeAppointment(id) {
        update('appointments', (list) => list.filter((a) => a.id !== id))
      },

      addQuestion(question) {
        update('questions', (list) => [
          ...list,
          { topic: 'My own question', ...question, id: newId(), source: 'custom', edited: false, asked: false },
        ])
      },
      updateQuestion(id, changes) {
        update('questions', (list) => list.map((q) => (q.id === id ? { ...q, ...changes } : q)))
      },
      removeQuestion(id) {
        update('questions', (list) => list.filter((q) => q.id !== id))
      },

      resetDemoData() {
        setState(createDemoData())
      },
      clearAllData() {
        setState({ medications: [], checklists: {}, symptoms: [], appointments: [], questions: [] })
      },
    }),
    [update],
  )

  const value = useMemo(
    () => ({
      ...state,
      ...actions,
      getMedication: (id) => state.medications.find((m) => m.id === id) ?? null,
    }),
    [state, actions],
  )

  return <MedicationContext.Provider value={value}>{children}</MedicationContext.Provider>
}

export function useMedications() {
  const context = useContext(MedicationContext)
  if (!context) throw new Error('useMedications must be used inside <MedicationProvider>')
  return context
}
