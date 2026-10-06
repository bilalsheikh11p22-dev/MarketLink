import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useOrders } from '../context/OrderContext.jsx'

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const { getOrderById, fetchOrder, orders } = useOrders()
  const [failed, setFailed] = useState(false)
  const order = getOrderById(orderId)
  useEffect(() => { if (!order) fetchOrder(orderId).catch(() => setFailed(true)) }, [orderId, order, fetchOrder])
  useEffect(() => { document.title = 'Order confirmed — MarketLink' }, [])

  if (!order) {
    return (<><Navbar /><main className="bg-cream min-h-screen pt-32 pb-24 text-center">{failed ? <><p role="alert">We couldn&apos;t find that order.</p><Link to="/orders" className="mt-6 inline-block border border-forest/20 px-5 py-2 text-sm">My Orders</Link></> : <p role="status">Loading…</p>}</main><Footer /></>)
  }
  // All orders created by the same checkout (one per farmer)
  const siblings = order.checkoutGroup ? orders.filter((o) => o.checkoutGroup === order.checkoutGroup) : [order]
  const total = siblings.reduce((s, o) => s + o.total, 0)

  return (
    <>
      <Navbar />
      <main className="bg-cream min-h-screen pt-28 pb-24">
        <div className="container-page max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="mx-auto mb-6 h-16 w-16 rounded-full bg-forest-deep flex items-center justify-center text-cream text-2xl" aria-hidden="true">✓</motion.div>
          <h1 className="font-display text-3xl md:text-4xl text-forest-deep mb-2">Your Pre-Order Is Placed</h1>
          <p className="text-forest-deep/55 mb-2">{siblings.length > 1 ? `${siblings.length} orders — one per farmer` : `Order #${order.orderNumber || order.id}`}</p>
          <p className="text-forest-deep/55 mb-10 text-sm">Waiting for the farmer to accept. You&apos;ll be notified of every status change.</p>

          <ul className="grid grid-cols-1 gap-4 text-left mb-8">
            {siblings.map((o) => (
              <li key={o.id} className="bg-cream-soft border border-forest/10 p-5 flex flex-wrap items-center justify-between gap-4">
                <div><p className="font-display text-lg text-forest-deep">{o.farmer?.name || 'Farmer'}</p><p className="text-sm text-forest-deep/65">{o.pickup.date} · {o.pickup.time}</p><p className="text-xs text-forest-deep/50 break-all">#{o.orderNumber}</p></div>
                <div className="text-right"><p className="font-display text-xl text-forest-deep">Rs. {o.total}</p><Link to={`/orders/${o.id}`} className="text-sm text-olive hover:underline">Pickup code &amp; details</Link></div>
              </li>
            ))}
          </ul>
          <p className="mb-10 text-sm text-forest-deep/70">Total Rs. {total} · pay the farmer on pickup.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/orders" className="px-7 py-3.5 bg-forest-deep text-cream text-sm hover:bg-forest-light transition-colors w-full sm:w-auto text-center">View My Orders</Link>
            <Link to="/products" className="px-7 py-3.5 border border-forest/20 text-forest-deep text-sm hover:border-olive/60 transition-colors w-full sm:w-auto text-center">Continue Shopping</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
