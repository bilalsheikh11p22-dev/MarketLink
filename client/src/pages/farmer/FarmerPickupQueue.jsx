import { useState } from 'react'
import { Link } from 'react-router-dom'
import AnalyticsHeader from '../../components/analytics/AnalyticsHeader.jsx'
import AnalyticsEmptyState from '../../components/analytics/AnalyticsEmptyState.jsx'
import DataState from '../../components/common/DataState.jsx'
import FarmerOrderStatus from '../../components/farmer/FarmerOrderStatus.jsx'
import useFetch from '../../hooks/useFetch.js'
import * as svc from '../../services/insightService.js'
import { API_TO_LABEL } from '../../data/farmerOrders.js'

const today = () => new Date().toISOString().slice(0, 10)

/** Digital pickup queue: the farmer's active orders for a date, in pickup-time order. */
export default function FarmerPickupQueue() {
  const [date, setDate] = useState(today())
  const { data, loading, error, reload } = useFetch(() => svc.pickupQueue(date), [date])
  return (
    <div className="space-y-6">
      <AnalyticsHeader title="Pickup queue" subtitle="Active orders for the selected date, ordered by pickup time.">
        <div className="flex items-end gap-2">
          <label className="text-sm text-forest/70">Date<input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="ml-2 border border-forest/15 bg-white px-3 py-2 text-sm" /></label>
          <button type="button" onClick={reload} className="border border-forest/20 px-4 py-2 text-sm">Refresh</button>
        </div>
      </AnalyticsHeader>
      <DataState loading={loading} error={error} onRetry={reload}>
        {data && (data.queue.length === 0 ? <AnalyticsEmptyState title="Nobody queued for this date" message="Orders appear here once customers book a pickup for the date." /> : (
          <ol className="space-y-3">
            {data.queue.map((q) => (
              <li key={q.id} className="flex flex-wrap items-center gap-4 border border-forest/10 bg-cream-soft p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-deep text-cream text-sm" aria-label={`Position ${q.position}`}>{q.position}</span>
                <div className="min-w-0 flex-1"><p className="font-display text-base text-forest-deep">{q.customer || 'Customer'} <span className="text-xs text-forest/50">· {q.itemCount} item(s) · Rs. {q.total}</span></p><p className="text-xs text-forest/60">{q.pickupTime || 'Any time'} · #{q.orderNumber}</p></div>
                <FarmerOrderStatus status={API_TO_LABEL[q.status] || q.status} />
                <Link to={`/farmer/orders/${q.id}`} className="border border-forest/20 px-4 py-2 text-xs hover:border-olive">{q.status === 'ready' ? 'Verify pickup' : 'Open'}</Link>
              </li>
            ))}
          </ol>
        ))}
      </DataState>
    </div>
  )
}
