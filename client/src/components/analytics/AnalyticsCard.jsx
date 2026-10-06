export default function AnalyticsCard({ title, children, className = '', action }) {
  return (
    <section className={`rounded-2xl border border-forest/8 bg-cream-soft p-5 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-lg text-forest-deep">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
