// Notification types and tab categories. Notifications themselves come from the API.

export const NOTIFICATION_TYPES = {
  'order-confirmed': { label: 'Order', category: 'orders' },
  'order-ready': { label: 'Order', category: 'orders' },
  'order-cancelled': { label: 'Order', category: 'orders' },
  'farmer-update': { label: 'Farmer', category: 'farmers' },
  'product-restocked': { label: 'Farmer', category: 'farmers' },
  'market-update': { label: 'Market', category: 'markets' },
  'review-reminder': { label: 'Update', category: 'updates' },
  // Types produced by the server
  order: { label: 'Order', category: 'orders' },
  pickup: { label: 'Pickup', category: 'orders' },
  restock: { label: 'Restock', category: 'farmers' },
  stock: { label: 'Stock', category: 'updates' },
  review: { label: 'Review', category: 'updates' },
  waste: { label: 'Waste', category: 'updates' },
  system: { label: 'Update', category: 'updates' }
}

export const NOTIFICATION_TABS = [
  { id: 'all', label: 'All' },
  { id: 'orders', label: 'Orders' },
  { id: 'farmers', label: 'Farmers' },
  { id: 'markets', label: 'Markets' },
  { id: 'updates', label: 'Updates' }
]

export const categoryOf = (type) => NOTIFICATION_TYPES[type]?.category ?? 'updates'
