import { Link } from 'react-router-dom'

/**
 * Home → Markets → <Market>. On phones it collapses to a compact
 * "← Markets / Market name" so it never wraps or overflows.
 */
export default function MarketBreadcrumbs({ marketName }) {
  const link = 'text-forest-deep/60 hover:text-olive transition-colors focus:outline-none focus-visible:underline'

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      {/* compact (mobile) */}
      <div className="flex items-center gap-2 sm:hidden min-w-0">
        <Link to="/markets" className={`${link} shrink-0`}>
          ← Markets
        </Link>
        <span className="text-forest-deep/30" aria-hidden="true">
          /
        </span>
        <span aria-current="page" className="truncate text-forest-deep">
          {marketName}
        </span>
      </div>

      {/* full (≥ sm) */}
      <ol className="hidden sm:flex items-center gap-2.5 flex-wrap">
        <li>
          <Link to="/" className={link}>
            Home
          </Link>
        </li>
        <li aria-hidden="true" className="text-olive">
          →
        </li>
        <li>
          <Link to="/markets" className={link}>
            Markets
          </Link>
        </li>
        <li aria-hidden="true" className="text-olive">
          →
        </li>
        <li aria-current="page" className="text-forest-deep">
          {marketName}
        </li>
      </ol>
    </nav>
  )
}
