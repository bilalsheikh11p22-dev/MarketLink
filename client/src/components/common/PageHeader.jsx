export default function PageHeader({ title, subtitle, actions, breadcrumbs }) {
  return (
    <header className="mb-6 sm:mb-8">
      {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl text-forest-deep tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-forest/55 max-w-2xl">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  )
}
