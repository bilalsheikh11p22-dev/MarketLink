import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DiscoveryTabs from '../components/discovery/DiscoveryTabs.jsx'
import SearchBar from '../components/discovery/SearchBar.jsx'
import LocationSelector from '../components/discovery/LocationSelector.jsx'
import FilterButton from '../components/discovery/FilterButton.jsx'
import FilterDrawer from '../components/discovery/FilterDrawer.jsx'
import MarketCard from '../components/discovery/MarketCard.jsx'
import FarmerCard from '../components/discovery/FarmerCard.jsx'
import ProductCard from '../components/discovery/ProductCard.jsx'
import useCatalog from '../hooks/useCatalog.js'

const EMPTY_FILTERS = { category: [], price: [], availability: [], rating: [], distance: [] }

function matchesQuery(item, tab, query) {
  if (!query.trim()) return true
  const q = query.trim().toLowerCase()
  if (tab === 'Markets')
    return [item.name, item.location, item.address].some((f) => f.toLowerCase().includes(q))
  if (tab === 'Farmers')
    return (
      item.name.toLowerCase().includes(q) ||
      item.farm.toLowerCase().includes(q) ||
      item.specialty.toLowerCase().includes(q)
    )
  return item.name.toLowerCase().includes(q)
}

function matchesFilters(item, tab, filters) {
  if (tab === 'Products') {
    if (filters.category.length && !filters.category.includes(item.category)) return false
    if (filters.availability.length) {
      const wantsAvailable = filters.availability.includes('available')
      const wantsSoldOut = filters.availability.includes('sold-out')
      if (wantsAvailable && !wantsSoldOut && !item.available) return false
      if (wantsSoldOut && !wantsAvailable && item.available) return false
    }
    if (filters.price.length) {
      const inRange = filters.price.some((p) => {
        if (p === 'under-200') return item.price < 200
        if (p === '200-500') return item.price >= 200 && item.price <= 500
        if (p === 'over-500') return item.price > 500
        return true
      })
      if (!inRange) return false
    }
  }

  if (tab === 'Products' || tab === 'Farmers') {
    if (filters.rating.length) {
      const meetsRating = filters.rating.some((min) => item.rating >= min)
      if (!meetsRating) return false
    }
  }

  if (tab === 'Products' || tab === 'Markets') {
    if (filters.distance.length) {
      const distance = tab === 'Products' ? item.distance : item.distanceKm
      const withinRange = filters.distance.some((max) => distance <= max)
      if (!withinRange) return false
    }
  }

  return true
}

const gridCols = {
  Markets: 'sm:grid-cols-2 lg:grid-cols-3',
  Farmers: 'sm:grid-cols-2 lg:grid-cols-3',
  Products: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
}

export default function ExploreSection({ activeTab, onTabChange }) {
  const { markets, farmers, products } = useCatalog()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const sourceData = activeTab === 'Markets' ? markets : activeTab === 'Farmers' ? farmers : products

  const results = useMemo(
    () => sourceData.filter((item) => matchesQuery(item, activeTab, query) && matchesFilters(item, activeTab, filters)),
    [sourceData, activeTab, query, filters]
  )

  const activeFilterCount = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0)

  const toggleFilter = (group, value) => {
    setFilters((prev) => {
      const has = prev[group].includes(value)
      return { ...prev, [group]: has ? prev[group].filter((v) => v !== value) : [...prev[group], value] }
    })
  }

  const clearFilters = () => setFilters(EMPTY_FILTERS)

  return (
    <section id="discover" className="relative bg-cream py-24 md:py-32 overflow-hidden">
      {/* subtle organic texture */}
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 15% 0%, #EFE8D6 0%, transparent 55%), radial-gradient(ellipse at 100% 30%, #EFE8D6 0%, transparent 45%)' }}
      />

      <div className="container-page relative">
        {/* Intro */}
        <div className="relative max-w-2xl mb-16">
          <motion.svg
            initial={{ rotate: -8, opacity: 0 }}
            whileInView={{ rotate: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            width="42"
            height="42"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#A98B4F"
            strokeWidth="1.3"
            className="mb-5"
            aria-hidden="true"
          >
            <path d="M20 4C10 4 4 10 4 19c8 0 15-5 16-15Z" />
            <path d="M6 18c3-3 7-6 13-13" />
          </motion.svg>

          <span className="block text-olive text-xs md:text-sm tracking-widest2 uppercase font-body mb-4">
            Discover Local
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-forest-deep leading-[1.08]">
            Everything Fresh, Right Around You
          </h2>
          <p className="mt-5 text-forest-deep/70 text-base md:text-lg leading-relaxed max-w-lg">
            Explore local markets, meet nearby farmers, and discover fresh products available in your community.
          </p>
        </div>

        {/* Tabs */}
        <DiscoveryTabs active={activeTab} onChange={onTabChange} />

        {/* Search + Location + Filter */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mt-8 mb-10">
          <SearchBar value={query} onChange={setQuery} placeholder={`Search ${activeTab.toLowerCase()}...`} />
          <div className="flex items-center gap-3 md:ml-auto">
            <LocationSelector />
            <FilterButton onClick={() => setDrawerOpen(true)} activeCount={activeFilterCount} />
          </div>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {results.length === 0 ? (
              <div className="py-20 text-center text-forest-deep/50">
                <p className="font-display text-2xl text-forest-deep mb-2">No results found</p>
                <p className="text-sm">Try a different search term or clear your filters.</p>
              </div>
            ) : (
              <div className={`grid grid-cols-1 ${gridCols[activeTab]} gap-6 md:gap-8`}>
                {results.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: Math.min(i, 6) * 0.06, ease: 'easeOut' }}
                  >
                    {activeTab === 'Markets' && <MarketCard market={item} />}
                    {activeTab === 'Farmers' && <FarmerCard farmer={item} />}
                    {activeTab === 'Products' && <ProductCard product={item} />}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onToggle={toggleFilter}
        onClear={clearFilters}
      />
    </section>
  )
}
