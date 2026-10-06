import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import FavoriteButton from '../components/favorites/FavoriteButton.jsx'
import ProductCard from '../components/discovery/ProductCard.jsx'
import ReviewsSection from '../components/reviews/ReviewsSection.jsx'
import MarketEmptyState from '../components/market/MarketEmptyState.jsx'
import { InlineLoader } from '../components/common/PageLoader.jsx'
import { PinIcon, StarIcon } from '../components/market/MarketIcons.jsx'
import * as farmerService from '../services/farmerService.js'
import { normalizeFarmer, normalizeList, normalizeProduct } from '../utils/normalize.js'
import FarmerImage from '../components/image/FarmerImage.jsx'

export default function FarmerDetails() {
  const { id } = useParams()
  const [farmer, setFarmer] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    Promise.all([farmerService.getFarmer(id), farmerService.getFarmerProducts(id)])
      .then(([farmerRes, productsRes]) => {
        if (cancelled) return
        const f = normalizeFarmer(farmerRes.data?.farmer)
        setFarmer(f)
        setProducts(normalizeList(productsRes.data?.products, normalizeProduct))
        document.title = `${f ? f.name : 'Farmer'} — MarketLink`
      })
      .catch(() => { if (!cancelled) setNotFound(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-cream pt-32"><InlineLoader /></div>
        <Footer />
      </>
    )
  }

  if (notFound || !farmer) {
    return (
      <>
        <Navbar />
        <main className="bg-cream min-h-screen pt-32 pb-24">
          <div className="container-page max-w-2xl">
            <MarketEmptyState title="Farmer not found" description="This farmer profile may have moved." actionLabel="Browse Farmers" to="/farmers" />
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const market = farmer.market

  return (
    <>
      <Navbar />
      <main className="bg-cream min-h-screen">
        <header className="relative bg-forest-deep">
          <div className="relative h-64 sm:h-80 md:h-[26rem] overflow-hidden">
            <FarmerImage fill priority src={farmer.farmImage || farmer.image} alt={`${farmer.name}, ${farmer.farm}`} className="object-top" />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-forest-deep/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/70 via-45% to-forest-deep/20" />
          </div>

          <div className="container-page pb-10 md:pb-14 -mt-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div>
                <h1 className="font-display text-4xl sm:text-5xl text-cream leading-[1.05]">{farmer.name}</h1>
                <p className="mt-2 text-cream/80">{farmer.farm}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-cream/85">
                  <span className="flex items-center gap-2">
                    <StarIcon size={15} className="text-olive-light" />
                    {farmer.rating}
                  </span>
                  {farmer.location && (
                    <span className="flex items-center gap-2">
                      <PinIcon size={15} className="text-olive-light" />
                      {farmer.location}
                    </span>
                  )}
                  <span>{products.length} Products</span>
                </div>
              </div>
              <FavoriteButton type="farmer" entity={farmer} variant="pill-dark" />
            </motion.div>
          </div>
        </header>

        <div className="container-page py-10 md:py-14 flex flex-col gap-14 md:gap-20">
          <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-10 items-start">
            <div>
              <span className="block text-olive text-xs tracking-widest2 uppercase mb-3">About the farm</span>
              <h2 className="font-display text-2xl md:text-3xl text-forest-deep mb-4">{farmer.specialty || farmer.farm}</h2>
              <p className="text-forest-deep/75 leading-relaxed max-w-xl">
                {farmer.description || `${farmer.farm} brings fresh produce to`}{' '}
                {market ? (
                  <Link to={`/markets/${market.id}`} className="text-forest-deep hover:text-olive underline-offset-4 hover:underline">
                    {market.name}
                  </Link>
                ) : (
                  'their local market'
                )}
                .
              </p>
            </div>

            {market && (
              <div className="border border-forest/10 bg-cream-soft p-6">
                <p className="text-xs tracking-widest2 uppercase text-olive mb-3">Sells at</p>
                <p className="font-display text-xl text-forest-deep mb-1">{market.name}</p>
                <Link
                  to={`/markets/${market.id}`}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-forest-deep text-cream hover:bg-forest-light transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
                >
                  View Market <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </section>

          <section>
            <span className="block text-olive text-xs tracking-widest2 uppercase mb-3">Fresh from this farm</span>
            <h2 className="font-display text-2xl md:text-3xl text-forest-deep mb-6">Products</h2>
            {products.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <p className="text-forest-deep/60 text-sm">No products listed yet.</p>
            )}
          </section>

          <ReviewsSection kind="farmer" farmer={farmer} />
        </div>
      </main>
      <Footer />
    </>
  )
}
