import { useEffect } from 'react'
import Navbar from '../Navbar.jsx'
import Footer from '../Footer.jsx'
import MarketEmptyState from './MarketEmptyState.jsx'

export default function MarketNotFound() {
  useEffect(() => {
    document.title = 'Market not found — MarketLink'
  }, [])
  return (
    <>
      <Navbar />
      <main className="bg-cream min-h-screen pt-32 pb-24">
        <div className="container-page max-w-2xl">
          <MarketEmptyState
            title="Market not found"
            description="We couldn't find that market. It may have moved or the link may be wrong."
            actionLabel="Browse Markets"
            to="/markets"
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
