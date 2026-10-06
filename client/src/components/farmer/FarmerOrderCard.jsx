import { Link } from 'react-router-dom'
import FarmerOrderStatus from './FarmerOrderStatus.jsx'
import { useFarmer } from '../../context/FarmerContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { ORDER_STATUS_FLOW } from '../../data/farmerOrders.js'

const ACTION_LABELS = {
  Accepted: 'Accept Order',
  Preparing: 'Start Preparing',
  Cancelled: 'Cancel Order',
  'Ready for Pickup': 'Mark Ready for Pickup'
}

/**
 * One order row. Uses a CSS grid that's multi-column on desktop
 * (acting as a table row) and collapses to a single, labeled column
 * on mobile (acting as a card) — one markup, two responsive shapes.
 */
export default function FarmerOrderCard({ order }) {
  const { updateOrderStatus } = useFarmer()
  const { showToast } = useToast()

  const nextStatuses = ORDER_STATUS_FLOW[order.status] ?? []
  const productSummary = order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')

  const handleAction = async (nextStatus) => {
    const result = await updateOrderStatus(order.id, nextStatus)
    showToast(result.success ? `Order marked ${nextStatus}` : result.reason || 'Could not update the order')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.6fr_1.1fr_0.8fr_1fr_1.6fr] gap-2 md:gap-4 md:items-center border-b border-forest/10 py-4 text-sm">
      <div>
        <span className="md:hidden text-forest-deep/40 text-xs mr-1">Order:</span>
        <Link to={`/farmer/orders/${order.id}`} className="text-forest-deep hover:text-olive transition-colors">
          #{order.orderNumber || order.id}
        </Link>
      </div>
      <div className="text-forest-deep/70">
        <span className="md:hidden text-forest-deep/40 text-xs mr-1">Customer:</span>
        {order.customer}
      </div>
      <div className="text-forest-deep/70 truncate" title={productSummary}>
        <span className="md:hidden text-forest-deep/40 text-xs block">Products:</span>
        {productSummary}
      </div>
      <div className="text-forest-deep/70">
        <span className="md:hidden text-forest-deep/40 text-xs mr-1">Pickup:</span>
        {order.pickup.date} · {order.pickup.time}
      </div>
      <div className="text-forest-deep">
        <span className="md:hidden text-forest-deep/40 text-xs mr-1">Total:</span>
        Rs. {order.total}
      </div>
      <div>
        <FarmerOrderStatus status={order.status} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {nextStatuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => handleAction(status)}
            className={`px-3 py-1.5 text-xs border transition-colors ${
              status === 'Cancelled'
                ? 'border-red-300 text-red-700 hover:bg-red-50'
                : 'border-forest/20 text-forest-deep hover:border-olive/60'
            }`}
          >
            {ACTION_LABELS[status]}
          </button>
        ))}
        <Link to={`/farmer/orders/${order.id}`} className="text-forest-deep/50 text-xs hover:text-forest-deep transition-colors">
          View
        </Link>
      </div>
    </div>
  )
}
