import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Banknote, ShoppingBag, Package, TrendingUp } from 'lucide-react'
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

const short = (d) => d.slice(5)

export default function FarmerAnalytics() {
  const [days, setDays] = useState('30')
  const a = useFetch(() => svc.farmerAnalytics(days), [days])
  const f = useFetch(() => svc.farmerForecast(8), [])
  const d = a.data
  return (
    <div className="space-y-8">
      <AnalyticsHeader title="Farm analytics" subtitle="Real figures from your orders. Forecasts are labelled estimates.">
        <DateRangeSelector value={days} onChange={setDays} />
      </AnalyticsHeader>
      <DataState loading={a.loading} error={a.error} onRetry={a.reload}>
        {d && (
          <>
            <p className="text-xs text-forest/50">Range: last {d.range.days} days (from {new Date(d.range.from).toLocaleDateString()})</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Banknote} label="Revenue (excl. cancelled)" value={d.totals.revenue} prefix="Rs. " />
              <StatCard icon={ShoppingBag} label="Orders" value={d.totals.orders} />
              <StatCard icon={TrendingUp} label="Completed" value={d.totals.completed} />
              <StatCard icon={Package} label="Low / out of stock" value={d.inventory.lowStock + d.inventory.outOfStock} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsCard title="Sales per day (Rs.)">
                {d.salesByDay.length ? <SalesChart data={d.salesByDay.map((x) => ({ label: short(x.date), value: x.amount }))} ariaLabel="Sales per day" /> : <AnalyticsEmptyState title="No sales in this range" message="Sales appear here once customers place orders." />}
              </AnalyticsCard>
              <AnalyticsCard title="Units by weekday (all time)">
                {d.weekdayPattern.some((w) => w.units) ? <OrdersChart data={d.weekdayPattern.map((w) => ({ label: w.day, value: w.units }))} ariaLabel="Units by weekday" /> : <AnalyticsEmptyState title="No weekday pattern yet" message="Needs order history." />}
              </AnalyticsCard>
            </div>
            <AnalyticsCard title="Top products by revenue">
              {d.topProducts.length ? (
                <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-forest/50"><th className="py-2 pr-4">Product</th><th className="pr-4">Units</th><th>Revenue</th></tr></thead>
                  <tbody>{d.topProducts.map((p) => <tr key={p.name} className="border-t border-forest/8"><td className="py-2 pr-4">{p.name}</td><td className="pr-4 tabular-nums">{p.units}</td><td className="tabular-nums">Rs. {p.revenue}</td></tr>)}</tbody></table></div>
              ) : <AnalyticsEmptyState title="No product sales yet" />}
            </AnalyticsCard>
          </>
        )}
      </DataState>
      <AnalyticsCard title="Demand forecast (estimate)" action={<Link to="/farmer/waste" className="text-xs text-olive hover:underline">Waste &amp; excess stock →</Link>}>
        <DataState loading={f.loading} error={f.error} onRetry={f.reload}>
          {f.data && (
            <>
              <p className="text-xs text-forest/55 mb-3">{f.data.method} {f.data.disclaimer}</p>
              {!f.data.sufficientData && <p role="status" className="mb-3 rounded-lg bg-olive/10 px-3 py-2 text-sm text-forest-deep">Not enough order history yet for reliable estimates (needs sales in at least 3 different weeks per product). Suggestions are withheld rather than guessed.</p>}
              {f.data.forecasts.length ? (
                <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-forest/50"><th className="py-2 pr-4">Product</th><th className="pr-4">Next week (est.)</th><th className="pr-4">In stock</th><th className="pr-4">Suggested stock</th><th>Confidence</th></tr></thead>
                  <tbody>{f.data.forecasts.map((r) => (
                    <tr key={r.productId} className="border-t border-forest/8"><td className="py-2 pr-4">{r.name}</td><td className="pr-4 tabular-nums">{r.forecastNextWeek} {r.unit}</td><td className="pr-4 tabular-nums">{r.currentStock}</td><td className="pr-4 tabular-nums">{r.suggestedStock ?? '—'}</td>
                      <td>{r.confidence.replace('_', ' ')}{r.accuracy ? ` · last week predicted ${r.accuracy.predicted}, actual ${r.accuracy.actual}` : ''}</td></tr>))}</tbody></table></div>
              ) : <AnalyticsEmptyState title="No order history yet" message="Forecasts need completed order history." />}
            </>
          )}
        </DataState>
      </AnalyticsCard>
    </div>
  )
}
