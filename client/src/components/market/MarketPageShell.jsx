import { useEffect } from 'react'
import Navbar from '../Navbar.jsx'
import Footer from '../Footer.jsx'
import MarketBreadcrumbs from './MarketBreadcrumbs.jsx'
import MarketTabs from './MarketTabs.jsx'
import { OrganicLeaf } from './MarketIcons.jsx'

/**
 * Shared frame for every /markets/:id/* page: Navbar, a hero (custom
 * `hero` node for the details page, or the compact dark header for the
 * sub pages), breadcrumbs, local tabs, content and Footer.
 */
export default function MarketPageShell({ market, title, eyebrow, subtitle, hero, documentTitle, children }) {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = `${documentTitle ?? title ?? market.name} — MarketLink`
  }, [market.id, documentTitle, title])

  return (
    <>
      <Navbar />
      <main className="bg-cream min-h-screen">
        {hero ?? (
          <header className="relative overflow-hidden bg-forest-deep pt-32 pb-12 md:pt-40 md:pb-16">
            <OrganicLeaf className="absolute -right-32 -top-24 h-[28rem] w-[28rem] opacity-60 pointer-events-none" />
            <div className="container-page relative">
              {eyebrow && <span className="block text-olive-light text-xs tracking-widest2 uppercase mb-4">{eyebrow}</span>}
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-cream leading-[1.1] max-w-3xl">{title}</h1>
              {subtitle && <p className="mt-4 text-cream/70 max-w-xl">{subtitle}</p>}
            </div>
          </header>
        )}

        <div className="container-page">
          <div className="py-5">
            <MarketBreadcrumbs marketName={market.name} />
          </div>
          <MarketTabs marketId={market.id} />
          <div className="py-10 md:py-14">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  )
}
