import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import MarketSearch from '../../components/market/MarketSearch.jsx'
import MarketFilters, { MarketFilterSheet } from '../../components/market/MarketFilters.jsx'
import MarketCard from '../../components/market/MarketCard.jsx'
import MarketEmptyState from '../../components/market/MarketEmptyState.jsx'
import { MarketSkeletonGrid } from '../../components/market/MarketSkeleton.jsx'
import { FilterIcon, OrganicLeaf } from '../../components/market/MarketIcons.jsx'
import LocationSelector from '../../components/location/LocationSelector.jsx'
import * as marketService from '../../services/marketService.js'
import { normalizeList, normalizeMarket } from '../../utils/normalize.js'
import { DEFAULT_FILTERS, countActiveFilters, filterMarkets } from '../../utils/marketUtils.js'

export default function Markets() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('Karachi')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Discover Local Markets — MarketLink'
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    marketService
      .getMarkets()
      .then((res) => { if (!cancelled) setMarkets(normalizeList(res.data?.markets, normalizeMarket)) })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load markets.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const results = useMemo(() => filterMarkets(markets, { query, location, filters }), [markets, query, location, filters])
  const activeCount = countActiveFilters(filters)
  const hasCriteria = activeCount > 0 || query.trim() !== '' || location !== 'Karachi'

  const clearAll = () => {
    setQuery('')
    setLocation('Karachi')
    setFilters(DEFAULT_FILTERS)
  }

  return (
    <>
      <Navbar />
      <main className="bg-cream min-h-screen">
        {/* Hero */}
        <header className="relative overflow-hidden bg-forest-deep pt-36 pb-16 md:pt-44 md:pb-24">
          <OrganicLeaf className="absolute -right-40 -top-32 h-[38rem] w-[38rem] md:h-[46rem] md:w-[46rem] opacity-70 pointer-events-none" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-sage/10 blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="container-page relative">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="block text-olive-light text-xs md:text-sm tracking-widest2 uppercase mb-5"
            >
              Discover Local
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: 'easeOut' }}
              className="font-display text-5xl sm:text-6xl md:text-7xl text-cream leading-[1.04]"
            >
              Markets Around You
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-6 text-cream/75 text-base md:text-lg max-w-xl"
            >
              Find fresh products and local farmers near you.
            </motion.p>
          </div>
        </header>

        <div className="container-page py-10 md:py-14">
          {/* Search + location + filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="md:flex-1 md:max-w-xl">
              <MarketSearch value={query} onChange={setQuery} />
            </div>
            <div className="flex items-stretch gap-3 md:ml-auto">
              <div className="flex-1 md:flex-none md:w-64">
                <LocationSelector value={location} onChange={setLocation} />
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                aria-label={`Open filters${activeCount ? `, ${activeCount} active` : ''}`}
                className="lg:hidden flex items-center gap-2 border border-forest/15 bg-white/80 px-5 text-sm text-forest-deep hover:border-olive/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
              >
                <FilterIcon />
                Filters
                {activeCount > 0 && (
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-olive text-[11px] text-forest-deep">{activeCount}</span>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[17rem_minmax(0,1fr)] gap-10 xl:gap-14 items-start">
            {/* Desktop filter panel */}
            <aside aria-label="Market filters" className="hidden lg:block sticky top-24 border border-forest/10 bg-cream-soft px-6 py-5">
              <MarketFilters filters={filters} onChange={setFilters} onClear={() => setFilters(DEFAULT_FILTERS)} />
            </aside>

            <section aria-labelledby="markets-heading" className="min-w-0">
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
                <h2 id="markets-heading" className="font-display text-2xl md:text-3xl text-forest-deep">
                  Discover Local Markets
                </h2>
                <p className="text-sm text-forest-deep/60" role="status" aria-live="polite">
                  {loading ? 'Loading markets…' : `${results.length} ${results.length === 1 ? 'market' : 'markets'} found`}
                </p>
              </div>

              {hasCriteria && !loading && (
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs text-forest-deep/60 hover:text-olive border-b border-forest/20 hover:border-olive transition-colors pb-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {loading ? (
                <MarketSkeletonGrid count={6} />
              ) : error ? (
                <MarketEmptyState title="Couldn't load markets" description={error} onAction={() => window.location.reload()} actionLabel="Retry" />
              ) : results.length === 0 ? (
                <MarketEmptyState onAction={clearAll} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                  {results.map((market, i) => (
                    <motion.div
                      key={market.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.05, ease: 'easeOut' }}
                    >
                      <MarketCard market={market} />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <MarketFilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)} filters={filters} onApply={setFilters} />
      <Footer />
    </>
  )
}
