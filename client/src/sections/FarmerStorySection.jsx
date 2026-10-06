import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import CTAButton from '../components/CTAButton.jsx'

/**
 * Cinematic storytelling section that bridges the discovery area and
 * MarketLink's mission. Background image has a subtle parallax; the
 * text reveals with a gentle scale as the section enters view.
 */
export default function FarmerStorySection({ onMeetFarmers }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <section ref={ref} className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-forest-deep">
        <motion.img
          style={{ y: imageY }}
          src="/images/farmer-1.jpg"
          alt=""
          loading="lazy"
          className="absolute inset-0 h-[118%] w-full -top-[9%] object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <div className="absolute inset-0 bg-forest-deep" style={{ opacity: 0.55 }} />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/40 to-forest-deep/60" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="container-page"
      >
        <div className="max-w-xl">
          <span className="block text-olive-light text-xs md:text-sm tracking-widest2 uppercase font-body mb-5">
            The People Behind Your Food
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-cream leading-[1.05]">
            Know Who Grows What You Eat
          </h2>
          <p className="mt-6 text-cream/80 text-base md:text-lg leading-relaxed max-w-md">
            MarketLink brings customers closer to the farmers who grow their food.
          </p>
          <CTAButton variant="outline" className="mt-8" onClick={onMeetFarmers}>
            Meet Our Farmers
          </CTAButton>
        </div>
      </motion.div>
    </section>
  )
}
