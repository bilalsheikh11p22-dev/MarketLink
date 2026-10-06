import CartItem from './CartItem.jsx'

/**
 * Groups cart items visually by farmer — prepares the UI for future
 * multi-farmer order splitting even though checkout today treats the
 * cart as a single pickup.
 */
export default function FarmerCartGroup({ group }) {
  return (
    <div className="mb-8">
      <p className="text-xs tracking-widest2 uppercase text-olive mb-1">From</p>
      <h3 className="font-display text-xl text-forest-deep mb-2">{group.farmerName}</h3>
      <div>
        {group.items.map((item) => (
          <CartItem key={item.productId} item={item} />
        ))}
      </div>
    </div>
  )
}
