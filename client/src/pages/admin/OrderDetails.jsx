import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { useAdmin } from '../../context/AdminContext.jsx'
import StatusBadge from '../../components/admin/StatusBadge.jsx'

const TIMELINE = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'completed',
]

export default function OrderDetails() {
  const { id } = useParams()

  const {
    orders = [],
    updateOrderStatus,
  } = useAdmin()

  // ----------------------------------------
  // Find order safely
  // ----------------------------------------
  const order = orders.find(
    (o) => String(o?.id) === String(id)
  )

  // ----------------------------------------
  // Safe currency formatter
  // ----------------------------------------
  const formatCurrency = (value) => {
    const amount = Number(value ?? 0)

    if (Number.isNaN(amount)) {
      return '0'
    }

    return amount.toLocaleString()
  }

  // ----------------------------------------
  // Order not found
  // ----------------------------------------
  if (!order) {
    return (
      <div className="text-center py-20 text-forest/60">
        <p>Order not found.</p>

        <Link
          to="/admin/orders"
          className="inline-block mt-2 text-olive hover:underline"
        >
          Back to Orders
        </Link>
      </div>
    )
  }

  const idx = TIMELINE.indexOf(order.status)

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Back */}
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-forest/55 hover:text-forest"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      {/* Order Information */}
      <div className="rounded-2xl border border-forest/8 bg-cream-soft p-6">

        <div className="flex justify-between items-center flex-wrap gap-2">

          <h1 className="font-display text-2xl">
            {order.id ?? 'N/A'}
          </h1>

          <StatusBadge
            status={order.status ?? 'pending'}
          />

        </div>

        {/* Details */}
        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

          {/* Customer */}
          <div>
            <dt className="text-xs text-forest/45">
              Customer
            </dt>

            <dd>
              {order.customerName ?? 'Unknown Customer'}
            </dd>
          </div>

          {/* Farmer */}
          <div>
            <dt className="text-xs text-forest/45">
              Farmer
            </dt>

            <dd>
              {order.farmerName ?? 'Unknown Farmer'}
            </dd>
          </div>

          {/* Pickup */}
          <div>
            <dt className="text-xs text-forest/45">
              Pickup
            </dt>

            <dd>
              {order.pickupDate ?? 'Not specified'}
              {' · '}
              {order.pickupTime ?? 'Not specified'}
            </dd>
          </div>

          {/* Amount */}
          <div>
            <dt className="text-xs text-forest/45">
              Amount
            </dt>

            <dd className="font-medium">
              Rs. {formatCurrency(order.amount)}
            </dd>
          </div>

        </dl>
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-forest/8 bg-cream-soft p-5">

        <h2 className="font-display text-lg mb-3">
          Items
        </h2>

        {Array.isArray(order.items) && order.items.length > 0 ? (
          <ul className="divide-y divide-forest/6 text-sm">

            {order.items.map((item, index) => {

              const price = Number(item?.price ?? 0)
              const quantity = Number(item?.qty ?? 0)

              const itemTotal =
                Number.isNaN(price) || Number.isNaN(quantity)
                  ? 0
                  : price * quantity

              return (
                <li
                  key={item?.id ?? item?._id ?? index}
                  className="py-3 flex justify-between gap-4"
                >

                  <span>
                    {item?.name ?? 'Unknown Product'}
                    {' × '}
                    {quantity}
                  </span>

                  <span className="font-medium whitespace-nowrap">
                    Rs. {formatCurrency(itemTotal)}
                  </span>

                </li>
              )
            })}

          </ul>
        ) : (
          <p className="text-sm text-forest/50">
            No items found for this order.
          </p>
        )}

      </div>

      {/* Update Status */}
      <div className="rounded-2xl border border-forest/8 bg-cream-soft p-5">

        <h2 className="font-display text-lg mb-3">
          Update status
        </h2>

        <div className="flex flex-wrap gap-2">

          {TIMELINE.map((status, statusIndex) => {

            const isCurrent =
              order.status === status

            const isCompleted =
              idx >= 0 &&
              statusIndex <= idx

            return (
              <button
                key={status}
                type="button"
                onClick={() =>
                  updateOrderStatus(
                    order.id,
                    status
                  )
                }
                className={`
                  rounded-xl px-3 py-2 text-xs capitalize transition-colors
                  ${
                    isCurrent
                      ? 'bg-forest text-cream'
                      : isCompleted
                        ? 'bg-sage/10 text-forest border border-sage/20'
                        : 'border border-forest/15 text-forest hover:bg-forest/5'
                  }
                `}
              >
                {status}
              </button>
            )
          })}

          {/* Cancel */}
          <button
            type="button"
            onClick={() =>
              updateOrderStatus(
                order.id,
                'cancelled'
              )
            }
            className={`
              rounded-xl border px-3 py-2 text-xs
              ${
                order.status === 'cancelled'
                  ? 'bg-red-700 text-white border-red-700'
                  : 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100'
              }
            `}
          >
            cancelled
          </button>

        </div>
      </div>

    </div>
  )
}