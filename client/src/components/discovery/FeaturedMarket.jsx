import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import CTAButton from '../CTAButton.jsx'

/**
 * Large cinematic "market of the week" spotlight. Image has a gentle
 * scroll-linked parallax; text reveals once the section enters view.
 */
export default function FeaturedMarket({ market }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 min-h-[70vh]">
      <div className="relative overflow-hidden bg-forest-deep">
        <motion.img
          style={{ y: imageY }}
          src={market.image}
          alt={market.name}
          loading="lazy"
          className="absolute inset-0 h-[112%] w-full -top-[6%] object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <div className="absolute inset-0 bg-forest-deep/25" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="flex flex-col justify-center gap-5 bg-forest-deep px-8 py-16 md:px-16"
      >
        <span className="text-olive-light text-xs tracking-widest2 uppercase font-body">Market of the Week</span>
        <h2 className="font-display text-4xl md:text-5xl text-cream leading-[1.08]">{market.name}</h2>
        <p className="text-cream/75 max-w-md leading-relaxed">
          Fresh produce, local farmers and a community-driven market experience.
        </p>

        <div className="flex items-center gap-8 pt-2">
          <div>
            <p className="font-display text-2xl text-cream">{market.farmersCount}</p>
            <p className="text-cream/55 text-xs mt-1">Farmers</p>
          </div>
          <div>
            <p className="font-display text-2xl text-cream">{market.productsCount}</p>
            <p className="text-cream/55 text-xs mt-1">Products</p>
          </div>
          {market.rating ? (
            <div>
              <p className="font-display text-2xl text-cream">{market.rating}</p>
              <p className="text-cream/55 text-xs mt-1">Rating</p>
            </div>
          ) : null}
        </div>

        <CTAButton to={`/markets/${market.id}`} variant="outline" className="mt-4 w-fit">
          Explore Market →
        </CTAButton>
      </motion.div>
    </div>
  )
}
