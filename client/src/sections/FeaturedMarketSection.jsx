import FeaturedMarket from '../components/discovery/FeaturedMarket.jsx'
import useCatalog from '../hooks/useCatalog.js'

export default function FeaturedMarketSection() {
  const { markets } = useCatalog()
  const featured = markets.find((m) => m.coordinates) || markets[0]
  if (!featured) return null
  return (
    <section aria-label="Featured market">
      <FeaturedMarket market={featured} />
    </section>
  )
}
