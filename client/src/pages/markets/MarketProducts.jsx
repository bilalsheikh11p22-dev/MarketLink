import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import MarketPageShell from '../../components/market/MarketPageShell.jsx'
import MarketNotFound from '../../components/market/MarketNotFound.jsx'
import MarketSearch from '../../components/market/MarketSearch.jsx'
import MarketEmptyState from '../../components/market/MarketEmptyState.jsx'
import { MarketSkeletonGrid } from '../../components/market/MarketSkeleton.jsx'
import ProductCard from '../../components/discovery/ProductCard.jsx'
import useMarket from '../../hooks/useMarket.js'
import { PRODUCT_CATEGORIES, matchesCategory, matchesProductQuery } from '../../utils/marketUtils.js'

export default function MarketProducts() {
  const { id } = useParams()
  const { market, products: marketProducts, loading } = useMarket(id, { products: true })
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const results = useMemo(
    () => marketProducts.filter((p) => matchesCategory(p, category) && matchesProductQuery(p, query)),
    [marketProducts, category, query]
  )

  if (loading) return <p className="py-40 text-center text-sm text-forest/55">Loading…</p>
  if (!market) return <MarketNotFound />

  const clear = () => {
    setQuery('')
    setCategory('All')
  }

  return (
    <MarketPageShell
      market={market}
      eyebrow="Fresh from the stalls"
      title={`Products at ${market.name}`}
      subtitle="Everything currently listed by the farmers at this market."
      documentTitle={`Products · ${market.name}`}
    >
      <div className="flex flex-col gap-6 mb-8">
        <div className="max-w-xl">
          <MarketSearch
            value={query}
            onChange={setQuery}
            placeholder="Search by product, category or farmer"
            label="Search products at this market"
          />
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

      <p className="text-sm text-forest-deep/60 mb-6" role="status" aria-live="polite">
        {loading ? 'Loading products…' : `${results.length} ${results.length === 1 ? 'product' : 'products'} found`}
      </p>

      {loading ? (
        <MarketSkeletonGrid count={4} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" />
      ) : marketProducts.length === 0 ? (
        <MarketEmptyState
          title="No Products Yet"
          description="This market has no products listed right now."
          actionLabel="Browse Other Markets"
          to="/markets"
        />
      ) : results.length === 0 ? (
        <MarketEmptyState title="No Products Found" description="Try changing your search or category." onAction={clear} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </MarketPageShell>
  )
}
