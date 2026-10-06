import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import CartEmpty from '../components/cart/CartEmpty.jsx'
import CartSummary from '../components/cart/CartSummary.jsx'
import FarmerCartGroup from '../components/cart/FarmerCartGroup.jsx'
import { useCart } from '../context/CartContext.jsx'

export default function Cart() {
  const { cartItems, cartCount, cartSubtotal, farmerGroups } = useCart()

  return (
    <>
      <Navbar />
      <main className="bg-cream min-h-screen pt-28 pb-24">
        <div className="container-page">
          <h1 className="font-display text-3xl md:text-4xl text-forest-deep mb-2">Your Cart</h1>
          <p className="text-forest-deep/55 text-sm mb-10">
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
          </p>

          {cartItems.length === 0 ? (
            <CartEmpty />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                {farmerGroups.map((group) => (
                  <FarmerCartGroup key={group.farmerId} group={group} />
                ))}
              </div>
              <div>
                <CartSummary subtotal={cartSubtotal} itemCount={cartCount} />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
