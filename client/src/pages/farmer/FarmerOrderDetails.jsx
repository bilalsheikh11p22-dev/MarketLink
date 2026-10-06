import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useFarmer } from '../../context/FarmerContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { ORDER_STATUS_FLOW } from '../../data/farmerOrders.js'
import FarmerOrderStatus from '../../components/farmer/FarmerOrderStatus.jsx'
import ProductImage from '../../components/image/ProductImage.jsx'

const ACTION_LABELS = {
  Accepted: 'Accept Order',
  Cancelled: 'Cancel Order',
  Preparing: 'Start Preparing',
  'Ready for Pickup': 'Mark Ready for Pickup'
}

export default function FarmerOrderDetails() {
  const { id } = useParams()
  const { getOrders, updateOrderStatus, verifyPickup, status: dataStatus } = useFarmer()
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [verr, setVerr] = useState('')
  const { showToast } = useToast()

  const order = getOrders().find((o) => o.id === id)

  if (!order) {
    if (dataStatus.loading) return <p role="status" className="py-16 text-center text-forest-deep/50">Loading order…</p>
    return <Navigate to="/farmer/orders" replace />
  }

  const nextStatuses = ORDER_STATUS_FLOW[order.status] ?? []

  const handleAction = async (nextStatus) => {
    const result = await updateOrderStatus(order.id, nextStatus)
    showToast(result.success ? `Order marked ${nextStatus}` : result.reason || 'Could not update the order')
  }
  const handleVerify = async (e) => {
    e.preventDefault(); setVerr('')
    if (!code.trim()) { setVerr('Paste or type the customer\'s pickup code.'); return }
    setBusy(true)
    try { await verifyPickup(order.id, code.trim()); showToast('Pickup verified — order completed'); setCode('') }
    catch (err) { setVerr(err.message || 'Code did not match.') } finally { setBusy(false) }
  }

  return (
    <div className="max-w-3xl">
      <Link to="/farmer/orders" className="inline-flex items-center gap-2 text-sm text-forest-deep/60 hover:text-forest-deep transition-colors mb-8">
        ← Back to Orders
      </Link>

      <div className="flex flex-wrap items-center gap-4 mb-8">
        <h1 className="font-display text-3xl text-forest-deep break-all">#{order.orderNumber || order.id}</h1>
        <FarmerOrderStatus status={order.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-sm">
        <div className="bg-cream-soft border border-forest/10 p-5">
          <p className="text-forest-deep/50 mb-1">Customer</p>
          <p className="text-forest-deep">{order.customer}</p>
        </div>
        <div className="bg-cream-soft border border-forest/10 p-5">
          <p className="text-forest-deep/50 mb-1">Pickup</p>
          <p className="text-forest-deep">{order.pickup.marketName}</p>
          <p className="text-forest-deep/70">{order.pickup.date} · {order.pickup.time}</p>
        </div>
      </div>

      <h2 className="font-display text-xl text-forest-deep mb-4">Products</h2>
      <div className="flex flex-col divide-y divide-forest/10 border-t border-b border-forest/10 mb-8">
        {order.items.map((item) => (
          <div key={item.productId} className="flex items-center justify-between gap-3 py-4 text-sm">
            <div className="h-12 w-12 shrink-0 overflow-hidden bg-cream-soft"><ProductImage src={item.image} alt="" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-forest-deep">{item.name}</p>
              <p className="text-forest-deep/50 text-xs mt-0.5">
                {item.quantity} {item.unit} × Rs. {item.price}
              </p>
            </div>
            <p className="text-forest-deep">Rs. {item.price * item.quantity}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-sm text-forest-deep/70 mb-1">
        <span>Subtotal</span>
        <span>Rs. {order.subtotal}</span>
      </div>
      <div className="flex justify-between font-display text-lg text-forest-deep pt-2 mt-2 border-t border-forest/10 mb-2">
        <span>Total</span>
        <span>Rs. {order.total}</span>
      </div>
      <p className="text-forest-deep/55 text-sm mb-8">Payment: Pay at Pickup</p>

      {order.apiStatus === 'ready' && (
        <form onSubmit={handleVerify} className="mb-8 border border-olive/40 bg-olive/10 p-5" aria-label="Verify pickup">
          <h2 className="font-display text-lg text-forest-deep mb-1">Verify pickup</h2>
          <p className="text-xs text-forest-deep/60 mb-3">Ask the customer to show their pickup QR code, then paste or type the code text below. The order completes once it matches.</p>
          <div className="flex gap-2"><label htmlFor="pickup-code" className="sr-only">Pickup code</label><input id="pickup-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="ML|…" autoComplete="off" className="flex-1 border border-forest/20 bg-white px-3 py-2 text-sm" /><button type="submit" disabled={busy} className="bg-forest-deep px-5 text-sm text-cream disabled:opacity-60">{busy ? 'Checking…' : 'Verify'}</button></div>
          {verr && <p role="alert" className="mt-2 text-xs text-red-700">{verr}</p>}
        </form>
      )}

      {order.status === 'Ready for Pickup' && (
        <form onSubmit={handleVerify} className="mb-8 border border-forest/10 bg-cream-soft p-5" aria-labelledby="verify-h">
          <h2 id="verify-h" className="font-display text-lg text-forest-deep mb-1">Verify pickup</h2>
          <p className="text-sm text-forest-deep/60 mb-3">Scan the customer&apos;s QR code with any scanner and paste the text here, or type it. Completing the order marks it paid.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <label htmlFor="pickup-code" className="sr-only">Pickup code</label>
            <input id="pickup-code" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" placeholder="ML|orderId|code" className="flex-1 bg-white border border-forest/15 px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-olive" />
            <button type="submit" disabled={busy} className="bg-forest-deep px-6 py-2.5 text-sm text-cream disabled:opacity-60">{busy ? 'Checking…' : 'Verify & complete'}</button>
          </div>
          {verr && <p role="alert" className="mt-2 text-sm text-red-700">{verr}</p>}
        </form>
      )}

      {nextStatuses.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {nextStatuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleAction(status)}
              className={`px-5 py-2.5 text-sm border transition-colors ${
                status === 'Cancelled'
                  ? 'border-red-300 text-red-700 hover:bg-red-50'
                  : 'bg-forest-deep text-cream border-forest-deep hover:bg-forest-light'
              }`}
            >
              {ACTION_LABELS[status]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
