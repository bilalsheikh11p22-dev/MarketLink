import { useState } from 'react'
import AnalyticsHeader from '../../components/analytics/AnalyticsHeader.jsx'
import StatCard from '../../components/analytics/StatCard.jsx'
import AnalyticsCard from '../../components/analytics/AnalyticsCard.jsx'
import DateRangeSelector from '../../components/analytics/DateRangeSelector.jsx'
import AnalyticsEmptyState from '../../components/analytics/AnalyticsEmptyState.jsx'
import DataState from '../../components/common/DataState.jsx'
import useFetch from '../../hooks/useFetch.js'
import * as svc from '../../services/insightService.js'

const LABELS = {
  ordersCompleted: 'Orders picked up', ordersCancelled: 'Orders cancelled', unitsOrdered: 'Units ordered', unitsSoldOnPromotion: 'Units sold on promotion',
  revenueFromPromotions: 'Promotion revenue (Rs.)', promotionShareOfUnits: 'Promotion share of units (%)', productsCurrentlyAtRisk: 'Products at risk now',
  activeFarmersSelling: 'Farmers with sales', customersServed: 'Customers served'
}

export default function AdminImpact() {
  const [days, setDays] = useState('90')
  const { data, loading, error, reload } = useFetch(() => svc.adminImpact(days), [days])
  return (
    <div className="space-y-8">
      <AnalyticsHeader title="Waste reduction &amp; impact" subtitle="Only metrics that can be computed from stored marketplace data.">
        <DateRangeSelector value={days} onChange={setDays} />
      </AnalyticsHeader>
      <DataState loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{Object.entries(data.metrics).map(([k, v]) => <StatCard key={k} label={LABELS[k] || k} value={v} />)}</div>
            <AnalyticsCard title="How these numbers are defined">
              <ul className="space-y-2 text-sm text-forest/70">
                <li><strong>Units sold on promotion:</strong> {data.definitions.unitsSoldOnPromotion}</li>
                <li><strong>Products at risk now:</strong> {data.definitions.productsCurrentlyAtRisk}</li>
                <li className="text-forest-deep">{data.definitions.note}</li>
              </ul>
            </AnalyticsCard>
            <AnalyticsCard title="Stock currently flagged">
              {data.atRisk.length ? (
                <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-forest/50"><th className="py-2 pr-4">Product</th><th className="pr-4">Stock</th><th>Why</th></tr></thead>
                  <tbody>{data.atRisk.map((a) => <tr key={a.productId} className="border-t border-forest/8 align-top"><td className="py-2 pr-4">{a.name}</td><td className="pr-4 tabular-nums">{a.stock} {a.unit}</td><td>{a.reasons.map((r) => r.detail).join(' ')}</td></tr>)}</tbody></table></div>
              ) : <AnalyticsEmptyState title="Nothing flagged" message="No product currently matches the waste-risk rules." />}
            </AnalyticsCard>
          </>
        )}
      </DataState>
    </div>
  )
}
