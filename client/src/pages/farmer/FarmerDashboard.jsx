import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useFarmer } from '../../context/FarmerContext.jsx'
import { getStockStatus } from '../../data/farmerProducts.js'
import FarmerOrderStatus from '../../components/farmer/FarmerOrderStatus.jsx'
import FarmerQuickActions from '../../components/farmer/FarmerQuickActions.jsx'

function SummaryCard({ label, value, sub }) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.25 }} className="border border-forest/10 bg-cream-soft p-6">
      <p className="text-xs tracking-widest2 uppercase text-forest-deep/50 mb-3">{label}</p>
      <p className="font-display text-3xl text-forest-deep">{value}</p>
      {sub && <p className="text-xs text-sage mt-2">{sub}</p>}
    </motion.div>
  )
}

function MiniStat({ label, value, to }) {
  const content = (
    <div className="border border-forest/10 p-5">
      <p className="font-display text-2xl text-forest-deep">{value}</p>
      <p className="text-forest-deep/55 text-xs mt-1">{label}</p>
    </div>
  )
  return to ? (
    <Link to={to} className="hover:border-olive/60 transition-colors block">
      {content}
    </Link>
  ) : (
    content
  )
}

export default function FarmerDashboard() {
  const { getFarmerProfile, getProducts, getOrders, getPickupSlots, getSales } = useFarmer()

  const profile = getFarmerProfile()
  const products = getProducts()
  const orders = getOrders()
  const pickupSlots = getPickupSlots()
  const sales = getSales()

  const activeProducts = useMemo(() => products.filter((p) => p.available).length, [products])
  const pendingOrders = useMemo(() => orders.filter((o) => ['New', 'Accepted', 'Preparing'].includes(o.status)).length, [orders])
  const readyForPickup = useMemo(() => orders.filter((o) => o.status === 'Ready for Pickup').length, [orders])
  const lowStockProducts = useMemo(() => products.filter((p) => getStockStatus(p.stock) === 'Low Stock'), [products])

  const thisMonthSales = useMemo(() => {
    const monthPrefix = sales[sales.length - 1]?.date.slice(0, 7)
    return sales.filter((s) => s.date.startsWith(monthPrefix)).reduce((sum, s) => sum + s.sales, 0)
  }, [sales])

  const today = sales[sales.length - 1]
  const activeSlots = useMemo(() => pickupSlots.filter((s) => s.active).length, [pickupSlots])

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [orders]
  )

  const notifications = useMemo(() => {
    const list = []
    if (lowStockProducts[0]) list.push(`${lowStockProducts[0].name} are low in stock`)
    const newest = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
    if (newest) list.push(`New order received — #${newest.id}`)
    const ready = orders.find((o) => o.status === 'Ready for Pickup')
    if (ready) list.push(`Order ${ready.id} is ready for pickup`)
    list.push('Customer left a 5-star review')
    return list
  }, [orders, lowStockProducts])

  const isFresh = products.length === 0 && orders.length === 0

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-forest-deep">Good morning, {profile.name.split(' ')[0]}</h1>
        <p className="text-forest-deep/60 mt-2">
          {isFresh ? 'Your farm dashboard is ready. Add products to start selling.' : "Here's what's happening with your farm today."}
        </p>
      </div>

      {isFresh && (
        <div className="rounded-2xl border border-dashed border-olive/40 bg-olive/5 p-8 text-center">
          <p className="font-display text-xl text-forest-deep">Welcome to your farm dashboard</p>
          <p className="mt-2 text-sm text-forest/60 max-w-md mx-auto">
            Nothing is listed yet. Add your first product, set inventory, and open pickup slots when you are ready.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/farmer/products/new" className="rounded-xl bg-forest px-5 py-2.5 text-sm text-cream hover:bg-forest-light">
              Add your first product
            </Link>
            <Link to="/farmer/profile" className="rounded-xl border border-forest/15 px-5 py-2.5 text-sm text-forest hover:bg-forest/5">
              Complete profile
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <SummaryCard label="Active Products" value={activeProducts} sub={`${products.length} total`} />
        <SummaryCard label="Pending Orders" value={pendingOrders} />
        <Link to="/farmer/orders" className="block">
          <SummaryCard label="Ready for Pickup" value={readyForPickup} />
        </Link>
        <SummaryCard label="Total Sales (This Month)" value={`Rs. ${thisMonthSales.toLocaleString()}`} />
      </div>

      <div>
        <h2 className="font-display text-xl text-forest-deep mb-4">Today&apos;s Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniStat label="Orders Today" value={today?.orders ?? 0} />
          <MiniStat label="Products Available" value={activeProducts} to="/farmer/products" />
          <MiniStat label="Pickup Slots" value={activeSlots} to="/farmer/pickup-slots" />
          <MiniStat label="Low Stock Items" value={lowStockProducts.length} to="/farmer/inventory" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-forest-deep">Recent Orders</h2>
          <Link to="/farmer/orders" className="text-sm text-forest-deep/60 hover:text-forest-deep transition-colors">
            View all
          </Link>
        </div>

        <div className="hidden md:grid grid-cols-[1fr_1fr_1.6fr_1fr_1fr_1fr_0.6fr] gap-4 px-1 pb-2 text-xs uppercase tracking-wide text-forest-deep/45 border-b border-forest/10">
          <span>Order ID</span>
          <span>Customer</span>
          <span>Products</span>
          <span>Pickup</span>
          <span>Total</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        <div className="flex flex-col">
          {recentOrders.map((order) => (
            <div key={order.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.6fr_1fr_1fr_1fr_0.6fr] gap-2 md:gap-4 md:items-center border-b border-forest/10 py-4 text-sm">
              <span className="text-forest-deep">#{order.id}</span>
              <span className="text-forest-deep/70">{order.customer}</span>
              <span className="text-forest-deep/70 truncate">{order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}</span>
              <span className="text-forest-deep/70">
                {order.pickup.date} · {order.pickup.time}
              </span>
              <span className="text-forest-deep">Rs. {order.total}</span>
              <span>
                <FarmerOrderStatus status={order.status} />
              </span>
              <Link to={`/farmer/orders/${order.id}`} className="text-forest-deep/60 hover:text-forest-deep text-xs">
                View
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl text-forest-deep mb-4">Quick Actions</h2>
        <FarmerQuickActions />
      </div>

      <div>
        <h2 className="font-display text-xl text-forest-deep mb-4">Notifications</h2>
        <div className="flex flex-col gap-2">
          {notifications.map((note, i) => (
            <div key={i} className="border border-forest/10 bg-cream-soft px-4 py-3 text-sm text-forest-deep/75">
              {note}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
