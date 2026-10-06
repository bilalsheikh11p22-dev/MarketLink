import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export const CATEGORY_OPTIONS = ['Vegetables', 'Fruits', 'Herbs', 'Dairy', 'Grains']
export const PRICE_OPTIONS = [
  { label: 'Under Rs. 200', value: 'under-200' },
  { label: 'Rs. 200–500', value: '200-500' },
  { label: 'Rs. 500+', value: 'over-500' }
]
export const AVAILABILITY_OPTIONS = [
  { label: 'Available', value: 'available' },
  { label: 'Sold Out', value: 'sold-out' }
]
export const RATING_OPTIONS = [
  { label: '4+', value: 4 },
  { label: '4.5+', value: 4.5 }
]
export const DISTANCE_OPTIONS = [
  { label: 'Within 5 KM', value: 5 },
  { label: 'Within 10 KM', value: 10 },
  { label: 'Within 20 KM', value: 20 }
]

function FilterGroup({ title, children }) {
  return (
    <div className="py-5 border-b border-forest/10">
      <h4 className="text-sm font-medium text-forest-deep mb-3">{title}</h4>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3.5 py-2 text-xs border transition-colors ${
        active
          ? 'bg-forest-deep text-cream border-forest-deep'
          : 'border-forest/20 text-forest-deep/70 hover:border-olive/60'
      }`}
    >
      {label}
    </button>
  )
}

/**
 * Frontend-only filter panel. Slides in from the right on desktop and
 * rises as a bottom sheet on mobile (compound translate classes so a
 * single element handles both, no separate mobile component needed).
 */
export default function FilterDrawer({ open, onClose, filters, onToggle, onClear }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const activeCount =
    filters.category.length + filters.price.length + filters.availability.length + filters.rating.length + filters.distance.length

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-forest-deep/40 backdrop-blur-[2px] z-40"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className={`fixed z-50 bg-cream-soft shadow-xl transition-transform duration-300 ease-in-out
          inset-x-0 bottom-0 rounded-t-2xl max-h-[85vh]
          sm:inset-x-auto sm:right-0 sm:top-0 sm:bottom-0 sm:h-full sm:w-96 sm:max-h-none sm:rounded-none
          ${open ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-y-0 sm:translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-forest/10">
          <h3 className="font-display text-xl text-forest-deep">Filters</h3>
          <button onClick={onClose} aria-label="Close filters" className="text-forest-deep/60 hover:text-forest-deep">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 overflow-y-auto max-h-[calc(85vh-140px)] sm:max-h-[calc(100vh-140px)]">
          <FilterGroup title="Category">
            {CATEGORY_OPTIONS.map((c) => (
              <Chip key={c} label={c} active={filters.category.includes(c)} onClick={() => onToggle('category', c)} />
            ))}
          </FilterGroup>
          <FilterGroup title="Price">
            {PRICE_OPTIONS.map((p) => (
              <Chip key={p.value} label={p.label} active={filters.price.includes(p.value)} onClick={() => onToggle('price', p.value)} />
            ))}
          </FilterGroup>
          <FilterGroup title="Availability">
            {AVAILABILITY_OPTIONS.map((a) => (
              <Chip key={a.value} label={a.label} active={filters.availability.includes(a.value)} onClick={() => onToggle('availability', a.value)} />
            ))}
          </FilterGroup>
          <FilterGroup title="Rating">
            {RATING_OPTIONS.map((r) => (
              <Chip key={r.value} label={r.label} active={filters.rating.includes(r.value)} onClick={() => onToggle('rating', r.value)} />
            ))}
          </FilterGroup>
          <FilterGroup title="Distance">
            {DISTANCE_OPTIONS.map((d) => (
              <Chip key={d.value} label={d.label} active={filters.distance.includes(d.value)} onClick={() => onToggle('distance', d.value)} />
            ))}
          </FilterGroup>
        </div>

        <div className="flex items-center gap-3 px-6 py-5 border-t border-forest/10">
          <button onClick={onClear} className="flex-1 py-3 text-sm border border-forest/20 text-forest-deep/70 hover:border-olive/60 transition-colors">
            Clear ({activeCount})
          </button>
          <button onClick={onClose} className="flex-1 py-3 text-sm bg-forest-deep text-cream hover:bg-forest-light transition-colors">
            Show Results
          </button>
        </div>
      </div>
    </>
  )
}
