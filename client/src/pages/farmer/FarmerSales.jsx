import { useMemo } from 'react'
import { useFarmer } from '../../context/FarmerContext.jsx'
import SalesChart from '../../components/farmer/SalesChart.jsx'

function SummaryCard({ label, value }) {
  return (
    <div className="border border-forest/10 bg-cream-soft p-6">
      <p className="text-xs tracking-widest2 uppercase text-forest-deep/50 mb-3">{label}</p>
      <p className="font-display text-2xl md:text-3xl text-forest-deep">{value}</p>
    </div>
  )
}

export default function FarmerSales() {
  const { getSales, getOrders, getTopProducts } = useFarmer()
  const topProducts = getTopProducts()
  const sales = getSales()
  const orders = getOrders()

  const today = sales[sales.length - 1]
  const last7 = sales.slice(-7)

  const thisWeekTotal = useMemo(() => last7.reduce((sum, s) => sum + s.sales, 0), [last7])

  const thisMonthTotal = useMemo(() => {
    const monthPrefix = today?.date.slice(0, 7)
    return sales.filter((s) => s.date.startsWith(monthPrefix)).reduce((sum, s) => sum + s.sales, 0)
  }, [sales, today])

  const completedOrders = useMemo(() => orders.filter((o) => o.status === 'Completed').length, [orders])

  return (
    <div>
      <h1 className="font-display text-3xl text-forest-deep mb-8">Sales Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        <SummaryCard label="Today's Sales" value={`Rs. ${today?.sales.toLocaleString() ?? 0}`} />
        <SummaryCard label="This Week" value={`Rs. ${thisWeekTotal.toLocaleString()}`} />
        <SummaryCard label="This Month" value={`Rs. ${thisMonthTotal.toLocaleString()}`} />
        <SummaryCard label="Completed Orders" value={completedOrders} />
      </div>

      <div className="mb-12">
        <h2 className="font-display text-xl text-forest-deep mb-5">Sales Over Time</h2>
        <div className="border border-forest/10 bg-cream-soft p-6">
          <SalesChart data={last7} />
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl text-forest-deep mb-5">Top Products</h2>
        <div className="flex flex-col divide-y divide-forest/10 border-t border-b border-forest/10 max-w-md">
          {topProducts.length === 0 && <p className="py-4 text-sm text-forest-deep/55">No sales in the last 30 days.</p>}
          {topProducts.map((p, i) => (
            <div key={p.name} className="flex items-center justify-between py-4 text-sm">
              <span className="text-forest-deep">
                <span className="text-forest-deep/40 mr-2">{i + 1}.</span>
                {p.name}
              </span>
              <span className="text-forest-deep">Rs. {p.sales.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
