import { Link } from 'react-router-dom'
import OrderStatusBadge from './OrderStatusBadge.jsx'
import ProductImage from '../image/ProductImage.jsx'

export default function OrderCard({ order }) {
  const dateLabel = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const thumbs = order.items.slice(0, 3)
  return (
    <div className="border border-forest/10 bg-cream-soft p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
      <div className="flex -space-x-3 shrink-0" aria-hidden="true">
        {thumbs.map((i, idx) => <div key={`${i.productId}-${idx}`} className="h-12 w-12 overflow-hidden rounded-full border-2 border-cream-soft bg-cream"><ProductImage src={i.image} alt="" /></div>)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <p className="font-display text-lg text-forest-deep break-all">#{order.orderNumber || order.id}</p>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-forest-deep/55 text-sm">{dateLabel} · {itemCount} item{itemCount === 1 ? '' : 's'} · Rs. {order.total}{order.farmer?.name ? ` · ${order.farmer.name}` : ''}</p>
        <p className="text-forest-deep/50 text-xs mt-1">Pickup {order.pickup.date}{order.pickup.time ? ` · ${order.pickup.time}` : ''}</p>
      </div>
      <Link to={`/orders/${order.id}`} className="shrink-0 px-5 py-2.5 border border-forest/20 text-forest-deep text-sm hover:border-olive/60 transition-colors text-center focus-visible:ring-2 focus-visible:ring-olive">View Order</Link>
    </div>
  )
}
