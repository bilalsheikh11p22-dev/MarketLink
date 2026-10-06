import { Link } from 'react-router-dom'

const COLUMNS = [
  { title: 'Explore', links: [['Markets', '/markets'], ['Farmers', '/farmers'], ['Products', '/products'], ['Nearby Markets', '/nearby-markets']] },
  { title: 'For Farmers', links: [['Join as a Farmer', '/register'], ['Farmer Login', '/login']] },
  { title: 'Support', links: [['Contact', '/contact'], ['AI Assistant', '/ai-assistant']] },
  { title: 'Company', links: [['About', '/about'], ['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']] }
]

export default function Footer() {
  return (
    <footer id="footer" className="relative bg-forest-deep text-cream">
      <div className="container-page py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-8">
          <div className="md:col-span-2">
            <p className="font-display text-2xl mb-3">MarketLink</p>
            <p className="text-cream/65 text-sm leading-relaxed max-w-xs">
              Connecting local farmers, markets and communities.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-body text-sm tracking-wide text-cream/90 mb-4">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map(([label, to]) => (
                  <li key={to}>
                    <Link to={to} className="text-cream/60 text-sm hover:text-olive-light transition-colors focus-visible:underline">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-cream/45 text-xs">© {new Date().getFullYear()} MarketLink. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
