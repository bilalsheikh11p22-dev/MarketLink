import { AlertCircle, Bell, CheckCircle, Leaf, Package, Star, Store, XCircle } from 'lucide-react'

// One icon (and tint) per notification type.
export const NOTIFICATION_ICONS = {
  'order-confirmed': { Icon: CheckCircle, tint: 'text-sage bg-sage/15' },
  'order-ready': { Icon: Package, tint: 'text-olive bg-olive/20' },
  'order-cancelled': { Icon: XCircle, tint: 'text-[#A9482F] bg-[#A9482F]/10' },
  'farmer-update': { Icon: Leaf, tint: 'text-sage bg-sage/15' },
  'market-update': { Icon: Store, tint: 'text-forest-deep bg-forest-deep/10' },
  'product-restocked': { Icon: Package, tint: 'text-sage bg-sage/15' },
  'review-reminder': { Icon: Star, tint: 'text-olive bg-olive/20' },
  order: { Icon: CheckCircle, tint: 'text-sage bg-sage/15' },
  pickup: { Icon: Package, tint: 'text-olive bg-olive/20' },
  restock: { Icon: Package, tint: 'text-sage bg-sage/15' },
  stock: { Icon: AlertCircle, tint: 'text-olive bg-olive/20' },
  review: { Icon: Star, tint: 'text-olive bg-olive/20' },
  waste: { Icon: Leaf, tint: 'text-sage bg-sage/15' },
  system: { Icon: Bell, tint: 'text-forest-deep bg-forest-deep/10' }
}
export const FALLBACK_ICON = { Icon: AlertCircle, tint: 'text-forest-deep bg-forest-deep/10' }
