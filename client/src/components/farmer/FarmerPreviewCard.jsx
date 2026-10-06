import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import FarmerImage from '../image/FarmerImage.jsx'

/**
 * Compact, editorial-style farmer card for the horizontal "Meet the
 * Farmers" showcase — distinct from the discovery FarmerCard, which
 * is sized for a responsive grid rather than a horizontal scroller.
 */
export default function FarmerPreviewCard({ farmer }) {
  const fullStars = Math.round(farmer.rating)

  return (
    <motion.article whileHover={{ y: -5 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="group w-64 sm:w-72 shrink-0">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
        <FarmerImage fill src={farmer.image} alt={farmer.name} className="transition-transform duration-500 ease-out group-hover:scale-[1.05]" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-transparent to-transparent" />
      </div>

      <div className="pt-4">
        <p className="font-display text-lg text-forest-deep leading-snug">{farmer.name}</p>
        <p className="text-forest-deep/60 text-sm">{farmer.farm}</p>
        <p className="text-forest-deep/50 text-xs mt-1">{farmer.specialty} · {farmer.marketName}</p>

        <div className="flex items-center gap-1.5 mt-2 text-xs text-olive" aria-label={`Rated ${farmer.rating} out of 5`}>
          <span aria-hidden="true">{'★'.repeat(fullStars)}{'☆'.repeat(5 - fullStars)}</span>
          <span className="text-forest-deep/60">{farmer.rating}</span>
        </div>

        <Link
          to={`/farmers/${farmer.id}`}
          className="mt-3 inline-flex items-center gap-2 text-sm text-forest-deep group-hover:text-olive transition-colors"
        >
          View Farmer
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </motion.article>
  )
}
