export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:hidden">
      <div>
        {eyebrow && <p className="text-sm font-semibold uppercase tracking-wider text-lav-500">{eyebrow}</p>}
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-lav-900 sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
