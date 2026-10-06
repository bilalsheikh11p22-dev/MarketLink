import { Link } from 'react-router-dom'

export default function CartEmpty() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6">
      <svg
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="text-forest-deep/25 mb-6"
        aria-hidden="true"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h8.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <h2 className="font-display text-2xl md:text-3xl text-forest-deep mb-3">Your Cart Is Empty</h2>
      <p className="text-forest-deep/60 max-w-xs mb-8">Fresh local products are waiting for you.</p>
      <Link to="/products" className="px-7 py-3.5 bg-forest-deep text-cream text-sm hover:bg-forest-light transition-colors">
        Explore Products
      </Link>
    </div>
  )
}
