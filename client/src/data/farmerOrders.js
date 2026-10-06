// Farmer-side order status helpers. Orders themselves come from the API (see FarmerContext).
// UI labels  <->  API statuses
export const API_TO_LABEL = { pending: 'New', confirmed: 'New', accepted: 'Accepted', preparing: 'Preparing', ready: 'Ready for Pickup', completed: 'Completed', cancelled: 'Cancelled' }
export const LABEL_TO_API = { Accepted: 'accepted', Preparing: 'preparing', 'Ready for Pickup': 'ready', Cancelled: 'cancelled' }

// "Completed" is not a button: an order is completed only by verifying the customer's pickup code.
export const ORDER_STATUS_FLOW = {
  New: ['Accepted', 'Cancelled'],
  Accepted: ['Preparing', 'Cancelled'],
  Preparing: ['Ready for Pickup', 'Cancelled'],
  'Ready for Pickup': ['Cancelled'],
  Completed: [],
  Cancelled: []
}
