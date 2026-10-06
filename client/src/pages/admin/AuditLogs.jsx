import { useState } from 'react'
import AnalyticsHeader from '../../components/analytics/AnalyticsHeader.jsx'
import AnalyticsEmptyState from '../../components/analytics/AnalyticsEmptyState.jsx'
import DataState from '../../components/common/DataState.jsx'
import useFetch from '../../hooks/useFetch.js'
import * as svc from '../../services/insightService.js'

export default function AuditLogs() {
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')
  const { data, loading, error, reload } = useFetch(() => svc.adminAuditLogs({ page, limit: 20, ...(action ? { action } : {}) }), [page, action])
  return (
    <div className="space-y-6">
      <AnalyticsHeader title="Audit logs" subtitle="Administrative actions recorded by the server (who, what, when).">
        <div>
          <label htmlFor="audit-filter" className="sr-only">Filter by action</label>
          <select id="audit-filter" value={action} onChange={(e) => { setPage(1); setAction(e.target.value) }} className="border border-forest/15 bg-white px-3 py-2 text-sm">
            <option value="">All actions</option><option value="farmer.">Farmer approvals</option><option value="user.">Users</option><option value="review.">Reviews</option><option value="market.">Markets</option><option value="product.">Products</option><option value="order.">Orders</option><option value="report.">Exports</option><option value="notification.">Broadcasts</option>
          </select>
        </div>
      </AnalyticsHeader>
      <DataState loading={loading} error={error} onRetry={reload}>
        {data && (data.logs.length === 0 ? <AnalyticsEmptyState title="No activity recorded" message="Admin actions such as approving a farmer or moderating a review appear here." /> : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-forest/8 bg-cream-soft">
              <table className="w-full text-sm"><caption className="sr-only">Administrative activity</caption>
                <thead><tr className="text-left text-forest/50"><th scope="col" className="p-3">When</th><th scope="col" className="p-3">Admin</th><th scope="col" className="p-3">Action</th><th scope="col" className="p-3">Target</th><th scope="col" className="p-3">Details</th></tr></thead>
                <tbody>{data.logs.map((l) => (
                  <tr key={l._id} className="border-t border-forest/8 align-top">
                    <td className="p-3 whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td><td className="p-3">{l.actorEmail || '—'}</td><td className="p-3 font-medium">{l.action}</td><td className="p-3">{l.targetType} {l.targetId ? `· ${String(l.targetId).slice(-6)}` : ''}</td>
                    <td className="p-3 text-forest/70 max-w-xs break-words">{l.details ? JSON.stringify(l.details) : ''}</td>
                  </tr>))}</tbody>
              </table>
            </div>
            <div className="flex items-center justify-between text-sm">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="border border-forest/15 px-4 py-2 disabled:opacity-40">Previous</button>
              <span>Page {data.pagination.page} of {data.pagination.pages}</span>
              <button type="button" disabled={page >= data.pagination.pages} onClick={() => setPage((p) => p + 1)} className="border border-forest/15 px-4 py-2 disabled:opacity-40">Next</button>
            </div>
          </>
        ))}
      </DataState>
    </div>
  )
}
