import { Link } from 'react-router-dom'
import useMarket from '../../hooks/useMarket.js'
import { formatHours, formatOperatingDays } from '../../utils/marketUtils.js'

/**
 * Read-only display of the farmer's associated market, resolved from the
 * farmer's marketId against the shared markets data (Step 6). Real market
 * (re)assignment is a backend concern for a later step — this shows where
 * the farmer is associated and links to the public market page.
 */
export default function MarketSelector({ marketId, stallNumber }) {
  const { market } = useMarket(marketId || 'none')

  return (
    <div className="bg-cream-soft border border-forest/10 p-6">
      <p className="text-xs tracking-widest2 uppercase text-olive mb-3">Associated Market</p>
      <p className="font-display text-xl text-forest-deep mb-1">{market?.name ?? 'Not assigned'}</p>
      {market && (
        <>
          <p className="text-forest-deep/70 text-sm">Location: {market.location}</p>
          <p className="text-forest-deep/70 text-sm">{market.address}</p>
          <p className="text-forest-deep/70 text-sm">
            {formatOperatingDays(market)} · {formatHours(market)}
          </p>
        </>
      )}
      <p className="text-forest-deep/55 text-sm mt-3">
        Stall: <span className="text-forest-deep">{stallNumber || 'Not set'}</span>
      </p>
      {market && (
        <Link
          to={`/markets/${market.id}`}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-forest-deep text-cream hover:bg-forest-light transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-2 focus-visible:ring-offset-cream-soft"
        >
          View Market
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  )
}
