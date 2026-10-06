import { Link } from 'react-router-dom'
import { Users, Sprout, ClipboardCheck, Store, Package, ShoppingBag, Star } from 'lucide-react'
import StatCard from '../../components/admin/StatCard.jsx'
import StatusBadge from '../../components/admin/StatusBadge.jsx'
import DataState from '../../components/common/DataState.jsx'
import useFetch from '../../hooks/useFetch.js'
import { api } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useFetch(() => api('/admin/dashboard'), [])
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const s = data?.stats || {}
  const recent = data?.recentOrders || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl text-forest-deep">{greeting}, {user?.name?.split(' ')[0] || 'Admin'}</h1>
        <p className="mt-1 text-sm text-forest/55">Live figures from the MarketLink database.</p>
      </div>
      <DataState loading={loading} error={error} onRetry={reload}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Users" value={s.users ?? 0} />
          <StatCard icon={Sprout} label="Approved Farmers" value={s.farmers ?? 0} delay={0.05} />
          <StatCard icon={ClipboardCheck} label="Pending Farmer Approvals" value={s.pendingFarmers ?? 0} delay={0.1} />
          <StatCard icon={Store} label="Active Markets" value={s.markets ?? 0} delay={0.15} />
          <StatCard icon={Package} label="Active Products" value={s.products ?? 0} delay={0.2} />
          <StatCard icon={ShoppingBag} label="Orders" value={s.orders ?? 0} delay={0.25} />
          <StatCard icon={Star} label="Reviews Awaiting Moderation" value={s.pendingReviews ?? 0} delay={0.3} />
        </div>

        <section className="rounded-2xl border border-forest/8 bg-cream-soft p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg">Recent orders</h2>
            <Link to="/admin/orders" className="text-sm text-olive hover:underline">View all</Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-forest/55">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-forest/8">
              {recent.map((o) => (
                <li key={o.id || o._id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <Link to={`/admin/orders/${o.id || o._id}`} className="font-medium text-forest-deep hover:underline">{o.orderNumber}</Link>
                  <span className="text-forest/60">{o.customer?.name || 'Customer'}</span>
                  <span className="tabular-nums">Rs. {Number(o.total || 0).toLocaleString()}</span>
                  <StatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-wrap gap-3 text-sm">
          <Link to="/admin/farmer-approvals" className="rounded-xl bg-forest px-4 py-2 text-cream">Review farmer applications</Link>
          <Link to="/admin/analytics" className="rounded-xl border border-forest/20 px-4 py-2">Analytics</Link>
          <Link to="/admin/impact" className="rounded-xl border border-forest/20 px-4 py-2">Impact</Link>
          <Link to="/admin/audit-logs" className="rounded-xl border border-forest/20 px-4 py-2">Audit logs</Link>
        </div>
      </DataState>
    </div>
  )
}
