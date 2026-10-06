import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import OrderCard from '../components/order/OrderCard.jsx'
import { useOrders } from '../context/OrderContext.jsx'
import { ACTIVE } from '../utils/orderStatus.js'

export default function Orders() {
  const { orders, loading, error, refresh } = useOrders()
  const active = orders.filter((o) => ACTIVE.includes(o.status))
  const past = orders.filter((o) => !ACTIVE.includes(o.status))
  return (
    <>
      <Navbar />
      <main className="bg-cream min-h-screen pt-28 pb-24">
        <div className="container-page">
          <div className="mb-10 flex items-end justify-between gap-4">
            <h1 className="font-display text-3xl md:text-4xl text-forest-deep">My Orders</h1>
            <button type="button" onClick={refresh} className="text-sm text-olive hover:underline">Refresh</button>
          </div>
          {loading ? <p role="status" className="py-16 text-center text-forest-deep/55">Loading your orders…</p>
            : error ? <div role="alert" className="py-16 text-center"><p className="text-red-700">{error}</p><button type="button" onClick={refresh} className="mt-4 border border-forest/20 px-5 py-2 text-sm">Try again</button></div>
            : orders.length === 0 ? <div className="py-16 text-center"><p className="text-forest-deep/55">You haven&apos;t placed any pre-orders yet.</p><Link to="/products" className="mt-5 inline-block bg-forest-deep px-6 py-3 text-sm text-cream">Browse products</Link></div>
            : (
              <div className="flex flex-col gap-10">
                {active.length > 0 && <section aria-labelledby="active-h"><h2 id="active-h" className="mb-4 font-display text-xl text-forest-deep">In progress</h2><div className="flex flex-col gap-5">{active.map((o) => <OrderCard key={o.id} order={o} />)}</div></section>}
                {past.length > 0 && <section aria-labelledby="past-h"><h2 id="past-h" className="mb-4 font-display text-xl text-forest-deep">Past orders</h2><div className="flex flex-col gap-5">{past.map((o) => <OrderCard key={o.id} order={o} />)}</div></section>}
              </div>
            )}
        </div>
      </main>
      <Footer />
    </>
  )
}
