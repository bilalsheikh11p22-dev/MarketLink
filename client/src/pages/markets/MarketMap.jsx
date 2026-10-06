import { useParams } from 'react-router-dom'
import MarketPageShell from '../../components/market/MarketPageShell.jsx'
import MarketNotFound from '../../components/market/MarketNotFound.jsx'
import MarketHours from '../../components/market/MarketHours.jsx'
import MarketLocation from '../../components/market/MarketLocation.jsx'
import MarketMapView from '../../components/map/MarketMap.jsx'
import useMarket from '../../hooks/useMarket.js'

export default function MarketMapPage() {
  const { id } = useParams()
  const { market, loading } = useMarket(id)

  if (loading) return <p className="py-40 text-center text-sm text-forest/55">Loading…</p>
  if (!market) return <MarketNotFound />

  return (
    <MarketPageShell
      market={market}
      eyebrow={market.name}
      title="Market Location"
      subtitle={market.address || market.location}
      documentTitle={`Market Location · ${market.name}`}
    >
      <div className="flex flex-col gap-10">
        {/* Swap the map by editing components/map/mapConfig.js — this page stays the same. */}
        <MarketMapView market={market} zoom={14} height="h-[400px] sm:h-[480px] md:h-[640px]" className="border border-forest/10" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
          <MarketLocation market={market} showMap={false} showViewMap={false} />
          <MarketHours market={market} />
        </div>
      </div>
    </MarketPageShell>
  )
}
