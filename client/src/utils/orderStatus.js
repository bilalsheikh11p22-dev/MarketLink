// Single source of truth for order statuses shown in the UI (values match the API).
export const STATUS_LABEL = { pending: 'Placed', confirmed: 'Confirmed', accepted: 'Accepted', preparing: 'Preparing', ready: 'Ready for pickup', completed: 'Completed', cancelled: 'Cancelled' }
export const STATUS_STYLE = {
  pending: 'border-olive text-olive bg-transparent',
  confirmed: 'border-olive text-olive bg-transparent',
  accepted: 'border-sage text-sage bg-transparent',
  preparing: 'border-sage text-sage bg-sage/10',
  ready: 'bg-forest-deep text-cream border-forest-deep',
  completed: 'bg-forest/5 text-forest-deep/60 border-forest/15',
  cancelled: 'border-red-300 text-red-700 bg-red-50'
}
// Steps shown on the timeline, in order.
export const TIMELINE_STEPS = ['pending', 'accepted', 'preparing', 'ready', 'completed']
export const CANCELLABLE = ['pending', 'confirmed', 'accepted']
export const ACTIVE = ['pending', 'confirmed', 'accepted', 'preparing', 'ready']
