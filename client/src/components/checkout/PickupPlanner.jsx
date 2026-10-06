import { useEffect, useMemo, useState } from 'react'
import { getSlotAvailability } from '../../services/insightService.js'

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
function nextDays(n = 8) {
  return Array.from({ length: n }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return { date: iso(d), day: d.toLocaleDateString('en-US', { weekday: 'short' }), num: d.getDate(), month: d.toLocaleDateString('en-US', { month: 'short' }), today: i === 0 } })
}

/**
 * Pickup choice for ONE farmer: a date, then a real time slot from the farmer's schedule
 * (with remaining capacity from the server). Farmers who have not set fixed slots only need a date.
 */
export default function PickupPlanner({ farmerId, farmerName, marketName, value, onChange }) {
  const days = useMemo(() => nextDays(), [])
  const [availability, setAvailability] = useState({ loading: false, error: '', configured: true, slots: [] })

  useEffect(() => {
    if (!value?.date) return
    let cancelled = false
    setAvailability((a) => ({ ...a, loading: true, error: '' }))
    getSlotAvailability(farmerId, value.date)
      .then((r) => { if (!cancelled) setAvailability({ loading: false, error: '', configured: r.data.configured, slots: r.data.slots }) })
      .catch((e) => { if (!cancelled) setAvailability({ loading: false, error: e.message || 'Could not load pickup times.', configured: true, slots: [] }) })
    return () => { cancelled = true }
  }, [farmerId, value?.date])

  // Farmers without fixed slots: a date alone is enough.
  useEffect(() => {
    if (value?.date && !availability.loading && !availability.error && !availability.configured && value.time !== '') onChange({ date: value.date, time: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availability.configured, availability.loading, value?.date])

  return (
    <fieldset className="border border-forest/10 bg-cream-soft p-5">
      <legend className="px-2 font-display text-lg text-forest-deep">{farmerName}</legend>
      {marketName && <p className="mb-4 text-xs text-forest-deep/55">Pickup at {marketName}</p>}
      <p className="mb-2 text-sm text-forest-deep/70" id={`d-${farmerId}`}>Pickup date</p>
      <div role="group" aria-labelledby={`d-${farmerId}`} className="flex flex-wrap gap-2">
        {days.map((d) => (
          <button key={d.date} type="button" aria-pressed={value?.date === d.date} onClick={() => onChange({ date: d.date, time: null })}
            className={`min-w-[4.25rem] border px-3 py-2 text-center text-xs transition-colors focus-visible:ring-2 focus-visible:ring-olive ${value?.date === d.date ? 'border-forest-deep bg-forest-deep text-cream' : 'border-forest/20 text-forest-deep hover:border-olive'}`}>
            <span className="block uppercase tracking-wide">{d.today ? 'Today' : d.day}</span><span className="block font-display text-lg leading-tight">{d.num}</span><span className="block">{d.month}</span>
          </button>
        ))}
      </div>

      {value?.date && (
        <div className="mt-5" aria-live="polite">
          <p className="mb-2 text-sm text-forest-deep/70">Pickup time</p>
          {availability.loading && <p className="text-sm text-forest-deep/50">Checking availability…</p>}
          {availability.error && <p role="alert" className="text-sm text-red-700">{availability.error}</p>}
          {!availability.loading && !availability.error && !availability.configured && <p className="text-sm text-forest-deep/60">{farmerName} has no fixed pickup slots — collect during market hours on this date.</p>}
          {!availability.loading && !availability.error && availability.configured && availability.slots.length === 0 && <p className="text-sm text-forest-deep/60">No pickup slots on this day. Please choose another date.</p>}
          {!availability.loading && availability.slots.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availability.slots.map((s) => {
                const full = s.remaining <= 0
                return (
                  <button key={s.id} type="button" disabled={full} aria-pressed={value.time === s.time} onClick={() => onChange({ date: value.date, time: s.time })}
                    className={`border px-3 py-2 text-xs focus-visible:ring-2 focus-visible:ring-olive ${full ? 'cursor-not-allowed border-forest/10 text-forest-deep/30 line-through' : value.time === s.time ? 'border-forest-deep bg-forest-deep text-cream' : 'border-forest/20 text-forest-deep hover:border-olive'}`}>
                    {s.time}<span className="block text-[10px] opacity-70">{full ? 'Full' : `${s.remaining} left`}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </fieldset>
  )
}
