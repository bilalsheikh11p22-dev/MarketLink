import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import MarketSearch from '../components/market/MarketSearch.jsx'
import MarketEmptyState from '../components/market/MarketEmptyState.jsx'
import FarmerCard from '../components/discovery/FarmerCard.jsx'
import { InlineLoader } from '../components/common/PageLoader.jsx'
import { OrganicLeaf } from '../components/market/MarketIcons.jsx'
import * as farmerService from '../services/farmerService.js'
import { normalizeFarmer, normalizeList } from '../utils/normalize.js'

export default function Farmers() {
  const [query, setQuery] = useState('')
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'All Farmers — MarketLink'
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    farmerService
      .getFarmers()
      .then((res) => { if (!cancelled) setFarmers(normalizeList(res.data?.farmers, normalizeFarmer)) })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load farmers.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return farmers
    return farmers.filter((f) => [f.name, f.farm, f.specialty, f.location, f.marketName].some((field) => (field || '').toLowerCase().includes(q)))
  }, [farmers, query])

  return (
    <>
      <Navbar />
      <main className="bg-cream min-h-screen">
        <header className="relative overflow-hidden bg-forest-deep pt-32 pb-12 md:pt-40 md:pb-16">
          <OrganicLeaf className="absolute -right-32 -top-24 h-[28rem] w-[28rem] opacity-60 pointer-events-none" />
          <div className="container-page relative">
            <span className="block text-olive-light text-xs tracking-widest2 uppercase mb-4">Meet the Growers</span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-[1.06]">All Farmers</h1>
            <p className="mt-4 text-cream/75 max-w-xl">The people behind the produce, across every MarketLink market.</p>
          </div>
        </header>

        <div className="container-page py-10 md:py-14">
          <div className="max-w-xl mb-8">
            <MarketSearch value={query} onChange={setQuery} placeholder="Search by name, farm, specialty or market" label="Search all farmers" />
          </div>

          {loading ? (
            <InlineLoader />
          ) : error ? (
            <MarketEmptyState title="Couldn't load farmers" description={error} onAction={() => window.location.reload()} actionLabel="Retry" />
          ) : (
            <>
              <p className="text-sm text-forest-deep/60 mb-6" role="status" aria-live="polite">
                {results.length} {results.length === 1 ? 'farmer' : 'farmers'} found
              </p>

              {results.length === 0 ? (
                <MarketEmptyState title="No Farmers Found" description="Try a different search." onAction={() => setQuery('')} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.map((f, i) => (
                    <motion.div key={f.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.03 }}>
                      <FarmerCard farmer={f} />
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
