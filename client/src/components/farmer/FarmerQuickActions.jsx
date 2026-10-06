import { Link } from 'react-router-dom'

const ACTIONS = [
  { label: 'Add Product', to: '/farmer/products/new' },
  { label: 'Manage Inventory', to: '/farmer/inventory' },
  { label: 'View Orders', to: '/farmer/orders' },
  { label: 'Manage Pickup Slots', to: '/farmer/pickup-slots' },
  { label: 'View Reviews', to: '/farmer/reviews' }
]

export default function FarmerQuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      {ACTIONS.map((action) => (
        <Link
          key={action.to}
          to={action.to}
          className="px-4 py-2.5 border border-forest/15 text-sm text-forest-deep hover:border-olive/60 hover:text-olive transition-colors"
        >
          {action.label}
        </Link>
      ))}
    </div>
  )
}
