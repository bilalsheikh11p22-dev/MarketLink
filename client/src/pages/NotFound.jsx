import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-cream">
      <div className="max-w-md w-full text-center">
        <p className="font-display text-7xl sm:text-8xl text-forest/15 tracking-tight select-none">404</p>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl text-forest-deep">Page not found</h1>
        <p className="mt-3 text-sm text-forest/60 leading-relaxed">
          This path doesn&apos;t match any MarketLink page. The product may have moved, or the link might be outdated.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-sm font-medium text-cream hover:bg-forest-light focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
          >
            <Home size={16} aria-hidden /> Go Home
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-xl border border-forest/15 px-5 py-2.5 text-sm font-medium text-forest hover:bg-forest/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
          >
            <Search size={16} aria-hidden /> Browse products
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-forest/70 hover:text-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
          >
            <ArrowLeft size={16} aria-hidden /> Go back
          </button>
        </div>
      </div>
    </div>
  )
}
