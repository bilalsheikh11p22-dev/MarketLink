// Frontend-only checkout validation — returns a list of human-readable
// error strings rather than throwing, so the UI can show all of them at
// once. Ready to be extended (or replaced) once a backend can validate
// stock/slot availability server-side.

export function validateCheckout({ cartItems, pickupDate, pickupSlot, marketId }) {
  const errors = []

  if (!cartItems || cartItems.length === 0) {
    errors.push('Your cart is empty.')
    return errors
  }

  const hasUnavailable = cartItems.some((item) => !item.available)
  if (hasUnavailable) {
    errors.push('Remove unavailable items before placing your pre-order.')
  }

  const hasInvalidQuantity = cartItems.some((item) => item.quantity < 1 || item.quantity > item.stock)
  if (hasInvalidQuantity) {
    errors.push('One or more items have an invalid quantity.')
  }

  if (!marketId) {
    errors.push('A pickup market could not be determined for this order.')
  }

  if (!pickupDate) {
    errors.push('Please select a pickup date.')
  }

  if (!pickupSlot) {
    errors.push('Please select a pickup time.')
  }

  return errors
}
