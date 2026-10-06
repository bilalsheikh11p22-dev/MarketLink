import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Users, Package, ShoppingBag, Wallet } from 'lucide-react'
import AnalyticsHeader from '../../components/analytics/AnalyticsHeader.jsx'
import DateRangeSelector from '../../components/analytics/DateRangeSelector.jsx'
import StatCard from '../../components/analytics/StatCard.jsx'
import AnalyticsCard from '../../components/analytics/AnalyticsCard.jsx'
import OrdersChart from '../../components/analytics/OrdersChart.jsx'
import PerformanceCard from '../../components/analytics/PerformanceCard.jsx'
import DataState from '../../components/common/DataState.jsx'
import useFetch from '../../hooks/useFetch.js'
import { api } from '../../services/api.js'

export default function MarketAnalytics() {
  const { id } = useParams()
  const [range, setRange] = useState('30')
  const { data, loading, error, reload } = useFetch(() => api(`/markets/${id}/analytics?days=${range}`), [id, range])

  return (
    <div className="min-h-screen bg-cream">
      <div className="container-page py-10 md:py-14 space-y-8">
        <AnalyticsHeader title={`${data?.market?.name || 'Market'} analytics`} subtitle="Real activity and an estimated demand outlook for this market.">
          <div className="flex flex-col items-stretch sm:items-end gap-2">
            <DateRangeSelector value={range} onChange={setRange} />
            <div className="flex flex-wrap gap-2 justify-end">
              <Link to={`/markets/${id}`} className="text-xs font-medium text-olive hover:underline">Market details</Link>
              <Link to={`/markets/${id}/farmers`} className="text-xs font-medium text-olive hover:underline">Farmers</Link>
              <Link to={`/markets/${id}/products`} className="text-xs font-medium text-olive hover:underline">Products</Link>
            </div>
          </div>
        </AnalyticsHeader>

        <DataState loading={loading} error={error} onRetry={reload}>
          {data && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Active farmers" value={data.stats.activeFarmers} />
                <StatCard icon={Package} label="Listed products" value={data.stats.products} delay={0.05} />
                <StatCard icon={ShoppingBag} label="Orders in period" value={data.stats.orders} delay={0.1} />
                <StatCard icon={Wallet} label="Sales (Rs.)" value={data.stats.revenue} delay={0.15} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalyticsCard title="Sales by day (Rs.)">
                  {data.salesByDay.length ? <OrdersChart data={data.salesByDay.slice(-14).map((d) => ({ label: d.date.slice(5), value: d.amount }))} ariaLabel="Sales by day" /> : <p className="py-8 text-center text-sm text-forest/55">No orders in this period yet.</p>}
                </AnalyticsCard>
                <AnalyticsCard title="Most ordered products">
                  {data.topProducts.length ? data.topProducts.map((p, i) => <PerformanceCard key={p.name} rank={i + 1} name={p.name} metric={`${p.units} units`} />) : <p className="py-8 text-center text-sm text-forest/55">No orders in this period yet.</p>}
                </AnalyticsCard>
              </div>

              <AnalyticsCard title="Demand outlook (estimate)">
                {data.forecast.length ? (
                  <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-forest/50"><th className="py-2 pr-4">Product</th><th className="pr-4">Next week (est.)</th><th className="pr-4">In stock</th><th>Confidence</th></tr></thead>
                    <tbody>{data.forecast.map((r) => (<tr key={r.productId} className="border-t border-forest/8"><td className="py-2 pr-4">{r.name}</td><td className="pr-4 tabular-nums">{r.forecastNextWeek} {r.unit}</td><td className="pr-4 tabular-nums">{r.currentStock}</td><td>{String(r.confidence).replace('_', ' ')}</td></tr>))}</tbody></table></div>
                ) : <p className="py-6 text-center text-sm text-forest/55">Not enough order history to estimate demand yet.</p>}
                {data.forecastNote && <p className="mt-3 text-xs text-forest/55">{data.forecastNote}</p>}
              </AnalyticsCard>
            </>
          )}
        </DataState>
      </div>
    </div>
  )
}
