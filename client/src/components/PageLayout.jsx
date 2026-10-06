import { useEffect } from 'react'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import { OrganicLeaf } from './market/MarketIcons.jsx'

/**
 * Standard frame for the standalone Step 7 pages: Navbar, a compact dark
 * MarketLink header, content, Footer. Keeps every page visually consistent
 * without repeating boilerplate.
 */
export default function PageLayout({ eyebrow, title, subtitle, actions, documentTitle, children }) {
  useEffect(() => {
    document.title = `${documentTitle ?? title} — MarketLink`
    window.scrollTo(0, 0)
  }, [documentTitle, title])

  return (
    <>
      <Navbar />
      <main className="bg-cream min-h-screen">
        <header className="relative overflow-hidden bg-forest-deep pt-32 pb-12 md:pt-40 md:pb-16">
          <OrganicLeaf className="absolute -right-32 -top-24 h-[28rem] w-[28rem] opacity-60 pointer-events-none" />
          <div className="container-page relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              {eyebrow && <span className="block text-olive-light text-xs tracking-widest2 uppercase mb-4">{eyebrow}</span>}
              <h1 className="font-display text-4xl sm:text-5xl text-cream leading-[1.08]">{title}</h1>
              {subtitle && <p className="mt-4 text-cream/70 max-w-xl">{subtitle}</p>}
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
          </div>
        </header>
        <div className="container-page py-10 md:py-14">{children}</div>
      </main>
      <Footer />
    </>
  )
}
