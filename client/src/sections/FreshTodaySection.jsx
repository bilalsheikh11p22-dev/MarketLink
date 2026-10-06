import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProductShowcase from '../components/discovery/ProductShowcase.jsx'
import useCatalog from '../hooks/useCatalog.js'

export default function FreshTodaySection() {
  const { products } = useCatalog()
  const featured = products.slice(0, 6)
  if (featured.length === 0) return null

  return (
    <section className="bg-cream-soft py-20 md:py-28">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <span className="block text-olive text-xs tracking-widest2 uppercase font-body mb-3">This Week</span>
            <h2 className="font-display text-3xl md:text-4xl text-forest-deep">Fresh Today</h2>
          </div>
          <Link to="/products" className="hidden sm:inline text-sm font-medium text-olive hover:underline">
            View all →
          </Link>
        </motion.div>
      </div>

      <div className="container-page">
        <ProductShowcase items={featured} />
        <div className="mt-10 flex justify-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-xl border border-forest/15 bg-cream px-6 py-3 text-sm font-medium text-forest-deep hover:bg-forest hover:text-cream transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
          >
            Explore more products →
          </Link>
        </div>
      </div>
    </section>
  )
}
