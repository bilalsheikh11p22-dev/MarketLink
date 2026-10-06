export default function PerformanceCard({ rank, name, metric, sub }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest/8 text-xs font-semibold text-forest tabular-nums">{rank}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-forest-deep truncate">{name}</p>
        {sub && <p className="text-xs text-forest/50">{sub}</p>}
      </div>
      <p className="text-sm tabular-nums text-forest/80 shrink-0">{metric}</p>
    </div>
  )
}
