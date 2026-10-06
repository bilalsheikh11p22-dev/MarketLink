import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFarmer } from '../../context/FarmerContext.jsx'
import FarmerOrderCard from '../../components/farmer/FarmerOrderCard.jsx'
import PickupQueue from '../../components/farmer/PickupQueue.jsx'

const TABS = ['All', 'New', 'Accepted', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled']

export default function FarmerOrders() {
  const { getOrders } = useFarmer()
  const orders = getOrders()

  const [tab, setTab] = useState('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders
      .filter((o) => tab === 'All' || o.status === tab)
      .filter((o) => {
        if (!q) return true
        const productMatch = o.items.some((i) => i.name.toLowerCase().includes(q))
        return (o.orderNumber || o.id).toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || productMatch
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [orders, tab, query])

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><h1 className="font-display text-3xl text-forest-deep">Incoming Orders</h1><Link to="/farmer/pickup-queue" className="border border-forest/20 px-4 py-2 text-sm hover:border-olive">Today&apos;s pickup queue</Link></div>

      <PickupQueue />

      <div className="flex items-center gap-1 overflow-x-auto border-b border-forest/10 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`shrink-0 px-4 py-3 text-sm border-b-2 -mb-px transition-colors ${
              tab === t ? 'text-forest-deep border-olive' : 'text-forest-deep/50 border-transparent hover:text-forest-deep/80'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by order ID, customer, or product..."
        aria-label="Search orders"
        className="w-full max-w-md bg-white border border-forest/15 px-4 py-2.5 text-sm text-forest-deep focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/40 transition-colors mb-8"
      />

      <div className="hidden md:grid grid-cols-[1fr_1fr_1.6fr_1.1fr_0.8fr_1fr_1.6fr] gap-4 px-1 pb-2 text-xs uppercase tracking-wide text-forest-deep/45 border-b border-forest/10">
        <span>Order</span>
        <span>Customer</span>
        <span>Products</span>
        <span>Pickup</span>
        <span>Total</span>
        <span>Status</span>
        <span>Actions</span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-forest-deep/50 py-16 text-center">No orders match this filter.</p>
      ) : (
        <div>
          {filtered.map((order) => (
            <FarmerOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
