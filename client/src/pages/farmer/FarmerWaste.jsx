import { useState } from 'react'
import { Link } from 'react-router-dom'
import AnalyticsHeader from '../../components/analytics/AnalyticsHeader.jsx'
import AnalyticsCard from '../../components/analytics/AnalyticsCard.jsx'
import StatCard from '../../components/analytics/StatCard.jsx'
import AnalyticsEmptyState from '../../components/analytics/AnalyticsEmptyState.jsx'
import DataState from '../../components/common/DataState.jsx'
import ProductImage from '../../components/image/ProductImage.jsx'
import useFetch from '../../hooks/useFetch.js'
import * as productService from '../../services/productService.js'
import * as svc from '../../services/insightService.js'
import { useToast } from '../../context/ToastContext.jsx'

const LABEL = { excess: 'Excess stock', low_demand: 'Low demand', no_sales: 'No recent sales', closing_soon: 'Market closing soon' }

export default function FarmerWaste() {
  const { data, loading, error, reload } = useFetch(() => svc.farmerWaste(), [])
  const { showToast } = useToast()
  const [busy, setBusy] = useState('')
  const apply = async (a, pct) => {
    setBusy(a.productId)
    try { await productService.updateProduct(a.productId, { discountPercent: pct }); showToast(pct ? `${pct}% discount applied to ${a.name}` : `Discount removed from ${a.name}`); reload() }
    catch (e) { showToast(e.message || 'Could not update discount') } finally { setBusy('') }
  }
  return (
    <div className="space-y-8">
      <AnalyticsHeader title="Food waste &amp; excess stock" subtitle="Products at risk of going unsold, based on explicit rules. You decide whether to discount." />
      <DataState loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Products flagged now" value={data.analytics.alertCount} />
              <StatCard label="Units sold on promotion" value={data.analytics.unitsSoldOnPromotion} />
              <StatCard label="Revenue from promotions" value={data.analytics.revenueFromPromotions} prefix="Rs. " />
            </div>
            <p className="text-xs text-forest/55">{data.analytics.definition} {data.rules}</p>
            {data.alerts.length === 0 ? (
              <AnalyticsEmptyState title="Nothing at risk right now" message="Alerts appear when stock is high compared with estimated demand, products have not sold, or a market is about to close with stock left." />
            ) : (
              <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {data.alerts.map((a) => (
                  <li key={a.productId} className="rounded-2xl border border-forest/8 bg-cream-soft p-4 flex gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden"><ProductImage product={a} alt={a.name} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-base text-forest-deep">{a.name} <span className="text-xs text-forest/50">· {a.stock} {a.unit} left{a.discountPercent ? ` · ${a.discountPercent}% off now` : ''}</span></p>
                      <ul className="mt-1 space-y-0.5 text-xs text-forest/70">{a.reasons.map((r) => <li key={r.type}><strong>{LABEL[r.type]}:</strong> {r.detail}</li>)}</ul>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" disabled={busy === a.productId || a.discountPercent === a.suggestedDiscount} onClick={() => apply(a, a.suggestedDiscount)} className="rounded-xl bg-forest px-3 py-1.5 text-xs text-cream disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-olive">Apply suggested {a.suggestedDiscount}% off</button>
                        {a.discountPercent > 0 && <button type="button" disabled={busy === a.productId} onClick={() => apply(a, 0)} className="rounded-xl border border-forest/20 px-3 py-1.5 text-xs">Remove discount</button>}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <AnalyticsCard title="Related"><div className="flex gap-3 text-sm"><Link className="text-olive hover:underline" to="/farmer/inventory">Inventory</Link><Link className="text-olive hover:underline" to="/farmer/analytics">Forecast &amp; analytics</Link><Link className="text-olive hover:underline" to="/farmer/assistant">Ask the assistant</Link></div></AnalyticsCard>
          </>
        )}
      </DataState>
    </div>
  )
}
