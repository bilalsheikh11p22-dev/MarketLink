import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Store, ShoppingBag, Banknote, Sprout, XCircle } from 'lucide-react'
import AnalyticsHeader from '../../components/analytics/AnalyticsHeader.jsx'
import StatCard from '../../components/analytics/StatCard.jsx'
import AnalyticsCard from '../../components/analytics/AnalyticsCard.jsx'
import SalesChart from '../../components/analytics/SalesChart.jsx'
import OrdersChart from '../../components/analytics/OrdersChart.jsx'
import DateRangeSelector from '../../components/analytics/DateRangeSelector.jsx'
import AnalyticsEmptyState from '../../components/analytics/AnalyticsEmptyState.jsx'
import DataState from '../../components/common/DataState.jsx'
import useFetch from '../../hooks/useFetch.js'
import * as svc from '../../services/insightService.js'

export default function AdminAnalytics() {
  const [days, setDays] = useState('30')
  const { data: d, loading, error, reload } = useFetch(() => svc.adminAnalytics(days), [days])
  return (
    <div className="space-y-8">
      <AnalyticsHeader title="Platform analytics" subtitle="Aggregated from live order and user data for the selected range.">
        <div className="flex flex-wrap items-center gap-3">
          <DateRangeSelector value={days} onChange={setDays} />
          <Link to="/admin/reports" className="rounded-xl border border-forest/15 px-3 py-2 text-xs font-medium text-forest hover:bg-forest/5">Exports</Link>
          <Link to="/admin/impact" className="rounded-xl border border-forest/15 px-3 py-2 text-xs font-medium text-forest hover:bg-forest/5">Impact</Link>
        </div>
      </AnalyticsHeader>
      <DataState loading={loading} error={error} onRetry={reload}>
        {d && (
          <>
            <p className="text-xs text-forest/50">{new Date(d.range.from).toLocaleDateString()} – {new Date(d.range.to).toLocaleDateString()}</p>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard icon={ShoppingBag} label="Orders" value={d.totals.orders} />
              <StatCard icon={Banknote} label="Revenue" value={d.totals.revenue} prefix="Rs. " />
              <StatCard icon={Users} label="New customers" value={d.totals.newCustomers} />
              <StatCard icon={Sprout} label="New farmers" value={d.totals.newFarmers} />
              <StatCard icon={XCircle} label="Cancellation rate" value={d.totals.cancellationRate} suffix="%" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsCard title="Revenue per day (Rs.)">{d.trend.length ? <SalesChart data={d.trend.map((t) => ({ label: t.date.slice(5), value: t.revenue }))} ariaLabel="Revenue per day" /> : <AnalyticsEmptyState title="No orders in this range" />}</AnalyticsCard>
              <AnalyticsCard title="Orders per day">{d.trend.length ? <OrdersChart data={d.trend.map((t) => ({ label: t.date.slice(5), value: t.orders }))} ariaLabel="Orders per day" /> : <AnalyticsEmptyState title="No orders in this range" />}</AnalyticsCard>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AnalyticsCard title="Top products (units)">{d.topProducts.length ? <ol className="space-y-2 text-sm">{d.topProducts.map((p) => <li key={p.name} className="flex justify-between"><span>{p.name}</span><span className="tabular-nums">{p.units}</span></li>)}</ol> : <AnalyticsEmptyState title="No sales yet" />}</AnalyticsCard>
              <AnalyticsCard title="Top farmers (revenue)">{d.topFarmers.length ? <ol className="space-y-2 text-sm">{d.topFarmers.map((f) => <li key={String(f.farmerId)} className="flex justify-between"><span>{f.name}</span><span className="tabular-nums">Rs. {f.revenue}</span></li>)}</ol> : <AnalyticsEmptyState title="No farmer sales yet" />}</AnalyticsCard>
              <AnalyticsCard title="Market performance (revenue)"><ol className="space-y-2 text-sm">{d.marketPerformance.map((m) => <li key={String(m.marketId)} className="flex justify-between"><span>{m.name}</span><span className="tabular-nums">Rs. {m.revenue}</span></li>)}</ol></AnalyticsCard>
            </div>
            <AnalyticsCard title="Orders by status">
              <div className="flex flex-wrap gap-3 text-sm">{Object.keys(d.ordersByStatus).length ? Object.entries(d.ordersByStatus).map(([s, n]) => <span key={s} className="rounded-full border border-forest/12 px-3 py-1">{s}: <strong>{n}</strong></span>) : <span className="text-forest/55">No orders in this range.</span>}</div>
            </AnalyticsCard>
          </>
        )}
      </DataState>
    </div>
  )
}
