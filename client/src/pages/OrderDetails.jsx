import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import OrderStatusBadge from '../components/order/OrderStatusBadge.jsx'
import OrderTimeline from '../components/order/OrderTimeline.jsx'
import PickupQRCode from '../components/order/PickupQRCode.jsx'
import ProductImage from '../components/image/ProductImage.jsx'
import { useOrders } from '../context/OrderContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { CANCELLABLE } from '../utils/orderStatus.js'

export default function OrderDetails() {
  const { orderId } = useParams()
  const { getOrderById, fetchOrder, cancelOrder, orders } = useOrders()
  const { showToast } = useToast()
  const cached = getOrderById(orderId)
  const [state, setState] = useState({ loading: !cached, error: '' })
  const [cancelling, setCancelling] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const order = getOrderById(orderId)

  useEffect(() => {
    let cancelled = false
    fetchOrder(orderId).then(() => !cancelled && setState({ loading: false, error: '' })).catch((e) => !cancelled && setState({ loading: false, error: e.status === 403 || e.status === 404 ? 'This order was not found.' : e.message }))
    return () => { cancelled = true }
  }, [orderId, fetchOrder])
  // refresh when live updates change the order list
  useEffect(() => { document.title = 'Order — MarketLink' }, [])

  const doCancel = async () => {
    setCancelling(true)
    try { await cancelOrder(orderId); showToast('Order cancelled'); setConfirming(false) } catch (e) { showToast(e.message || 'Could not cancel') } finally { setCancelling(false) }
  }

  if (!order) {
    return (<><Navbar /><main className="bg-cream min-h-screen pt-32 pb-24"><div className="container-page text-center">
      {state.loading ? <p role="status" className="text-forest-deep/55">Loading order…</p> : <><p role="alert" className="text-forest-deep/70">{state.error || 'This order was not found.'}</p><Link to="/orders" className="mt-6 inline-block border border-forest/20 px-5 py-2 text-sm">Back to My Orders</Link></>}
    </div></main><Footer /></>)
  }
  void orders
  const dateLabel = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const showQR = ['pending', 'confirmed', 'accepted', 'preparing', 'ready'].includes(order.status)

  return (
    <>
      <Navbar />
      <main className="bg-cream min-h-screen pt-28 pb-24">
        <div className="container-page max-w-4xl mx-auto">
          <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-forest-deep/60 hover:text-forest-deep transition-colors mb-8">← Back to My Orders</Link>
          <div className="flex flex-wrap items-center gap-4 mb-2"><h1 className="font-display text-3xl text-forest-deep break-all">#{order.orderNumber || order.id}</h1><OrderStatusBadge status={order.status} /></div>
          <p className="text-forest-deep/55 text-sm mb-10">Placed {dateLabel}{order.farmer?.name ? ` · ${order.farmer.name}` : ''}</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 flex flex-col gap-10">
              <div>
                <h2 className="font-display text-xl text-forest-deep mb-4">Products</h2>
                <ul className="flex flex-col divide-y divide-forest/10 border-t border-b border-forest/10">
                  {order.items.map((item, i) => (
                    <li key={`${item.productId}-${i}`} className="flex items-center gap-4 py-4 text-sm">
                      <Link to={`/products/${item.productId}`} className="h-14 w-14 shrink-0 overflow-hidden bg-cream-soft"><ProductImage src={item.image} alt={item.name} /></Link>
                      <div className="min-w-0 flex-1"><p className="text-forest-deep">{item.name}</p><p className="text-forest-deep/50 text-xs mt-0.5">{item.quantity} {item.unit} × Rs. {item.price}{item.discountPercent ? ` (${item.discountPercent}% off)` : ''}</p></div>
                      <p className="text-forest-deep whitespace-nowrap">Rs. {item.subtotal ?? item.price * item.quantity}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div><h2 className="font-display text-xl text-forest-deep mb-4">Status</h2><OrderTimeline status={order.status} history={order.statusHistory} /></div>
              {order.notes && <div><h2 className="font-display text-xl text-forest-deep mb-2">Your note</h2><p className="text-sm text-forest-deep/70">{order.notes}</p></div>}
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-cream-soft border border-forest/10 p-6">
                <p className="text-xs tracking-widest2 uppercase text-olive mb-3">Pickup</p>
                <p className="font-display text-lg text-forest-deep mb-1">{order.pickup.marketName}</p>
                <p className="text-forest-deep/70 text-sm">{order.pickup.date}</p><p className="text-forest-deep/70 text-sm">{order.pickup.time}</p>
                {order.farmer?.phone && <p className="text-forest-deep/60 text-xs mt-2">Farmer phone: {order.farmer.phone}</p>}
              </div>
              {showQR && <div className="bg-cream-soft border border-forest/10 p-6"><p className="text-xs tracking-widest2 uppercase text-olive mb-3 text-center">Pickup code</p><PickupQRCode orderId={order.id} orderNumber={order.orderNumber} /></div>}
              <div className="bg-cream-soft border border-forest/10 p-6">
                <p className="text-xs tracking-widest2 uppercase text-olive mb-3">Payment</p>
                <div className="flex justify-between text-sm text-forest-deep/70 mb-1"><span>Subtotal</span><span>Rs. {order.subtotal}</span></div>
                <div className="flex justify-between font-display text-lg text-forest-deep pt-2 mt-2 border-t border-forest/10"><span>Total</span><span>Rs. {order.total}</span></div>
                <p className="text-forest-deep/55 text-xs mt-3">{order.paymentMethod}</p>
              </div>
              {CANCELLABLE.includes(order.status) && (
                confirming ? (
                  <div role="alertdialog" aria-label="Confirm cancellation" className="border border-red-200 bg-red-50 p-4 text-sm">
                    <p className="text-red-900">Cancel this order? The reserved stock is released.</p>
                    <div className="mt-3 flex gap-2"><button type="button" onClick={doCancel} disabled={cancelling} className="bg-red-700 px-4 py-2 text-cream disabled:opacity-60">{cancelling ? 'Cancelling…' : 'Yes, cancel'}</button><button type="button" onClick={() => setConfirming(false)} className="border border-forest/20 px-4 py-2">Keep order</button></div>
                  </div>
                ) : <button type="button" onClick={() => setConfirming(true)} className="border border-red-300 px-5 py-2.5 text-sm text-red-700 hover:bg-red-50">Cancel order</button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
