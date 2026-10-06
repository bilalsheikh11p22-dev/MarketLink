export default function AnalyticsEmptyState({ title = 'No data yet', message = 'Check back when there is more activity.' }) {
  return (
    <div className="rounded-2xl border border-dashed border-forest/15 bg-cream-soft py-16 px-6 text-center">
      <h3 className="font-display text-lg text-forest-deep">{title}</h3>
      <p className="mt-1 text-sm text-forest/55 max-w-sm mx-auto">{message}</p>
    </div>
  )
}
