import { useState } from 'react'

const PREVIEW_LENGTH = 420

// Displays one field of FDA label text, collapsed by default when long.
export default function FdaSection({ title, text, emptyText = 'Not listed on this FDA label.' }) {
  const [expanded, setExpanded] = useState(false)

  if (!text) {
    return (
      <div className="rounded-2xl bg-slate-50 p-4">
        <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
        <p className="mt-1 text-sm italic text-slate-400">{emptyText}</p>
      </div>
    )
  }

  const isLong = text.length > PREVIEW_LENGTH
  const shown = expanded || !isLong ? text : `${text.slice(0, PREVIEW_LENGTH).trimEnd()}…`

  return (
    <div className="rounded-2xl bg-lav-50/60 p-4">
      <h4 className="text-sm font-semibold text-lav-900">{title}</h4>
      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">{shown}</p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 text-sm font-semibold text-lav-600 transition hover:text-lav-800"
        >
          {expanded ? 'Show less' : 'Read full section'}
        </button>
      )}
    </div>
  )
}
