import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { WEEKDAYS } from '../../data/markets.js'
import { DEFAULT_FILTERS, countActiveFilters } from '../../utils/marketUtils.js'
import { CloseIcon } from './MarketIcons.jsx'

const DISTANCE_OPTIONS = [
  { label: 'Within 5 KM', value: 5 },
  { label: 'Within 10 KM', value: 10 },
  { label: 'Within 20 KM', value: 20 },
  { label: 'Any Distance', value: 'any' }
]
const OPEN_OPTIONS = [
  { label: 'Open Today', value: 'open' },
  { label: 'Closed Today', value: 'closed' },
  { label: 'All', value: 'all' }
]
const RATING_OPTIONS = [
  { label: '4+', value: 4 },
  { label: '4.5+', value: 4.5 },
  { label: 'All', value: 'all' }
]

function Group({ title, children }) {
  return (
    <fieldset className="py-5 border-b border-forest/10 last:border-b-0">
      <legend className="text-sm font-medium text-forest-deep mb-3 float-left w-full">{title}</legend>
      <div className="flex flex-wrap gap-2 clear-both">{children}</div>
    </fieldset>
  )
}

function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3.5 py-2 text-xs border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive ${
        active ? 'bg-forest-deep text-cream border-forest-deep' : 'border-forest/20 text-forest-deep/70 hover:border-olive/60'
      }`}
    >
      {label}
    </button>
  )
}

/**
 * The four filter groups. Distance / Open status / Rating are single
 * choice; Operating day is multi choice (OR inside the group, AND
 * between groups — see filterMarkets in utils/marketUtils.js).
 */
export default function MarketFilters({ filters, onChange, onClear, hideHeader = false }) {
  const setSingle = (key) => (value) => onChange({ ...filters, [key]: value })
  const toggleDay = (day) =>
    onChange({ ...filters, days: filters.days.includes(day) ? filters.days.filter((d) => d !== day) : [...filters.days, day] })

  const active = countActiveFilters(filters)

  return (
    <div>
      <div className={`flex items-center justify-between pb-1 ${hideHeader ? 'hidden' : ''}`}>
        <h2 className="font-display text-lg text-forest-deep">Filters</h2>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            disabled={active === 0}
            className="text-xs text-forest-deep/60 hover:text-olive disabled:opacity-40 disabled:hover:text-forest-deep/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
          >
            Clear All
          </button>
        )}
      </div>

      <Group title="Distance">
        {DISTANCE_OPTIONS.map((o) => (
          <Chip key={o.label} label={o.label} active={filters.distance === o.value} onClick={() => setSingle('distance')(o.value)} />
        ))}
      </Group>

      <Group title="Operating Day">
        {WEEKDAYS.map((day) => (
          <Chip key={day} label={day} active={filters.days.includes(day)} onClick={() => toggleDay(day)} />
        ))}
      </Group>

      <Group title="Open Status">
        {OPEN_OPTIONS.map((o) => (
          <Chip key={o.label} label={o.label} active={filters.openStatus === o.value} onClick={() => setSingle('openStatus')(o.value)} />
        ))}
      </Group>

      <Group title="Rating">
        {RATING_OPTIONS.map((o) => (
          <Chip key={o.label} label={o.label} active={filters.rating === o.value} onClick={() => setSingle('rating')(o.value)} />
        ))}
      </Group>
    </div>
  )
}

/**
 * Mobile bottom sheet. Works on a draft copy of the filters so the list
 * only changes when "Apply Filters" is pressed; "Clear All" resets the
 * draft. Escape / backdrop closes without applying.
 */
export function MarketFilterSheet({ open, onClose, filters, onApply }) {
  const [draft, setDraft] = useState(filters)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setDraft(filters)
    panelRef.current?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-forest-deep/50"
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Market filters"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            className="absolute bottom-0 inset-x-0 max-h-[85vh] flex flex-col bg-cream outline-none rounded-t-2xl"
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <span className="mx-auto absolute left-1/2 -translate-x-1/2 top-2 h-1 w-10 rounded-full bg-forest/20" aria-hidden="true" />
              <p className="font-display text-xl text-forest-deep">Filters</p>
              <button type="button" onClick={onClose} aria-label="Close filters" className="h-9 w-9 flex items-center justify-center text-forest-deep/60 hover:text-forest-deep">
                <CloseIcon />
              </button>
            </div>

            <div className="overflow-y-auto px-6 pb-4">
              <MarketFilters filters={draft} onChange={setDraft} hideHeader />
            </div>

            <div className="grid grid-cols-2 gap-3 px-6 py-4 border-t border-forest/10 bg-cream-soft">
              <button
                type="button"
                onClick={() => setDraft(DEFAULT_FILTERS)}
                className="py-3 text-sm border border-forest/20 text-forest-deep hover:border-olive/60 transition-colors"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => {
                  onApply(draft)
                  onClose()
                }}
                className="py-3 text-sm bg-forest-deep text-cream hover:bg-forest-light transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
