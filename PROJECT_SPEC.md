I want to simplify and restructure MedAware into a fully functional, React-first web application.

The entire application should be built primarily using React, JavaScript, JSX, and CSS.

### Important Requirements

1. Use React with Vite.
2. Use JavaScript and JSX, not TypeScript.
3. Use React functional components and hooks.
4. Use React Router for navigation.
5. Use Tailwind CSS for styling.
6. Use React Context for shared application state.
7. Use the openFDA API directly from React to retrieve medication information.
8. Use localStorage to persist fictional demo data.
9. Do not create a separate Express or Node.js backend.
10. Do not implement authentication or Supabase yet.

### Core Features

**1. Medication Search**

Create a React component where users can search for medications.

Retrieve real information from the openFDA Drug Label API.

Display medication names, purposes, side effects, warnings, and available treatment-duration information.

Handle loading states, missing data, and API errors.

**2. Medication Transparency Checklist**

This should be the central feature.

When users select a medication, they should be able to complete an interactive six-question checklist.

Ask whether they understand:
- Why they were prescribed the medication.
- How long they should take it.
- Potential side effects.
- Important safety warnings.
- Follow-up appointments.
- Drug interactions.

Each question should have three answer options: Yes, No, and I'm Not Sure.

After completing the checklist, show a personalized results page.

For questions answered No or I'm Not Sure, display relevant information from the FDA API and suggest questions to ask their healthcare provider.

**3. Medication Dashboard**

Allow users to:
- Add medications.
- View medications.
- Edit medication details.
- Remove medications.
- View checklist completion status.

**4. Symptom Tracker**

Allow users to:
- Log symptoms.
- Record severity.
- Add notes.
- View symptom history.
- Display symptom charts using Recharts.

Do not claim that symptoms were caused by medications.

**5. Doctor Appointment Preparation**

Automatically collect questions generated from the transparency checklist.

Allow users to edit and save questions.

Provide a printable appointment summary.

**6. Medication Timeline**

Display:
- Medication start dates.
- Doctor-specified review dates.
- Follow-up appointments.
- Symptom logs.

Do not invent medication stop dates.

### React Project Structure

Use this structure:

```text
medAware/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── MedicationCard.jsx
│   │   ├── MedicationSearch.jsx
│   │   ├── MedicationChecklist.jsx
│   │   ├── ChecklistResults.jsx
│   │   ├── SymptomTracker.jsx
│   │   └── DoctorQuestions.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Dashboard.jsx
│   │   ├── MedicationDetails.jsx
│   │   ├── Checklist.jsx
│   │   ├── Symptoms.jsx
│   │   └── Appointments.jsx
│   ├── context/
│   │   └── MedicationContext.jsx
│   ├── services/
│   │   └── fdaApi.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

### Critical Setup Instructions

My current project is located at:

`/Users/venyagoyal/c3hackathon/medAware`

Previously, running `npm install` failed because the root directory did not contain a `package.json`.

Before making changes:

1. Inspect the existing project files and directories.
2. Locate any existing React application and its `package.json`.
3. Preserve all existing work.
4. Do not overwrite existing components unnecessarily.
5. If the React application is nested inside another folder, determine whether it should be moved to the project root.
6. If no React project exists, initialize Vite with the React JavaScript template.
7. Ensure `package.json` exists in the application root.
8. Install all required dependencies.
9. Verify that `npm run dev` starts the application successfully.
10. Fix any import errors, dependency errors, or broken routes.

### Design Requirements

Make the app feel like a modern healthcare startup.

Use:
- Lavender and soft purple.
- White backgrounds.
- Rounded cards.
- Modern typography.
- Clean navigation.
- Responsive layouts.
- Interactive buttons.
- Smooth transitions.

### Important

Do not create a static website.

Build a working React application with real state management, API integration, reusable components, and functional navigation.

Do not use hardcoded medication facts as though they came from the FDA. Clearly label fictional demo information.

Do not store real patient health information in localStorage.

Do not expose secret API keys in frontend code.

The app must remain educational and should not recommend medication changes or diagnose medical conditions.

**Start by fixing the React project setup and making sure the application runs successfully before implementing additional features.**