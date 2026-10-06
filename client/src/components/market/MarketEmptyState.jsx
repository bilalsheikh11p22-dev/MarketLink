import { Link } from 'react-router-dom'
import { PinIcon } from './MarketIcons.jsx'

/**
 * One empty state for every market surface (markets, nearby markets,
 * farmers, products). Pass an `onAction` to render a button, or `to` for
 * a link.
 */
export default function MarketEmptyState({
  title = 'No Markets Found',
  description = 'Try changing your search or filters.',
  actionLabel = 'Clear Filters',
  onAction,
  to
}) {
  const btn =
    'mt-6 inline-flex items-center justify-center px-6 py-3 text-sm bg-forest-deep text-cream hover:bg-forest-light transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-2 focus-visible:ring-offset-cream'

  return (
    <div role="status" className="flex flex-col items-center text-center py-20 px-6 border border-dashed border-forest/15 bg-cream-soft/60">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-deep/5 text-olive mb-5">
        <PinIcon size={24} />
      </span>
      <h2 className="font-display text-2xl text-forest-deep mb-2">{title}</h2>
      <p className="text-forest-deep/60 text-sm max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className={btn}>
          {actionLabel}
        </button>
      )}
      {actionLabel && to && !onAction && (
        <Link to={to} className={btn}>
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
