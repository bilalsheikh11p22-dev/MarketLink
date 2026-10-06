import { useParams } from 'react-router-dom'
import MarketPageShell from '../../components/market/MarketPageShell.jsx'
import MarketNotFound from '../../components/market/MarketNotFound.jsx'
import MarketFarmerCard from '../../components/market/MarketFarmerCard.jsx'
import MarketEmptyState from '../../components/market/MarketEmptyState.jsx'
import { MarketSkeletonGrid } from '../../components/market/MarketSkeleton.jsx'
import useMarket from '../../hooks/useMarket.js'

export default function MarketFarmers() {
  const { id } = useParams()
  const { market, farmers, loading } = useMarket(id, { farmers: true })

  if (loading) return <p className="py-40 text-center text-sm text-forest/55">Loading…</p>
  if (!market) return <MarketNotFound />


  return (
    <MarketPageShell
      market={market}
      eyebrow="Meet the growers"
      title={`Farmers at ${market.name}`}
      subtitle="The people behind the produce — get to know the farms that sell here."
      documentTitle={`Farmers · ${market.name}`}
    >
      <p className="text-sm text-forest-deep/60 mb-6" role="status" aria-live="polite">
        {loading ? 'Loading farmers…' : `${farmers.length} ${farmers.length === 1 ? 'farmer' : 'farmers'} listed`}
      </p>

      {loading ? (
        <MarketSkeletonGrid count={3} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" />
      ) : farmers.length === 0 ? (
        <MarketEmptyState
          title="No Farmers Yet"
          description="No farmers are listed for this market right now. Check back soon."
          actionLabel="Browse Other Markets"
          to="/markets"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {farmers.map((f) => (
            <MarketFarmerCard key={f.id} farmer={f} />
          ))}
        </div>
      )}
    </MarketPageShell>
  )
}
