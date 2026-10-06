import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

const COPY = {
  all: 'Tap the heart on any product, farmer or market to keep it here.',
  products: 'No favorite products yet. Save the ones you love.',
  farmers: 'No favorite farmers yet. Follow the growers you trust.',
  markets: 'No favorite markets yet. Save your go-to market.'
}

export default function FavoritesEmptyState({ tab = 'all' }) {
  const btn = 'inline-flex items-center justify-center px-6 py-3 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-2 focus-visible:ring-offset-cream'
  return (
    <div role="status" className="flex flex-col items-center text-center py-20 px-6 border border-dashed border-forest/15 bg-cream-soft/60">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-deep/5 text-olive mb-5">
        <Heart size={28} strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h2 className="font-display text-2xl text-forest-deep mb-2">Nothing saved yet</h2>
      <p className="text-forest-deep/60 text-sm max-w-sm">{COPY[tab]}</p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link to="/products" className={`${btn} bg-forest-deep text-cream hover:bg-forest-light`}>
          Explore Products
        </Link>
        <Link to="/farmers" className={`${btn} border border-forest-deep/30 text-forest-deep hover:border-olive hover:text-olive`}>
          Find Farmers
        </Link>
        <Link to="/markets" className={`${btn} border border-forest-deep/30 text-forest-deep hover:border-olive hover:text-olive`}>
          Discover Markets
        </Link>
      </div>
    </div>
  )
}
