import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

/**
 * Shared premium placeholder for routes not yet fully built
 * (/products, /farmers, /farmers/:id, /markets, /markets/:id).
 * Keeps the design system consistent until each gets its real page.
 */
export default function PlaceholderPage({ title, description }) {
  const params = useParams()
  const idNote = params.id ? ` #${params.id}` : ''

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-cream flex flex-col items-center justify-center text-center px-6 pt-24">
        <span className="text-olive text-xs tracking-widest2 uppercase font-body mb-4">Coming Soon</span>
        <h1 className="font-display text-4xl md:text-5xl text-forest-deep mb-4">
          {title}
          {idNote}
        </h1>
        <p className="text-forest-deep/65 max-w-md mb-8">{description}</p>
        <Link to="/" className="text-sm border-b border-olive text-forest-deep hover:text-olive transition-colors pb-1">
          Back to MarketLink
        </Link>
      </main>
      <Footer />
    </>
  )
}
