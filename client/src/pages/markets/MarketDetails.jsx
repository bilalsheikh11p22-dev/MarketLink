import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import MarketPageShell from '../../components/market/MarketPageShell.jsx'
import MarketNotFound from '../../components/market/MarketNotFound.jsx'
import MarketHours from '../../components/market/MarketHours.jsx'
import MarketLocation from '../../components/market/MarketLocation.jsx'
import MarketGallery from '../../components/market/MarketGallery.jsx'
import MarketFarmerCard from '../../components/market/MarketFarmerCard.jsx'
import ProductCard from '../../components/discovery/ProductCard.jsx'
import CTAButton from '../../components/CTAButton.jsx'
import { PinIcon, StarIcon } from '../../components/market/MarketIcons.jsx'
import FavoriteButton from '../../components/favorites/FavoriteButton.jsx'
import useMarket from '../../hooks/useMarket.js'
import { getDirectionsUrl, getMarketStatus } from '../../utils/marketUtils.js'
import MarketImage from '../../components/image/MarketImage.jsx'

const STATUS_DOT = { open: 'bg-sage', 'opens-later': 'bg-olive', closed: 'bg-cream/40' }

function MarketHero({ market }) {
  const status = getMarketStatus(market)

  return (
    <header className="relative bg-forest-deep">
      <div className="relative h-72 sm:h-96 md:h-[36rem] overflow-hidden">
        <MarketImage fill priority src={market.image} alt={`${market.name} market`} />
        {/* top shade keeps the Navbar readable; bottom shade (desktop) carries the text */}
        <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/75 via-forest-deep/5 to-transparent md:hidden" />
        <div className="absolute inset-x-0 top-0 h-40 hidden md:block bg-gradient-to-b from-forest-deep/70 to-transparent" />
        <div className="absolute inset-0 hidden md:block bg-gradient-to-t from-forest-deep via-forest-deep/75 via-45% to-forest-deep/30" />
      </div>

      <div className="md:absolute md:inset-x-0 md:bottom-0 px-0">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="container-page py-8 md:pb-12 md:pt-0"
        >
          <span className="inline-flex items-center gap-2 text-cream/80 text-xs mb-4" role="status">
            <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status.state]}`} aria-hidden="true" />
            {status.label}
          </span>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-[1.05] max-w-3xl">{market.name}</h1>
              <Link to={`/markets/${market.id}/analytics`} className="mt-3 inline-block text-sm font-medium text-olive-light hover:text-cream transition-colors">View market analytics →</Link>
            </div>
            <FavoriteButton type="market" entity={market} variant="pill-dark" className="shrink-0" />
          </div>

          <p className="mt-3 flex items-center gap-2 text-cream/80">
            <PinIcon size={16} className="text-olive-light" />
            {[market.location, market.city].filter(Boolean).join(', ')}
          </p>

          <ul className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-cream">
            {market.rating ? (
              <li className="flex items-center gap-2">
                <StarIcon size={16} className="text-olive-light" />
                <span className="font-display text-xl">{market.rating}</span>
                <span className="sr-only">rating</span>
              </li>
            ) : null}
            <li>
              <span className="font-display text-xl">{market.farmersCount}</span> <span className="text-cream/65 text-sm">Farmers</span>
            </li>
            <li>
              <span className="font-display text-xl">{market.productsCount}</span> <span className="text-cream/65 text-sm">Products</span>
            </li>
          </ul>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3">
            <CTAButton to={`/markets/${market.id}/products`}>Explore Products</CTAButton>
            <CTAButton to={`/markets/${market.id}/farmers`} variant="outline">
              Meet Farmers
            </CTAButton>
            <CTAButton to={`/markets/${market.id}/map`} variant="outline">
              View on Map
            </CTAButton>
            <CTAButton href={getDirectionsUrl(market)} external variant="outline">
              Get Directions <span aria-hidden="true">↗</span>
              <span className="sr-only">(opens in a new tab)</span>
            </CTAButton>
          </div>
        </motion.div>
      </div>
    </header>
  )
}

function Stat({ value, label }) {
  return (
    <div className="border border-forest/10 bg-cream-soft px-5 py-5">
      <p className="font-display text-2xl md:text-3xl text-forest-deep">{value}</p>
      <p className="text-xs text-forest-deep/55 mt-1">{label}</p>
    </div>
  )
}

function SectionHeading({ eyebrow, title, to, linkLabel }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <span className="block text-olive text-xs tracking-widest2 uppercase mb-2">{eyebrow}</span>
        <h2 className="font-display text-2xl md:text-3xl text-forest-deep">{title}</h2>
      </div>
      {to && (
        <Link to={to} className="shrink-0 text-sm text-forest-deep hover:text-olive transition-colors focus:outline-none focus-visible:underline">
          {linkLabel} →
        </Link>
      )}
    </div>
  )
}

export default function MarketDetails() {
  const { id } = useParams()
  const { market, farmers, products, loading } = useMarket(id, { farmers: true, products: true })

  if (loading) return <p className="py-40 text-center text-sm text-forest/55">Loading market…</p>
  if (!market) return <MarketNotFound />

  return (
    <MarketPageShell market={market} hero={<MarketHero market={market} />} documentTitle={market.name}>
      <div className="flex flex-col gap-16 md:gap-20">
        {/* Stats */}
        <section aria-label="Market statistics" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <Stat value={market.farmersCount} label="Farmers" />
          <Stat value={market.productsCount} label="Products" />
          {market.rating ? <Stat value={market.rating} label="Rating" /> : null}
        </section>

        {/* About + hours + location */}
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-10 lg:gap-14 items-start">
          <div className="flex flex-col gap-8">
            <div>
              <span className="block text-olive text-xs tracking-widest2 uppercase mb-3">About</span>
              <h2 className="font-display text-2xl md:text-3xl text-forest-deep mb-4">About this market</h2>
              <p className="text-forest-deep/75 leading-relaxed max-w-xl">{market.description}</p>
              <p className="text-forest-deep/60 text-sm mt-4">{market.address}</p>
            </div>
            <MarketHours market={market} />
          </div>
          <MarketLocation market={market} />
        </section>

        {/* Gallery */}
        <section aria-labelledby="gallery-title">
          <SectionHeading eyebrow="Inside the market" title="Gallery" />
          <span id="gallery-title" className="sr-only">
            Market gallery
          </span>
          <MarketGallery images={market.gallery} name={market.name} />
        </section>

        {/* Farmers preview */}
        <section>
          <SectionHeading eyebrow="Meet the growers" title="Farmers here" to={`/markets/${market.id}/farmers`} linkLabel="View all farmers" />
          {farmers.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {farmers.slice(0, 3).map((f) => (
                <MarketFarmerCard key={f.id} farmer={f} />
              ))}
            </div>
          ) : (
            <p className="text-forest-deep/60 text-sm">Farmers for this market will appear here soon.</p>
          )}
        </section>

        {/* Products preview */}
        <section>
          <SectionHeading eyebrow="Fresh this week" title="Products here" to={`/markets/${market.id}/products`} linkLabel="View all products" />
          {products.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-forest-deep/60 text-sm">Products for this market will appear here soon.</p>
          )}
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-forest-deep px-6 py-16 md:py-24 text-center">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sage/10 blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-olive/10 blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-cream leading-[1.1]">Ready to Explore Local?</h2>
            <p className="mt-5 text-cream/75 max-w-md mx-auto">
              Browse what’s fresh at {market.name}, meet the people who grow it, and plan your visit.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
              <CTAButton to={`/markets/${market.id}/products`} className="w-full sm:w-auto">
                Browse Products
              </CTAButton>
              <CTAButton to={`/markets/${market.id}/farmers`} variant="outline" className="w-full sm:w-auto">
                Meet Farmers
              </CTAButton>
              <CTAButton to={`/markets/${market.id}/map`} variant="outline" className="w-full sm:w-auto">
                View Location
              </CTAButton>
            </div>
          </div>
        </section>
      </div>
    </MarketPageShell>
  )
}
