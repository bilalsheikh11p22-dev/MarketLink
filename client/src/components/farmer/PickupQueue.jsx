import { Link } from 'react-router-dom'
import useFetch from '../../hooks/useFetch.js'
import { pickupQueue } from '../../services/insightService.js'
import { useEffect } from 'react'

/** Today's digital pickup queue (active orders in pickup-time order). Refreshes when live notifications arrive. */
export default function PickupQueue() {
  const { data, loading, error, reload } = useFetch(() => pickupQueue(), [])
  useEffect(() => {
    const on = () => reload()
    window.addEventListener('marketlink:notification', on)
    return () => window.removeEventListener('marketlink:notification', on)
  }, [reload])
  return (
    <section aria-labelledby="queue-h" className="mb-10 border border-forest/10 bg-cream-soft p-5">
      <div className="flex items-center justify-between"><h2 id="queue-h" className="font-display text-xl text-forest-deep">Pickup queue{data?.date ? ` · ${data.date}` : ''}</h2><button type="button" onClick={reload} className="text-xs text-olive hover:underline">Refresh</button></div>
      {loading ? <p role="status" className="mt-3 text-sm text-forest-deep/50">Loading…</p> : error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>
        : data.queue.length === 0 ? <p className="mt-3 text-sm text-forest-deep/55">No pickups scheduled for today.</p>
        : <ol className="mt-4 divide-y divide-forest/10">{data.queue.map((q) => (
            <li key={q.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <span className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-deep text-xs text-cream" aria-label={`Position ${q.position}`}>{q.position}</span><span><strong className="text-forest-deep">{q.customer}</strong><span className="block text-xs text-forest-deep/55">{q.pickupTime || 'Any time'} · {q.itemCount} item(s) · Rs. {q.total}</span></span></span>
              <span className="flex items-center gap-3"><span className="text-xs uppercase tracking-wide text-forest-deep/60">{q.status}</span><Link to={`/farmer/orders/${q.id}`} className="text-olive hover:underline">Open</Link></span>
            </li>))}</ol>}
    </section>
  )
}
