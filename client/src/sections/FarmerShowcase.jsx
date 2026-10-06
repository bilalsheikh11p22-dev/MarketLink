import { motion } from 'framer-motion'
import FarmerPreviewCard from '../components/farmer/FarmerPreviewCard.jsx'
import useCatalog from '../hooks/useCatalog.js'

export default function FarmerShowcase() {
  const { farmers } = useCatalog()
  const featured = farmers.slice(0, 4)
  if (featured.length === 0) return null

  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-10"
        >
          <span className="block text-olive text-xs tracking-widest2 uppercase font-body mb-3">Real People, Real Farms</span>
          <h2 className="font-display text-3xl md:text-4xl text-forest-deep">Meet the Farmers</h2>
        </motion.div>
      </div>

      <div className="container-page">
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6 md:-mx-10 md:px-10 lg:-mx-16 lg:px-16 snap-x snap-mandatory">
          {featured.map((farmer) => (
            <div key={farmer.id} className="snap-start">
              <FarmerPreviewCard farmer={farmer} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
