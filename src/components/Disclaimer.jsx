export default function Disclaimer({ children, className = '' }) {
  return (
    <div className={`flex gap-3 rounded-2xl border border-lav-200 bg-lav-50 px-4 py-3 text-sm text-lav-900 ${className}`}>
      <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-lav-600" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16.5v.5" strokeLinecap="round" />
      </svg>
      <div>
        {children ?? (
          <>
            MedAware is an educational tool. It does not diagnose conditions or recommend medication changes. Always
            talk with your healthcare provider or pharmacist before starting, stopping, or changing a medication.
          </>
        )}
      </div>
    </div>
  )
}
