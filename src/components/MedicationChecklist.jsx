import { useState } from 'react'
import { ANSWERS, CHECKLIST_ITEMS } from '../data/checklist.js'

const answerStyles = {
  yes: 'border-emerald-300 bg-emerald-50 text-emerald-800 ring-emerald-100',
  no: 'border-rose-300 bg-rose-50 text-rose-800 ring-rose-100',
  unsure: 'border-amber-300 bg-amber-50 text-amber-800 ring-amber-100',
}

export default function MedicationChecklist({ medication, initialAnswers = {}, onComplete }) {
  const [answers, setAnswers] = useState(initialAnswers)
  const [step, setStep] = useState(0)

  const item = CHECKLIST_ITEMS[step]
  const isLast = step === CHECKLIST_ITEMS.length - 1
  const answeredCount = CHECKLIST_ITEMS.filter((i) => answers[i.key]).length

  const choose = (value) => {
    const next = { ...answers, [item.key]: value }
    setAnswers(next)
    if (!isLast) setTimeout(() => setStep((s) => s + 1), 220)
  }

  return (
    <div className="card mx-auto max-w-2xl">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-lav-700">Question {step + 1} of {CHECKLIST_ITEMS.length}</span>
          <span className="text-slate-400">{answeredCount} answered</span>
        </div>
        <div className="flex gap-1.5">
          {CHECKLIST_ITEMS.map((i, index) => (
            <button
              key={i.key}
              type="button"
              aria-label={`Go to question ${index + 1}`}
              onClick={() => setStep(index)}
              className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                index === step ? 'bg-lav-600' : answers[i.key] ? 'bg-lav-300' : 'bg-lav-100'
              }`}
            />
          ))}
        </div>
      </div>

      <div key={item.key} className="fade-in">
        <p className="text-sm font-semibold uppercase tracking-wide text-lav-500">{item.topic}</p>
        <h2 className="mt-2 text-2xl font-bold leading-snug text-lav-900">
          {item.question.replace('this medication', medication.name)}
        </h2>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {ANSWERS.map((answer) => {
            const selected = answers[item.key] === answer.value
            return (
              <button
                key={answer.value}
                type="button"
                onClick={() => choose(answer.value)}
                aria-pressed={selected}
                className={`rounded-2xl border-2 px-4 py-4 text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                  selected
                    ? `${answerStyles[answer.value]} ring-4`
                    : 'border-lav-100 bg-white text-slate-700 hover:border-lav-300 hover:bg-lav-50'
                }`}
              >
                {answer.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button type="button" className="btn-ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          ← Back
        </button>
        {isLast ? (
          <button
            type="button"
            className="btn-primary"
            disabled={answeredCount < CHECKLIST_ITEMS.length}
            onClick={() => onComplete(answers)}
          >
            See my results
          </button>
        ) : (
          <button type="button" className="btn-secondary" disabled={!answers[item.key]} onClick={() => setStep((s) => s + 1)}>
            Next →
          </button>
        )}
      </div>
    </div>
  )
}
