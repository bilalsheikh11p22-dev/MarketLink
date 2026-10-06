import { Link } from 'react-router-dom'
import MarketMap from '../map/MarketMap.jsx'
import { PinIcon } from './MarketIcons.jsx'
import { formatCoordinates, getDirectionsUrl } from '../../utils/marketUtils.js'

/**
 * Location card: name, address, distance, coordinates and the two
 * actions. The optional preview map goes through the MarketMap facade,
 * so switching to Google Maps / OpenStreetMap later never touches this
 * file.
 */
export default function MarketLocation({ market, showMap = true, showViewMap = true }) {
  return (
    <section aria-labelledby="market-location-title" className="border border-forest/10 bg-cream-soft overflow-hidden">
      {showMap && (
        <MarketMap market={market} height="h-56 md:h-64" showPopup={false} controls={false} zoom={14} className="border-b border-forest/10" />
      )}

      <div className="p-6 md:p-8">
        <h2 id="market-location-title" className="font-display text-xl text-forest-deep mb-4">
          Location
        </h2>

        <div className="flex items-start gap-3 mb-5">
          <PinIcon size={18} className="text-olive mt-0.5 shrink-0" />
          <div>
            <p className="text-forest-deep font-medium">{market.name}</p>
            <p className="text-forest-deep/70 text-sm">{market.address}</p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm mb-6">
          {market.distanceKm != null && (
            <div>
              <dt className="text-forest-deep/50 text-xs mb-0.5">Distance</dt>
              <dd className="text-forest-deep">{Number(market.distanceKm).toFixed(1)} km away</dd>
            </div>
          )}
          <div>
            <dt className="text-forest-deep/50 text-xs mb-0.5">Coordinates</dt>
            <dd className="text-forest-deep">{formatCoordinates(market.coordinates)}</dd>
          </div>
        </dl>

        <div className="flex flex-col sm:flex-row gap-3">
          {showViewMap && (
            <Link
              to={`/markets/${market.id}/map`}
              className="inline-flex items-center justify-center px-6 py-3 text-sm bg-forest-deep text-cream hover:bg-forest-light transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-2 focus-visible:ring-offset-cream-soft"
            >
              View Map
            </Link>
          )}
          <a
            href={getDirectionsUrl(market)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm border border-forest/25 text-forest-deep hover:border-olive hover:text-olive transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
          >
            Get Directions
            <span aria-hidden="true">↗</span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  )
}
