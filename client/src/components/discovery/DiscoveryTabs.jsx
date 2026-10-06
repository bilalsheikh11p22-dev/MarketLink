import { motion } from 'framer-motion'

const TABS = ['Markets', 'Farmers', 'Products']

/**
 * Premium pill-style tab switcher. Active state is a single shared
 * layout element (layoutId) so the indicator glides between tabs
 * instead of re-animating from scratch.
 */
export default function DiscoveryTabs({ active, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Discovery categories"
      className="flex items-center gap-1 overflow-x-auto border-b border-forest/15 w-full sm:w-fit"
    >
      {TABS.map((tab) => {
        const isActive = tab === active
        return (
          <button
            key={tab}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab)}
            className={`relative shrink-0 px-6 py-3.5 text-sm font-medium tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-olive ${
              isActive ? 'text-forest-deep' : 'text-forest-deep/50 hover:text-forest-deep/80'
            }`}
          >
            {tab}
            {isActive && (
              <motion.span
                layoutId="discovery-tab-indicator"
                className="absolute left-0 right-0 -bottom-px h-[2px] bg-olive"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
