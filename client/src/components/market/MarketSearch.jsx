import { SearchIcon, CloseIcon } from './MarketIcons.jsx'

/**
 * Controlled search field. Matching lives in utils/marketUtils.js
 * (matchesMarketQuery) so this stays purely presentational and is reused
 * for the market list and the market product list.
 */
export default function MarketSearch({ value, onChange, placeholder = 'Search markets by name, location or address', label }) {
  return (
    <div className="relative flex items-center w-full">
      <SearchIcon className="absolute left-4 text-forest-deep/50 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        className="w-full bg-white/80 border border-forest/15 pl-11 pr-11 py-3 text-sm text-forest-deep placeholder:text-forest-deep/40 focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/40 transition-colors [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2 flex h-8 w-8 items-center justify-center text-forest-deep/50 hover:text-forest-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
        >
          <CloseIcon size={15} />
        </button>
      )}
    </div>
  )
}
