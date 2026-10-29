# MedAware

An educational React app that helps people understand their medications. Built with React + Vite, React Router,
Tailwind CSS, React Context, Recharts, and the public openFDA Drug Label API. There is no backend, no authentication,
and no API key.

> The original project brief is preserved in [`PROJECT_SPEC.md`](PROJECT_SPEC.md).

## Run it

```bash
cd medAware
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Features

| Route | What it does |
| --- | --- |
| `/` | Landing page, feature overview, prompt to start pending checklists |
| `/search` | Search openFDA by brand or generic name; shows purpose, side effects, warnings, duration info |
| `/medication/:fdaId` | Full FDA label view; add the medication to your dashboard |
| `/dashboard` | Add, view, edit, and remove medications; checklist status; reset/clear demo data |
| `/checklist/:medId` | Six-question transparency checklist (Yes / No / I'm Not Sure) and personalized results |
| `/symptoms` | Log symptoms with severity and notes; history and Recharts severity chart |
| `/appointments` | Questions auto-collected from checklists (editable), appointments, printable summary |
| `/timeline` | Start dates, doctor-specified review dates, appointments, and symptom logs |

## Structure

```text
src/
├── components/   Navbar, MedicationCard, MedicationSearch, MedicationChecklist, ChecklistResults,
│                 SymptomTracker, DoctorQuestions, plus small shared pieces (MedicationForm, FdaSection,
│                 Disclaimer, PageHeader)
├── pages/        Home, Search, Dashboard, MedicationDetails, Checklist, Symptoms, Appointments, Timeline
├── context/      MedicationContext.jsx — app state, persisted to localStorage
├── data/         checklist.js — the six checklist questions and suggested provider questions
├── services/     fdaApi.js — openFDA requests and label normalization
└── utils/        dates.js
```

## Data and safety notes

- **FDA information is always fetched live** from `api.fda.gov`. Nothing in the code is presented as FDA data.
- **Demo data is fictional** and labeled "Fictional demo" in the UI. It is stored only in this browser's
  localStorage (`medaware-demo-data-v1`). Don't enter real personal health information.
- When a medication is added by name only, results use the closest openFDA match and say so, with a link to choose
  the exact label.
- MedAware never estimates stop dates, never links symptoms to medications, and never recommends medication changes.
- openFDA allows a limited number of keyless requests per IP per day. If you hit the limit, the app shows a message;
  wait and retry.
