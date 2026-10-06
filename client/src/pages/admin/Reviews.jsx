import { useState } from 'react'
import AnalyticsHeader from '../../components/analytics/AnalyticsHeader.jsx'
import AnalyticsEmptyState from '../../components/analytics/AnalyticsEmptyState.jsx'
import DataState from '../../components/common/DataState.jsx'
import useFetch from '../../hooks/useFetch.js'
import * as svc from '../../services/insightService.js'
import { useToast } from '../../context/ToastContext.jsx'

const FILTERS = [['', 'All'], ['pending', 'Awaiting moderation'], ['published', 'Published'], ['hidden', 'Hidden']]

/** Review moderation + analytics against the real API (also used by /admin/moderation). */
export default function AdminReviews() {
  const { showToast } = useToast()
  const [status, setStatus] = useState('pending')
  const [page, setPage] = useState(1)
  const { data, loading, error, reload } = useFetch(() => svc.adminReviews({ page, limit: 15, ...(status ? { status } : {}) }), [status, page])
  const act = async (id, s) => { try { await svc.adminModerateReview(id, s); showToast(`Review ${s}`); reload() } catch (e) { showToast(e.message) } }
  return (
    <div className="space-y-6">
      <AnalyticsHeader title="Review moderation" subtitle="Spam-flagged reviews are held here until you publish or hide them.">
        <div className="inline-flex flex-wrap gap-1 rounded-xl border border-forest/12 bg-cream-soft p-1" role="group" aria-label="Filter reviews">
          {FILTERS.map(([v, l]) => <button key={v} type="button" onClick={() => { setStatus(v); setPage(1) }} aria-pressed={status === v} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${status === v ? 'bg-forest text-cream' : 'text-forest/60'}`}>{l}</button>)}
        </div>
      </AnalyticsHeader>
      <DataState loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            <div className="flex flex-wrap gap-3 text-xs">{data.analytics.byStatus.map((s) => <span key={s.status} className="rounded-full border border-forest/12 px-3 py-1">{s.status}: <strong>{s.count}</strong> · avg {s.averageRating}★</span>)}</div>
            {data.reviews.length === 0 ? <AnalyticsEmptyState title="Nothing to review" message="No reviews match this filter." /> : (
              <ul className="space-y-3">{data.reviews.map((r) => (
                <li key={r._id} className="rounded-2xl border border-forest/8 bg-cream-soft p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-forest/60">
                    <strong className="text-forest-deep">{r.user?.name || 'User'}</strong><span>on {r.product?.name || r.farmer?.businessName || '—'}</span><span>· {r.rating}★</span>
                    {r.verifiedPurchase && <span className="rounded-full bg-sage/20 px-2 py-0.5 text-sage">Verified purchase</span>}
                    <span className={`rounded-full px-2 py-0.5 ${r.status === 'pending' ? 'bg-olive/20 text-olive' : r.status === 'hidden' ? 'bg-red-50 text-red-800' : 'bg-forest/10'}`}>{r.status}</span>
                  </div>
                  <p className="mt-2 text-sm break-words">{r.comment || <em className="text-forest/40">No comment</em>}</p>
                  {r.spamReasons?.length > 0 && <p className="mt-1 text-xs text-red-800">Flagged: {r.spamReasons.join(', ')}</p>}
                  {r.farmerReply?.text && <p className="mt-2 border-l-2 border-olive pl-3 text-xs text-forest/70">Farmer reply: {r.farmerReply.text}</p>}
                  <div className="mt-3 flex gap-2">
                    {r.status !== 'published' && <button type="button" onClick={() => act(r._id, 'published')} className="rounded-xl bg-forest px-3 py-1.5 text-xs text-cream">Publish</button>}
                    {r.status !== 'hidden' && <button type="button" onClick={() => act(r._id, 'hidden')} className="rounded-xl border border-forest/20 px-3 py-1.5 text-xs">Hide</button>}
                  </div>
                </li>))}</ul>
            )}
            <div className="flex items-center justify-between text-sm"><button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="border border-forest/15 px-4 py-2 disabled:opacity-40">Previous</button><span>Page {data.pagination.page} of {data.pagination.pages}</span><button type="button" disabled={page >= data.pagination.pages} onClick={() => setPage((p) => p + 1)} className="border border-forest/15 px-4 py-2 disabled:opacity-40">Next</button></div>
          </>
        )}
      </DataState>
    </div>
  )
}
