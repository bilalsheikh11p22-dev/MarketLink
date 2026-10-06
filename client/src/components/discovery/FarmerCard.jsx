import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import FavoriteButton from '../favorites/FavoriteButton.jsx'
import ImageWithLoader from '../common/ImageWithLoader.jsx'

export default function FarmerCard({ farmer }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group relative flex flex-col overflow-hidden border border-forest/10 bg-cream-soft hover:border-olive/50 transition-colors rounded-lg"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Link to={`/farmers/${farmer.id}`} tabIndex={-1} aria-hidden="true" className="absolute inset-0 block">
          <ImageWithLoader
            src={farmer.image}
            alt={farmer.name}
            wrapperClassName="absolute inset-0 h-full w-full"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-forest-deep/25 to-transparent pointer-events-none" />

        <FavoriteButton type="farmer" entity={farmer} className="absolute top-4 right-4 !h-8 !w-8" />

        <span className="absolute top-4 left-4 flex items-center gap-1 bg-cream/90 px-2.5 py-1 text-xs text-forest-deep opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          ★ {farmer.rating}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-5 text-cream">
          <p className="font-display text-lg leading-snug">
            <Link to={`/farmers/${farmer.id}`} className="hover:text-olive-light transition-colors focus:outline-none focus-visible:underline">
              {farmer.name}
            </Link>
          </p>
          <p className="text-cream/75 text-sm">{farmer.farm}</p>

          <div className="mt-2 max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-300 overflow-hidden">
            <p className="text-cream/85 text-xs">{farmer.specialty}</p>
            <div className="flex items-center gap-3 text-cream/70 text-xs mt-1.5">
              <span>{farmer.marketName}</span>
              <span>{farmer.products} Products</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-xs text-forest-deep/55">{farmer.location}</span>
        <Link to={`/farmers/${farmer.id}`} className="inline-flex items-center gap-2 text-sm text-forest-deep group-hover:text-olive transition-colors">
          View Profile
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </motion.article>
  )
}
