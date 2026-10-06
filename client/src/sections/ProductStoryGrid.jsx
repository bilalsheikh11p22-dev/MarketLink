import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'
import ProductCard from '../components/discovery/ProductCard.jsx'
import ImageWithLoader from '../components/common/ImageWithLoader.jsx'
import useCatalog from '../hooks/useCatalog.js'

gsap.registerPlugin(ScrollTrigger)

const CATEGORIES = ['Vegetables', 'Fruits', 'Herbs', 'Dairy', 'Grains']

export default function ProductStoryGrid() {
  const { products } = useCatalog()
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0])
  const root = useRef(null)

  const filtered = useMemo(
    () => products.filter((p) => p.category === activeCategory),
    [products, activeCategory]
  )
  const feature = filtered[0]
  const rest = filtered.slice(1)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-product="intro"]', {
        y: 50,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 80%' },
      })

      gsap.from('[data-product="tabs"] button', {
        y: 20,
        opacity: 0,
        stagger: 0.08,
        duration: 0.5,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 70%' },
      })
    }, root)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-product="feature"]', {
        x: -60,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
      })

      gsap.from('[data-product="card"]', {
        y: 45,
        opacity: 0,
        scale: 0.96,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out',
      })

      gsap.fromTo(
        '[data-product="image"]',
        { scale: 1.08, y: 20 },
        { scale: 1, y: 0, duration: 1.1, ease: 'power3.out' }
      )
    }, root)

    return () => ctx.revert()
  }, [activeCategory, products])

  return (
    <section ref={root} className="relative overflow-hidden bg-cream-soft py-24 md:py-32">
      <div className="container-page">

        <div data-product="intro" className="max-w-xl mb-12">
          <span className="block text-olive text-xs tracking-widest2 uppercase font-body mb-3">
            By Category
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-forest-deep">
            Fresh From Local Farms
          </h2>
        </div>

        <div
          data-product="tabs"
          className="flex items-center gap-2 overflow-x-auto overflow-y-hidden pb-1 mb-12 border-b border-forest/10"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-5 py-3 text-sm tracking-wide border-b-2 -mb-px transition-colors ${
                activeCategory === cat
                  ? 'text-forest-deep border-olive'
                  : 'text-forest-deep/50 border-transparent hover:text-forest-deep/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {!feature ? (
          <p className="py-16 text-center text-forest-deep/50">
            No products in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">

            <Link
              data-product="feature"
              to={`/products/${feature.id}`}
              className="group relative flex flex-col overflow-hidden bg-forest-deep aspect-[4/3] sm:aspect-[16/10] justify-end"
            >
              <div data-product="image" className="absolute inset-0 will-change-transform">
                <ImageWithLoader
                  src={feature.images?.[0]}
                  alt={feature.name}
                  wrapperClassName="absolute inset-0 h-full w-full"
                  className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/50 to-transparent" />

              <div className="relative p-8 md:p-10 text-cream">
                <span className="block text-olive-light text-xs tracking-widest2 uppercase font-body mb-4">
                  {feature.category}
                </span>

                <h3 className="font-display text-3xl md:text-4xl leading-snug mb-3">
                  Fresh From {feature.farmer.name}
                </h3>

                <p className="text-cream/70 text-sm mb-6">Starting from</p>

                <p className="font-display text-2xl mb-6">
                  Rs. {feature.price}{' '}
                  <span className="text-base font-body text-cream/60">
                    / {feature.unit}
                  </span>
                </p>

                <div className="flex items-center gap-2 text-sm text-cream/80 mb-6">
                  <span className={`h-1.5 w-1.5 rounded-full ${feature.available ? 'bg-sage' : 'bg-cream/30'}`} />
                  {feature.available ? 'Available' : 'Sold Out'}
                </div>

                <span className="inline-flex items-center gap-2 text-sm border-b border-olive-light/70 pb-1 group-hover:gap-3 transition-all">
                  View Product <span>→</span>
                </span>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-5">
              {rest.length === 0 ? (
                <p className="col-span-2 text-center py-10 text-forest-deep/50">
                  No other products in {activeCategory} yet.
                </p>
              ) : (
                rest.map((product) => (
                  <div key={product.id} data-product="card">
                    <ProductCard product={product} />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}