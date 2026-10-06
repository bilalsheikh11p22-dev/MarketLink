import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useFavorites } from '../../context/FavoritesContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { toFavorite } from '../../data/favorites.js'

/**
 * The one heart used everywhere.
 *  type:    'product' | 'farmer' | 'market'
 *  entity:  the product / farmer / market record
 *  variant: 'overlay' (round button on an image) | 'pill' (labelled, on light)
 *           | 'pill-dark' (labelled, on dark hero)
 */
export default function FavoriteButton({ type, entity, variant = 'overlay', className = '' }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const { showToast } = useToast()
  const active = isFavorite(type, entity.id)

  const handle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const nowFav = toggleFavorite(toFavorite(type, entity))
    showToast(nowFav ? 'Added to favorites' : 'Removed from favorites')
  }

  const label = active ? 'Remove from favorites' : 'Add to favorites'
  const heart = (
    <motion.span key={String(active)} initial={{ scale: active ? 0.6 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }} className="inline-flex">
      <Heart size={variant === 'overlay' ? 18 : 16} strokeWidth={1.8} className={active ? 'fill-[#C0533A] text-[#C0533A]' : ''} aria-hidden="true" />
    </motion.span>
  )

  if (variant === 'overlay')
    return (
      <button
        type="button"
        onClick={handle}
        aria-label={label}
        aria-pressed={active}
        className={`flex h-10 w-10 items-center justify-center rounded-full bg-cream/95 text-forest-deep shadow-sm hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive ${className}`}
      >
        {heart}
      </button>
    )

  const tone =
    variant === 'pill-dark'
      ? 'border-cream/70 text-cream hover:bg-cream hover:text-forest-deep'
      : 'border-forest-deep/30 text-forest-deep hover:border-olive hover:text-olive'

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex items-center justify-center gap-2 border px-5 py-3 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive ${tone} ${className}`}
    >
      {heart}
      {active ? 'Saved' : 'Save'}
    </button>
  )
}
