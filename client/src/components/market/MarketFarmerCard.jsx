import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PinIcon, StarIcon } from './MarketIcons.jsx'
import FarmerImage from '../image/FarmerImage.jsx'

/**
 * Farmer card for the market Farmers page. Unlike the Home hover-reveal
 * card, every detail (specialty, rating, product count, location) is
 * always visible so it works on touch screens too.
 */
export default function MarketFarmerCard({ farmer }) {
  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group flex h-full flex-col overflow-hidden border border-forest/10 bg-cream-soft transition-[border-color,box-shadow] duration-300 hover:border-olive/60 hover:shadow-[0_18px_40px_-22px_rgba(11,29,21,0.45)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-forest-light">
        <FarmerImage fill src={farmer.image} alt={`${farmer.name}, ${farmer.farm}`} className="object-top transition-transform duration-500 ease-out group-hover:scale-[1.05]" />
        <span className="absolute top-3 right-3 flex items-center gap-1 bg-cream/90 px-2.5 py-1 text-xs text-forest-deep" aria-label={`Rated ${farmer.rating} out of 5`}>
          <StarIcon className="text-olive" size={12} />
          {farmer.rating}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <h3 className="font-display text-lg text-forest-deep leading-snug">{farmer.name}</h3>
        <p className="text-sm text-forest-deep/70">{farmer.farm}</p>
        <p className="text-xs uppercase tracking-wide text-olive">{farmer.specialty}</p>

        <div className="flex items-center justify-between gap-3 text-xs text-forest-deep/60 mt-2">
          <span className="flex items-center gap-1.5">
            <PinIcon size={12} />
            {farmer.location}
          </span>
          <span>{farmer.products} Products</span>
        </div>

        <Link
          to={`/farmers/${farmer.id}`}
          className="mt-auto pt-4 inline-flex items-center gap-2 text-sm text-forest-deep hover:text-olive transition-colors w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
        >
          View Profile
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </motion.article>
  )
}
