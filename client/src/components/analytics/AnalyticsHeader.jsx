export default function AnalyticsHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl text-forest-deep">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-forest/55 max-w-xl">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
