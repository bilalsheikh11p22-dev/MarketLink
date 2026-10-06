import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import MarketSearch from '../components/market/MarketSearch.jsx'
import MarketEmptyState from '../components/market/MarketEmptyState.jsx'
import ProductCard from '../components/discovery/ProductCard.jsx'
import { InlineLoader } from '../components/common/PageLoader.jsx'
import { OrganicLeaf } from '../components/market/MarketIcons.jsx'
import * as productService from '../services/productService.js'
import { normalizeList, normalizeProduct } from '../utils/normalize.js'
import { PRODUCT_CATEGORIES, matchesCategory, matchesProductQuery } from '../utils/marketUtils.js'

export default function Products() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'All Products — MarketLink'
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    productService
      .getProducts({ limit: 100 })
      .then((res) => {
        if (cancelled) return
        setProducts(normalizeList(res.data?.items, normalizeProduct))
      })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load products.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const results = useMemo(() => products.filter((p) => matchesCategory(p, category) && matchesProductQuery(p, query)), [products, category, query])
  const clear = () => {
    setQuery('')
    setCategory('All')
  }

  return (
    <>
      <Navbar />
      <main className="bg-cream min-h-screen">
        <header className="relative overflow-hidden bg-forest-deep pt-32 pb-12 md:pt-40 md:pb-16">
          <OrganicLeaf className="absolute -right-32 -top-24 h-[28rem] w-[28rem] opacity-60 pointer-events-none" />
          <div className="container-page relative">
            <span className="block text-olive-light text-xs tracking-widest2 uppercase mb-4">Fresh &amp; Local</span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-[1.06]">All Products</h1>
            <p className="mt-4 text-cream/75 max-w-xl">Everything currently listed by farmers across every MarketLink market.</p>
          </div>
        </header>

        <div className="container-page py-10 md:py-14">
          <div className="flex flex-col gap-6 mb-8">
            <div className="max-w-xl">
              <MarketSearch value={query} onChange={setQuery} placeholder="Search by product, category or farmer" label="Search all products" />
            </div>
            <div role="group" aria-label="Filter by category" className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 md:mx-0 md:px-0 pb-1">
              {PRODUCT_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={`shrink-0 px-4 py-2 text-sm border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive ${
                    category === c ? 'bg-forest-deep text-cream border-forest-deep' : 'border-forest/20 text-forest-deep/70 hover:border-olive/60'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <InlineLoader />
          ) : error ? (
            <MarketEmptyState title="Couldn't load products" description={error} onAction={() => window.location.reload()} actionLabel="Retry" />
          ) : (
            <>
              <p className="text-sm text-forest-deep/60 mb-6" role="status" aria-live="polite">
                {results.length} {results.length === 1 ? 'product' : 'products'} found
              </p>

              {results.length === 0 ? (
                <MarketEmptyState title="No Products Found" description="Try changing your search or category." onAction={clear} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.03 }}>
                      <ProductCard product={p} />
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
