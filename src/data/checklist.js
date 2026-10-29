// The six transparency questions. `fdaFields` names the normalized label fields
// (see services/fdaApi.js) shown when the user is unsure about a topic.
export const CHECKLIST_ITEMS = [
  {
    key: 'why',
    topic: 'Why it was prescribed',
    question: 'Do you understand why you were prescribed this medication?',
    fdaFields: [{ field: 'purpose', label: 'Purpose / indications (FDA label)' }],
    providerQuestions: [
      'What condition or symptom is this medication meant to treat for me?',
      'How will we know whether it is working?',
    ],
  },
  {
    key: 'duration',
    topic: 'How long to take it',
    question: 'Do you know how long you should take this medication?',
    fdaFields: [
      { field: 'durationInfo', label: 'Timing mentioned on the FDA label' },
      { field: 'dosage', label: 'Dosage and administration (FDA label)' },
    ],
    providerQuestions: [
      'How long do you expect me to take this medication?',
      'When should we review whether I still need it?',
      'Is it safe to stop on my own, or should we plan that together?',
    ],
  },
  {
    key: 'sideEffects',
    topic: 'Potential side effects',
    question: 'Do you understand the potential side effects?',
    fdaFields: [{ field: 'sideEffects', label: 'Adverse reactions (FDA label)' }],
    providerQuestions: [
      'Which side effects are most common, and which should I report right away?',
      'What should I do if I notice a side effect?',
    ],
  },
  {
    key: 'warnings',
    topic: 'Important safety warnings',
    question: 'Are you aware of the important safety warnings?',
    fdaFields: [
      { field: 'warnings', label: 'Warnings (FDA label)' },
      { field: 'whenToAskDoctor', label: 'When to stop use / ask a doctor (FDA label)' },
    ],
    providerQuestions: [
      'Are there warnings on this label that apply to me specifically?',
      'Are there activities, foods, or drinks I should avoid?',
    ],
  },
  {
    key: 'followUp',
    topic: 'Follow-up appointments',
    question: 'Do you know when your follow-up appointments are?',
    fdaFields: [],
    providerQuestions: [
      'When should my next follow-up appointment be?',
      'Do I need any tests or monitoring while taking this?',
    ],
  },
  {
    key: 'interactions',
    topic: 'Drug interactions',
    question: 'Do you understand possible drug interactions?',
    fdaFields: [{ field: 'interactions', label: 'Drug interactions / do not use (FDA label)' }],
    providerQuestions: [
      'Could this interact with my other medications, vitamins, or supplements?',
      'Should my pharmacist review everything I take together?',
    ],
  },
]

export const ANSWERS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: "I'm Not Sure" },
]

export const needsAttention = (answer) => answer === 'no' || answer === 'unsure'
