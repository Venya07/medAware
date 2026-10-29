import { useState } from 'react'
import { useMedications } from '../context/MedicationContext.jsx'

function QuestionItem({ question, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(question.text)

  const save = () => {
    if (draft.trim()) onUpdate({ text: draft.trim(), edited: true })
    setEditing(false)
  }

  return (
    <li className="group flex items-start gap-3 py-3">
      <input
        type="checkbox"
        checked={question.asked}
        onChange={(e) => onUpdate({ asked: e.target.checked })}
        className="mt-1 h-4 w-4 shrink-0 accent-lav-600"
        aria-label="Mark as asked"
      />
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="input"
              value={draft}
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save()
                if (e.key === 'Escape') setEditing(false)
              }}
            />
            <button type="button" className="btn-primary px-4 py-2" onClick={save}>Save</button>
          </div>
        ) : (
          <p className={`text-sm ${question.asked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{question.text}</p>
        )}
        <p className="mt-0.5 text-xs text-slate-400">
          {question.topic}
          {question.source === 'checklist' && ' · from checklist'}
          {question.edited && ' · edited'}
        </p>
      </div>
      {!editing && (
        <div className="flex shrink-0 gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button type="button" className="btn-ghost px-2.5 py-1" onClick={() => { setDraft(question.text); setEditing(true) }}>Edit</button>
          <button type="button" className="btn-ghost px-2.5 py-1 hover:text-rose-600" onClick={onRemove}>Delete</button>
        </div>
      )}
    </li>
  )
}

export default function DoctorQuestions() {
  const { medications, questions, addQuestion, updateQuestion, removeQuestion } = useMedications()
  const [text, setText] = useState('')
  const [medId, setMedId] = useState('')

  const groups = [
    ...medications.map((m) => ({ id: m.id, title: m.name })),
    { id: null, title: 'General questions' },
  ]
    .map((g) => ({ ...g, items: questions.filter((q) => (q.medId ?? null) === g.id) }))
    .filter((g) => g.items.length)

  const handleAdd = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    addQuestion({ text: text.trim(), medId: medId || null })
    setText('')
  }

  return (
    <section className="card flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold text-lav-900">Questions for your provider</h2>
        <p className="text-sm text-slate-500">
          Questions are collected automatically from your transparency checklists. Edit them, add your own, and tick
          them off during your visit.
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
        <input className="input flex-1" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add your own question…" />
        <select className="input sm:w-48" value={medId} onChange={(e) => setMedId(e.target.value)} aria-label="Related medication">
          <option value="">General</option>
          {medications.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <button type="submit" className="btn-primary" disabled={!text.trim()}>Add</button>
      </form>

      {groups.length === 0 ? (
        <p className="rounded-2xl bg-lav-50 px-4 py-6 text-center text-sm text-slate-500">
          No questions yet. Complete a medication checklist and any topic you mark “No” or “I'm Not Sure” will add
          suggested questions here.
        </p>
      ) : (
        groups.map((group) => (
          <div key={group.id ?? 'general'}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-lav-600">{group.title}</h3>
            <ul className="divide-y divide-lav-100">
              {group.items.map((q) => (
                <QuestionItem key={q.id} question={q} onUpdate={(changes) => updateQuestion(q.id, changes)} onRemove={() => removeQuestion(q.id)} />
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  )
}
