import { NavLink } from 'react-router-dom'

/**
 * Overview / Farmers / Products / Location — real routes, so the tabs
 * are deep-linkable and the browser back button works. Horizontal scroll
 * on mobile, underline accent on the active tab.
 */
export default function MarketTabs({ marketId }) {
  const tabs = [
    { label: 'Overview', to: `/markets/${marketId}`, end: true },
    { label: 'Farmers', to: `/markets/${marketId}/farmers` },
    { label: 'Products', to: `/markets/${marketId}/products` },
    { label: 'Location', to: `/markets/${marketId}/map` }
  ]

  return (
    <nav aria-label="Market sections" className="border-b border-forest/10">
      <ul className="flex gap-1 overflow-x-auto no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
        {tabs.map((tab) => (
          <li key={tab.to} className="shrink-0">
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `relative block px-5 py-4 text-sm whitespace-nowrap transition-colors focus:outline-none focus-visible:bg-olive/10 ${
                  isActive ? 'text-forest-deep font-medium' : 'text-forest-deep/60 hover:text-forest-deep'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {tab.label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-3 -bottom-px h-0.5 transition-colors ${isActive ? 'bg-olive' : 'bg-transparent'}`}
                  />
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
