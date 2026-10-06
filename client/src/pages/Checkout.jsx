import { useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import PickupPlanner from '../components/checkout/PickupPlanner.jsx'
import CheckoutSummary from '../components/checkout/CheckoutSummary.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useOrders } from '../context/OrderContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

const MONGO_ID = /^[a-f\d]{24}$/i

export default function Checkout() {
  const { cartItems, cartSubtotal, clearCart } = useCart()
  const { createOrder } = useOrders()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [pickups, setPickups] = useState({})   // { [farmerId]: { date, time } } ; time null = slot not chosen yet
  const [notes, setNotes] = useState('')
  const [placing, setPlacing] = useState(false)
  const [errors, setErrors] = useState([])
  const attemptKey = useRef(`co-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`) // one key per checkout visit: retries never double-order

  const groups = useMemo(() => {
    const m = new Map()
    for (const i of cartItems) { if (!m.has(i.farmerId)) m.set(i.farmerId, { farmerId: i.farmerId, farmerName: i.farmerName, marketName: i.marketName, items: [] }); m.get(i.farmerId).items.push(i) }
    return [...m.values()]
  }, [cartItems])

  if (cartItems.length === 0) return <Navigate to="/cart" replace />

  const setFor = (farmerId) => (v) => setPickups((p) => ({ ...p, [farmerId]: v }))
  const outdated = cartItems.filter((i) => !MONGO_ID.test(String(i.productId)))

  const handlePlaceOrder = async () => {
    const problems = []
    if (outdated.length) problems.push('Some cart items are from an older version of MarketLink. Remove them and add the products again.')
    if (cartItems.some((i) => !i.available)) problems.push('Remove unavailable items before placing your pre-order.')
    for (const g of groups) {
      const p = pickups[g.farmerId]
      if (!p?.date) problems.push(`Choose a pickup date for ${g.farmerName}.`)
      else if (p.time === null) problems.push(`Choose a pickup time for ${g.farmerName}.`)
    }
    if (problems.length) { setErrors(problems); return }

    setPlacing(true); setErrors([])
    try {
      const created = await createOrder({
        items: cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        pickups: Object.fromEntries(groups.map((g) => [g.farmerId, { date: pickups[g.farmerId].date, time: pickups[g.farmerId].time }])),
        pickupLocation: groups.length === 1 ? groups[0].marketName || '' : '',
        notes: notes.trim(), idempotencyKey: attemptKey.current
      })
      clearCart()
      showToast(created.length > 1 ? `${created.length} orders placed` : 'Order placed')
      navigate(`/order-confirmation/${created[0].id}`)
    } catch (e) {
      setErrors([e.status === 401 ? 'Please sign in again to place your order.' : e.message || 'Could not place your order.'])
    } finally { setPlacing(false) }
  }

  const summaryLines = groups.map((g) => { const p = pickups[g.farmerId]; return `${g.farmerName}: ${p?.date ? `${p.date}${p.time ? ` · ${p.time}` : ''}` : 'not chosen'}` })

  return (
    <>
      <Navbar />
      <main className="bg-cream min-h-screen pt-28 pb-24">
        <div className="container-page">
          <h1 className="font-display text-3xl md:text-4xl text-forest-deep mb-3">Choose Your Pickup</h1>
          {groups.length > 1 && <p className="mb-8 max-w-2xl text-sm text-forest-deep/65">Your cart has items from {groups.length} farmers. Each farmer prepares their own order, so choose a pickup for each.</p>}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 flex flex-col gap-8">
              {groups.map((g) => <PickupPlanner key={g.farmerId} farmerId={g.farmerId} farmerName={g.farmerName} marketName={g.marketName} value={pickups[g.farmerId]} onChange={setFor(g.farmerId)} />)}
              <div>
                <label htmlFor="order-notes" className="mb-1.5 block text-sm text-forest-deep/70">Note for the farmer (optional)</label>
                <textarea id="order-notes" rows={3} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-forest/15 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-olive" />
              </div>
            </div>
            <div>
              <CheckoutSummary items={cartItems} subtotal={cartSubtotal} pickupDateLabel={summaryLines.join(' | ')} pickupTime={null} marketName={groups.map((g) => g.marketName).filter(Boolean).join(', ')} onPlaceOrder={handlePlaceOrder} errors={errors} placing={placing} />
              <p className="mt-3 text-xs text-forest-deep/50">Prices and stock are confirmed by the server when you place the order.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
