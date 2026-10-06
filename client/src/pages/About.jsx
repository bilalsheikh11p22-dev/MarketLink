import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout.jsx'
import AppImage from '../components/image/AppImage.jsx'
import CinematicImage from '../components/image/CinematicImage.jsx'
import { SITE } from '../config/site.js'
import { STATIC_IMAGES } from '../config/images.js'

const STEPS = [
  ['Browse local', 'Find markets, farmers and products near you, with real stock levels.'],
  ['Pre-order', 'Reserve what you need. Stock is held for you the moment you order.'],
  ['Pick up and pay', 'Choose a pickup slot and pay on pickup. No online payment is taken.']
]

export default function About() {
  return (
    <PageLayout eyebrow="About" title="Local food, without the middlemen" subtitle="MarketLink connects customers with farmers and local markets so fresh produce reaches the table with less waste.">
      <div className="grid gap-10 lg:grid-cols-2 items-center">
        <CinematicImage src="/images/about/about-hero.jpg" alt="Local farmers and fresh produce" kind="generic" className="aspect-[4/3] bg-cream-soft" />
        <div>
          <h2 className="font-display text-2xl text-forest-deep">Our project</h2>
          <p className="mt-3 text-forest-deep/70">MarketLink is a full-stack local agricultural marketplace for customers, farmers and administrators. Farmers publish products and weekly stock, customers pre-order for pickup, and administrators keep the marketplace trustworthy.</p>
          <p className="mt-3 text-forest-deep/70">Features such as demand estimates and waste alerts are computed from real marketplace data and are always labelled as estimates.</p>
        </div>
      </div>

      <section className="mt-16" aria-labelledby="how">
        <h2 id="how" className="font-display text-2xl text-forest-deep">How it works</h2>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="border border-forest/10 bg-cream-soft p-6"><span className="text-olive text-sm">0{i + 1}</span><h3 className="mt-2 font-display text-lg text-forest-deep">{t}</h3><p className="mt-2 text-sm text-forest-deep/65">{d}</p></li>
          ))}
        </ol>
      </section>

      <section className="mt-16 grid gap-6 sm:grid-cols-2">
        <div className="relative aspect-[16/9] overflow-hidden"><AppImage fill src={STATIC_IMAGES.storyMarketCommunity} alt="A community market" kind="market" /></div>
        <div className="relative aspect-[16/9] overflow-hidden"><AppImage fill src={STATIC_IMAGES.storyFarmerPortrait} alt="A local farmer" kind="farmer" /></div>
      </section>

      {SITE.team.length > 0 && (
        <section className="mt-16" aria-labelledby="team">
          <h2 id="team" className="font-display text-2xl text-forest-deep">Team</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SITE.team.map((m) => <li key={m.name}><div className="aspect-square overflow-hidden"><AppImage src={m.image} alt={m.name} kind="avatar" /></div><p className="mt-3 font-display text-lg text-forest-deep">{m.name}</p><p className="text-sm text-forest-deep/60">{m.role}</p></li>)}
          </ul>
        </section>
      )}

      <div className="mt-16 flex flex-wrap gap-3">
        <Link to="/markets" className="bg-forest-deep px-6 py-3 text-sm text-cream hover:bg-forest-light">Explore markets</Link>
        <Link to="/contact" className="border border-forest-deep/30 px-6 py-3 text-sm text-forest-deep hover:border-olive">Contact us</Link>
      </div>
    </PageLayout>
  )
}
