import { motion } from 'framer-motion'
import CTAButton from '../components/CTAButton.jsx'

/**
 * Final call-to-action. Deep forest green, with quiet organic shapes
 * (blurred circles) rather than literal illustration — one restrained
 * decorative moment to close the page before the footer.
 */
export default function CTASection({ onExploreMarkets, onBrowseProducts }) {
  return (
    <section className="relative bg-forest-deep py-24 md:py-32 overflow-hidden">
      <div
        className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sage/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-olive/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="container-page relative text-center"
      >
        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-[1.08] max-w-3xl mx-auto">
          Your Local Market Is Closer Than You Think.
        </h2>
        <p className="mt-6 text-cream/75 text-base md:text-lg max-w-xl mx-auto">
          Discover farmers, markets and fresh products around you.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <CTAButton to="/markets" onClick={onExploreMarkets} className="w-full sm:w-auto">
            Explore Markets
          </CTAButton>
          <CTAButton variant="outline" to="/products" onClick={onBrowseProducts} className="w-full sm:w-auto">
            Browse Products
          </CTAButton>
        </div>
      </motion.div>
    </section>
  )
}
