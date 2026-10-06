import ProductCard from './ProductCard.jsx'

/**
 * Horizontal, user-controlled scroll showcase. No auto-play — the
 * person drags/swipes/scrolls it themselves, on desktop and mobile alike.
 */
export default function ProductShowcase({ items }) {
  return (
    <div className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 md:-mx-10 md:px-10 lg:-mx-16 lg:px-16 snap-x snap-mandatory">
      {items.map((product) => (
        <div key={product.id} className="shrink-0 w-64 sm:w-72 snap-start">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  )
}
