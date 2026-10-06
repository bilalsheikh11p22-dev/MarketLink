import { motion } from 'framer-motion'

/**
 * Reusable search input for the discovery experience.
 * Fully controlled — filtering logic lives with the caller (ExploreSection),
 * so this component stays presentational and reusable across tabs.
 */
export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative flex items-center w-full max-w-md">
      <motion.svg
        initial={{ scale: 1 }}
        animate={{ scale: value ? 1.08 : 1 }}
        transition={{ duration: 0.25 }}
        className="absolute left-4 h-4 w-4 text-forest-deep/50 pointer-events-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </motion.svg>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-white/70 border border-forest/15 pl-11 pr-4 py-3 text-sm text-forest-deep placeholder:text-forest-deep/40 focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/40 transition-colors"
      />
    </div>
  )
}
