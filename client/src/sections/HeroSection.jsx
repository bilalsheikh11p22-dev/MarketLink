import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import CTAButton from '../components/CTAButton.jsx'

export default function HeroSection() {
  const rootRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('[data-hero="label"]', { opacity: 0, y: 14, duration: 0.7 })
        .from('[data-hero="title"]', { opacity: 0, y: 26, duration: 0.9 }, '-=0.4')
        .from('[data-hero="text"]', { opacity: 0, y: 18, duration: 0.7 }, '-=0.55')
        .from('[data-hero="actions"]', { opacity: 0, y: 14, duration: 0.6 }, '-=0.45')
        .from('[data-hero="scroll"]', { opacity: 0, duration: 0.8 }, '-=0.2')
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={rootRef} className="relative min-h-screen flex flex-col justify-center">
      <div className="container-page">
        <div className="max-w-2xl">
          <span data-hero="label" className="block text-olive-light text-xs md:text-sm tracking-widest2 uppercase font-body mb-6">
            Local • Fresh • Connected
          </span>

          <h1 data-hero="title" className="font-display text-5xl sm:text-6xl md:text-7xl leading-[1.03] text-cream">
            From Local Farms to Your Table
          </h1>

          <p data-hero="text" className="mt-7 font-body text-base md:text-lg text-cream/80 leading-relaxed max-w-lg">
            MarketLink connects you with the farmers who grow your food and the markets that bring
            it to your neighborhood — fresh, transparent and easy to plan around.
          </p>

          <div data-hero="actions" className="mt-10 flex flex-col sm:flex-row gap-4">
            <CTAButton to="/markets">Explore Markets</CTAButton>
            <CTAButton variant="outline" to="/farmers">Discover Farmers</CTAButton>
          </div>
        </div>
      </div>

      <div
        data-hero="scroll"
        className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-3 text-cream/60"
      >
        <span className="text-xs tracking-widest2 uppercase font-body">Scroll to explore</span>
        <span className="block h-10 w-px bg-cream/40 animate-pulse" />
      </div>
    </div>
  )
}
