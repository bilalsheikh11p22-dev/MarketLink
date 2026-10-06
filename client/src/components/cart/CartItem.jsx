import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from '../../context/CartContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import ProductImage from '../image/ProductImage.jsx'

export default function CartItem({ item }) {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart()
  const { showToast } = useToast()
  const [confirmingRemove, setConfirmingRemove] = useState(false)

  const atStockLimit = item.quantity >= item.stock
  const subtotal = item.price * item.quantity

  const handleRemove = () => {
    removeFromCart(item.productId)
    showToast('Removed from cart')
    setConfirmingRemove(false)
  }

  const handleIncrease = () => {
    if (atStockLimit) {
      showToast('Maximum available quantity reached')
      return
    }
    increaseQuantity(item.productId)
  }

  return (
    <div className="flex gap-4 py-5 border-b border-forest/10 last:border-b-0">
      <Link to={`/products/${item.productId}`} className="relative shrink-0 h-20 w-20 overflow-hidden bg-cream-soft border border-forest/10">
        <ProductImage fill src={item.image} alt={item.name} />
      </Link>

      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/products/${item.productId}`}
              className="font-display text-lg text-forest-deep hover:text-olive transition-colors"
            >
              {item.name}
            </Link>
            <p className="text-forest-deep/55 text-xs mt-0.5">{item.farmerName}</p>
          </div>
          <p className="text-forest-deep font-medium whitespace-nowrap">Rs. {subtotal}</p>
        </div>

        {!item.available && <p className="text-xs text-red-700/80">This product is currently unavailable.</p>}

        <div className="flex items-center justify-between mt-2 gap-3 flex-wrap">
          <div className="flex items-center border border-forest/15">
            <button
              type="button"
              onClick={() => decreaseQuantity(item.productId)}
              disabled={item.quantity <= 1 || !item.available}
              aria-label="Decrease quantity"
              className="h-10 w-10 flex items-center justify-center text-forest-deep disabled:opacity-30 hover:bg-cream-soft transition-colors"
            >
              −
            </button>
            <span className="w-10 text-center text-sm text-forest-deep" aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              disabled={!item.available}
              aria-label="Increase quantity"
              className="h-10 w-10 flex items-center justify-center text-forest-deep disabled:opacity-30 hover:bg-cream-soft transition-colors"
            >
              +
            </button>
          </div>

          {!confirmingRemove ? (
            <button
              type="button"
              onClick={() => setConfirmingRemove(true)}
              className="text-xs text-forest-deep/50 hover:text-red-700/80 transition-colors"
            >
              Remove
            </button>
          ) : (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 text-xs">
                <span className="text-forest-deep/60">Remove this item from your cart?</span>
                <button type="button" onClick={handleRemove} className="text-red-700/80 font-medium">
                  Yes
                </button>
                <button type="button" onClick={() => setConfirmingRemove(false)} className="text-forest-deep/50">
                  Cancel
                </button>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}
