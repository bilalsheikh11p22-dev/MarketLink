import { useState } from 'react'
import { useFarmer } from '../../context/FarmerContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const inputClass = 'border border-forest/15 bg-white px-3 py-2 text-sm text-forest-deep focus:outline-none focus:border-olive'
const EMPTY = { day: 'Sat', start: '09:00', end: '12:00', capacity: 5 }

/** Weekly pickup schedule. Customers can only book these slots; capacity is enforced by the server. */
export default function FarmerPickupSlots() {
  const { getPickupSlots, savePickupSlots } = useFarmer()
  const { showToast } = useToast()
  const slots = [...getPickupSlots()].sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.start.localeCompare(b.start))
  const [draft, setDraft] = useState(EMPTY)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const persist = async (next, msg) => {
    setBusy(true)
    try { await savePickupSlots(next); showToast(msg); return true } catch (e) { showToast(e.message || 'Could not save slots'); return false } finally { setBusy(false) }
  }
  const add = async (e) => {
    e.preventDefault()
    setError('')
    if (draft.end <= draft.start) { setError('End time must be after start time.'); return }
    const cap = Number(draft.capacity)
    if (!Number.isInteger(cap) || cap < 1 || cap > 200) { setError('Orders per slot must be a whole number from 1 to 200.'); return }
    if (slots.some((s) => s.day === draft.day && s.start === draft.start && s.end === draft.end)) { setError('That slot already exists.'); return }
    if (await persist([...slots, { ...draft, capacity: cap, active: true }], 'Pickup slot added')) setDraft(EMPTY)
  }
  const toggle = (id) => persist(slots.map((s) => (s.id === id ? { ...s, active: !s.active } : s)), 'Pickup slot updated')
  const remove = (id) => persist(slots.filter((s) => s.id !== id), 'Pickup slot removed')

  return (
    <div>
      <h1 className="font-display text-3xl text-forest-deep mb-3">Pickup Slots</h1>
      <p className="mb-8 text-sm text-forest-deep/60 max-w-2xl">Weekly schedule customers choose from at checkout. If you add no slots, customers just pick a date and collect during market hours.</p>

      <form onSubmit={add} className="mb-10 grid grid-cols-2 sm:grid-cols-5 gap-3 items-end border border-forest/10 bg-cream-soft p-5" aria-label="Add a pickup slot">
        <label className="text-xs text-forest-deep/60 grid gap-1">Day<select className={inputClass} value={draft.day} onChange={(e) => setDraft({ ...draft, day: e.target.value })}>{DAYS.map((d) => <option key={d}>{d}</option>)}</select></label>
        <label className="text-xs text-forest-deep/60 grid gap-1">Start<input type="time" className={inputClass} value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} /></label>
        <label className="text-xs text-forest-deep/60 grid gap-1">End<input type="time" className={inputClass} value={draft.end} onChange={(e) => setDraft({ ...draft, end: e.target.value })} /></label>
        <label className="text-xs text-forest-deep/60 grid gap-1">Orders per slot<input type="number" min="1" max="200" className={inputClass} value={draft.capacity} onChange={(e) => setDraft({ ...draft, capacity: e.target.value })} /></label>
        <button type="submit" disabled={busy} className="bg-forest px-4 py-2.5 text-sm text-cream disabled:opacity-50">{busy ? 'Saving…' : 'Add slot'}</button>
        {error && <p role="alert" className="col-span-full text-xs text-red-700">{error}</p>}
      </form>

      {slots.length === 0 ? <p className="text-forest-deep/50 py-12 text-center">No pickup slots yet.</p> : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((s) => (
            <li key={s.id || `${s.day}${s.start}`} className={`border p-4 text-sm ${s.active ? 'border-forest/15 bg-cream-soft' : 'border-forest/10 opacity-60'}`}>
              <p className="font-display text-lg text-forest-deep">{s.day} · {s.start}–{s.end}</p>
              <p className="text-xs text-forest-deep/55 mb-3">Up to {s.capacity} order(s) {s.active ? '' : '· disabled'}</p>
              <div className="flex gap-3 text-xs">
                <button type="button" disabled={busy} onClick={() => toggle(s.id)} className="text-olive hover:underline">{s.active ? 'Disable' : 'Enable'}</button>
                <button type="button" disabled={busy} onClick={() => remove(s.id)} className="text-red-700 hover:underline">Remove</button>
              </div>
            </li>))}
        </ul>
      )}
    </div>
  )
}
