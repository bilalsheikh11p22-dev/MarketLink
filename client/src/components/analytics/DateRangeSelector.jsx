const RANGES = [
  { value: '7', label: '7 Days' },
  { value: '30', label: '30 Days' },
  { value: '90', label: '90 Days' }
]
export default function DateRangeSelector({ value = '30', onChange }) {
  return (
    <div className="inline-flex rounded-xl border border-forest/12 bg-cream-soft p-1" role="group" aria-label="Date range">
      {RANGES.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => onChange?.(r.value)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive ${
            value === r.value ? 'bg-forest text-cream' : 'text-forest/60 hover:text-forest'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}
