import { Link } from 'react-router-dom'

export default function CartSummary({ subtotal, itemCount }) {
  return (
    <div className="bg-cream-soft border border-forest/10 p-6 md:p-8 md:sticky md:top-28">
      <h3 className="font-display text-xl text-forest-deep mb-6">Order Summary</h3>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-forest-deep/70">
          <span>Subtotal</span>
          <span>Rs. {subtotal}</span>
        </div>
        <div className="flex justify-between text-forest-deep/70">
          <span>Items</span>
          <span>{itemCount}</span>
        </div>
        <div className="flex justify-between text-forest-deep/70">
          <span>Pickup</span>
          <span>Free</span>
        </div>
        <div className="flex justify-between font-display text-lg text-forest-deep pt-3 mt-1 border-t border-forest/10">
          <span>Total</span>
          <span>Rs. {subtotal}</span>
        </div>
      </div>

      <Link
        to="/checkout"
        className="mt-6 block text-center w-full py-3.5 bg-forest-deep text-cream text-sm tracking-wide hover:bg-forest-light transition-colors"
      >
        Continue to Pickup
      </Link>
    </div>
  )
}
