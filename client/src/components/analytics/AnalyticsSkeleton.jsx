export default function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden>
      <div className="h-8 w-64 rounded-lg bg-forest/10" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-2xl bg-forest/8" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-56 rounded-2xl bg-forest/8" />
        <div className="h-56 rounded-2xl bg-forest/8" />
      </div>
    </div>
  )
}
