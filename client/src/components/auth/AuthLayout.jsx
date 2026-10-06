import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { OrganicLeaf } from '../market/MarketIcons.jsx'

const MESSAGES = [
  'Fresh from the farm to your table.',
  'Meet the farmers behind your food.',
  'Reserve online. Pick up at your local market.',
  'Real markets. Real people. Real flavor.'
]

/**
 * Split-screen shell for Login / Register / Forgot Password.
 * Desktop: cinematic image left (slow zoom, forest overlay, rotating line),
 * form right. Mobile: image header, then the form. No Navbar/Footer — the
 * logo and "Back to home" link get you out.
 */
export default function AuthLayout({ title, subtitle, image = '/images/auth/auth-farm.jpg', children, wide = false }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 4200)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = `${title} — MarketLink`
  }, [title])

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* Visual side */}
      <aside className="relative overflow-hidden bg-forest-deep h-56 sm:h-72 lg:h-auto lg:min-h-screen lg:sticky lg:top-0 lg:self-start" aria-hidden="false">
        <motion.img
          src={image}
          alt=""
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/70 via-forest-deep/20 to-forest-deep/85" />
        <OrganicLeaf className="absolute -left-24 -bottom-24 h-[26rem] w-[26rem] opacity-50 hidden lg:block pointer-events-none" />

        <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8 lg:p-12">
          <Link to="/" className="font-display text-2xl lg:text-3xl text-cream tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-light w-fit">
            MarketLink
          </Link>

          <div>
            <p className="font-display text-3xl lg:text-5xl text-cream leading-[1.08] hidden sm:block">
              Fresh. Local.
              <br />
              Connected.
            </p>
            <div className="mt-4 hidden lg:block h-6 relative" aria-live="off">
              <AnimatePresence mode="wait">
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.45 }}
                  className="absolute inset-0 text-cream/80 text-base"
                >
                  {MESSAGES[index]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </aside>

      {/* Form side */}
      <main className="flex flex-col px-6 py-10 sm:px-12 lg:px-16 xl:px-24">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-forest-deep/60 hover:text-olive transition-colors w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-olive">
          <ArrowLeft size={16} aria-hidden="true" /> Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} mx-auto my-auto py-10`}
        >
          <span className="block h-px w-12 bg-olive mb-6" aria-hidden="true" />
          <h1 className="font-display text-4xl sm:text-5xl text-forest-deep leading-[1.08]">{title}</h1>
          {subtitle && <p className="mt-3 text-forest-deep/65">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </motion.div>
      </main>
    </div>
  )
}
