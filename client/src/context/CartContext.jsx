import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

// CartContext is the single source of truth for the shopping cart.
// It reads/writes localStorage directly for now (STORAGE_KEY below) —
// when a real backend arrives, only this file's internals need to
// change (e.g. addToCart/removeFromCart calling an API instead of
// setCartItems); every component that consumes useCart() stays the same.

const CartContext = createContext(null)
const STORAGE_KEY = 'marketlink_cart'

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadCart)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems))
    } catch {
      // localStorage unavailable (private browsing, quota, etc.) —
      // the cart simply won't persist across a refresh this session.
    }
  }, [cartItems])

  // Builds a cart item from a full product record without mutating it.
  const addToCart = useCallback((product, quantity = 1) => {
    if (!product.available) return { success: false, reason: 'unavailable' }

    let result = { success: true }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      const currentQty = existing ? existing.quantity : 0
      const nextQty = Math.min(product.stock, currentQty + quantity)

      if (nextQty <= currentQty) {
        result = { success: false, reason: 'stock-limit' }
        return prev
      }

      if (existing) {
        return prev.map((item) => (item.productId === product.id ? { ...item, quantity: nextQty } : item))
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          quantity: nextQty,
          image: product.images?.[0] ?? product.image,
          farmerId: product.farmer.id,
          farmerName: product.farmer.name,
          marketId: product.market.id,
          marketName: product.market.name,
          available: product.available,
          stock: product.stock
        }
      ]
    })

    return result
  }, [])

  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId))
  }, [])

  const setQuantity = useCallback((productId, quantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: Math.min(Math.max(1, quantity), item.stock) } : item
      )
    )
  }, [])

  const increaseQuantity = useCallback((productId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) } : item
      )
    )
  }, [])

  const decreaseQuantity = useCallback((productId) => {
    setCartItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item))
    )
  }, [])

  const clearCart = useCallback(() => setCartItems([]), [])

  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems])
  const cartSubtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems])

  const farmerGroups = useMemo(() => {
    const groups = new Map()
    cartItems.forEach((item) => {
      if (!groups.has(item.farmerId)) {
        groups.set(item.farmerId, { farmerId: item.farmerId, farmerName: item.farmerName, items: [] })
      }
      groups.get(item.farmerId).items.push(item)
    })
    return Array.from(groups.values())
  }, [cartItems])

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      setQuantity,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      cartCount,
      cartSubtotal,
      farmerGroups
    }),
    [cartItems, addToCart, removeFromCart, setQuantity, increaseQuantity, decreaseQuantity, clearCart, cartCount, cartSubtotal, farmerGroups]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
