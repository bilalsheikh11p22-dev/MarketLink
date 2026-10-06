export default function FilterButton({ onClick, activeCount = 0 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center gap-2 border border-forest/15 bg-white/60 px-5 py-3 text-sm text-forest-deep hover:border-olive/60 transition-colors"
      aria-label="Open filters"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="4" y1="7" x2="20" y2="7" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="11" y1="17" x2="13" y2="17" />
      </svg>
      Filter
      {activeCount > 0 && (
        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-olive text-[11px] text-cream">
          {activeCount}
        </span>
      )}
    </button>
  )
}
