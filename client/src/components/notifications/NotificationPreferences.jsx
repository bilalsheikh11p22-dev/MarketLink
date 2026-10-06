import { useEffect, useState } from 'react'
import * as svc from '../../services/notificationService.js'
import { useToast } from '../../context/ToastContext.jsx'

const ROWS = [
  ['order', 'Order updates', 'Placed, accepted, ready, cancelled'],
  ['pickup', 'Pickup reminders', 'Reminder on the day of pickup'],
  ['restock', 'Restock alerts', 'Favourite products and farmers back in stock'],
  ['stock', 'Low-stock alerts', 'Farmers: when a product runs low'],
  ['system', 'Announcements', 'Messages from MarketLink'],
  ['email', 'Also send by email', 'Only works if the server has email configured']
]

export default function NotificationPreferences() {
  const { showToast } = useToast()
  const [prefs, setPrefs] = useState(null)
  useEffect(() => { svc.getPreferences().then((r) => setPrefs(r.data.preferences)).catch(() => setPrefs(false)) }, [])
  if (prefs === null) return <p role="status" className="text-sm text-forest-deep/50">Loading preferences…</p>
  if (prefs === false) return null
  const toggle = async (key) => {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    try { await svc.updatePreferences({ [key]: next[key] }) } catch (e) { setPrefs(prefs); showToast(e.message || 'Could not save') }
  }
  return (
    <section aria-labelledby="np-h" className="mt-12 border border-forest/10 bg-cream-soft p-6">
      <h2 id="np-h" className="font-display text-xl text-forest-deep mb-4">Notification preferences</h2>
      <ul className="divide-y divide-forest/10">
        {ROWS.map(([key, label, hint]) => (
          <li key={key} className="flex items-center justify-between gap-4 py-3">
            <div><p className="text-sm text-forest-deep">{label}</p><p className="text-xs text-forest-deep/50">{hint}</p></div>
            <button type="button" role="switch" aria-checked={!!prefs[key]} aria-label={label} onClick={() => toggle(key)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-olive ${prefs[key] ? 'bg-forest-deep' : 'bg-forest/25'}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-cream transition-all ${prefs[key] ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
