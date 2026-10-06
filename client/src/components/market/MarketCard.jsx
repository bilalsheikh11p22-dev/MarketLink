import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PinIcon, StarIcon, ClockIcon } from './MarketIcons.jsx'
import FavoriteButton from '../favorites/FavoriteButton.jsx'
import ImageWithLoader from '../common/ImageWithLoader.jsx'
import { formatHours, formatOperatingDays, getMarketStatus } from '../../utils/marketUtils.js'

const STATUS_STYLE = {
  open: 'bg-sage text-cream',
  'opens-later': 'bg-olive text-forest-deep',
  closed: 'bg-forest-deep/75 text-cream/90'
}

/**
 * Market card used on /markets, /nearby-markets and the Home Explore
 * section. Hover: image zoom, slight lift + shadow, arrow nudge and a
 * border colour change — deliberately no glassmorphism.
 */
export default function MarketCard({ market }) {
  const status = getMarketStatus(market)

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group relative flex h-full flex-col overflow-hidden border border-forest/10 bg-cream-soft transition-[border-color,box-shadow] duration-300 hover:border-olive/60 hover:shadow-[0_18px_40px_-22px_rgba(11,29,21,0.45)] focus-within:border-olive/60"
    >
      <Link to={`/markets/${market.id}`} tabIndex={-1} aria-hidden="true" className="relative block aspect-[4/3] overflow-hidden bg-forest-light">
        <ImageWithLoader
          src={market.image}
          alt=""
          wrapperClassName="absolute inset-0 h-full w-full"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/70 via-forest-deep/5 to-transparent" />
        <span className="absolute top-4 left-4 flex items-center gap-1.5 bg-cream/90 px-3 py-1.5 text-xs text-forest-deep">
          <PinIcon size={12} />
          {market.location}
        </span>
        <span className={`absolute top-4 left-1/2 -translate-x-1/2 px-2.5 py-1 text-[11px] ${STATUS_STYLE[status.state]}`}>{status.label}</span>
        <FavoriteButton type="market" entity={market} className="absolute top-4 right-4 !h-9 !w-9" />
        {market.distanceKm != null && <span className="absolute bottom-4 right-4 text-cream text-xs bg-forest-deep/70 px-2.5 py-1">{Number(market.distanceKm).toFixed(1)} km</span>}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl text-forest-deep leading-snug">
            <Link
              to={`/markets/${market.id}`}
              className="hover:text-olive transition-colors focus:outline-none focus-visible:underline decoration-olive underline-offset-4"
            >
              {market.name}
            </Link>
          </h3>
          {market.rating ? (
            <span className="flex shrink-0 items-center gap-1 text-sm text-forest-deep" aria-label={`Rated ${market.rating} out of 5`}>
              <StarIcon className="text-olive" />
              {market.rating}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-1 text-xs text-forest-deep/60">
          <span>{formatOperatingDays(market)}</span>
          <span className="flex items-center gap-1.5">
            <ClockIcon size={12} />
            {formatHours(market)}
          </span>
        </div>

        <div className="flex items-center gap-5 text-sm text-forest-deep/75">
          <span>{market.farmersCount} Farmers</span>
          <span>{market.productsCount} Products</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <Link
            to={`/markets/${market.id}`}
            className="inline-flex items-center gap-2 text-sm text-forest-deep hover:text-olive transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
          >
            Explore Market
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
              →
            </span>
          </Link>
          <Link
            to={`/markets/${market.id}/map`}
            className="text-xs border border-forest/20 px-3 py-2 text-forest-deep/75 hover:border-olive hover:text-forest-deep transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
            aria-label={`View location of ${market.name}`}
          >
            View Location
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
