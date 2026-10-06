import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import LocationSelector from '../../components/location/LocationSelector.jsx'
import MarketMapView from '../../components/map/MarketMap.jsx'
import MarketEmptyState from '../../components/market/MarketEmptyState.jsx'
import { MarketSkeletonGrid } from '../../components/market/MarketSkeleton.jsx'
import { ClockIcon, OrganicLeaf, PinIcon, StarIcon } from '../../components/market/MarketIcons.jsx'
import { api } from '../../services/api.js'
import { normalizeList, normalizeMarket } from '../../utils/normalize.js'
import { filterMarkets, formatHours, formatOperatingDays, getMarketStatus, sortByDistance } from '../../utils/marketUtils.js'
import MarketImage from '../../components/image/MarketImage.jsx'

function NearbyRow({ market, closest, active, onActivate }) {
  const status = getMarketStatus(market)
  return (
    <motion.article
      onMouseEnter={onActivate}
      onFocus={onActivate}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className={`group flex flex-col sm:flex-row overflow-hidden border bg-cream-soft transition-colors ${
        active ? 'border-olive' : 'border-forest/10 hover:border-olive/60'
      }`}
    >
      <Link to={`/markets/${market.id}`} tabIndex={-1} aria-hidden="true" className="relative block sm:w-44 shrink-0 aspect-[16/10] sm:aspect-auto overflow-hidden bg-forest-light">
        <MarketImage fill src={market.image} alt="" className="transition-transform duration-500 group-hover:scale-[1.06]" />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-5 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {closest && <span className="inline-block mb-1.5 bg-olive/15 text-forest-deep text-[11px] px-2 py-0.5 tracking-wide">Closest</span>}
            <h3 className="font-display text-lg text-forest-deep leading-snug">
              <Link to={`/markets/${market.id}`} className="hover:text-olive transition-colors focus:outline-none focus-visible:underline">
                {market.name}
              </Link>
            </h3>
          </div>
          {market.distanceKm != null && <p className="shrink-0 font-display text-xl text-forest-deep">{Number(market.distanceKm).toFixed(1)} km</p>}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-forest-deep/65">
          <span className="flex items-center gap-1.5">
            <PinIcon size={12} />
            {market.location}
          </span>
          {market.rating ? (
            <span className="flex items-center gap-1">
              <StarIcon size={12} className="text-olive" />
              {market.rating}
            </span>
          ) : null}
          <span className="flex items-center gap-1.5">
            <ClockIcon size={12} />
            {formatOperatingDays(market)} · {formatHours(market)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 mt-auto">
          <span className="text-xs text-forest-deep/60">{status.label}</span>
          <div className="flex items-center gap-4 text-sm">
            <Link to={`/markets/${market.id}`} className="text-forest-deep hover:text-olive transition-colors focus:outline-none focus-visible:underline">
              Explore Market →
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

const RADIUS_KM = 5

export default function NearbyMarkets() {
  const [location, setLocation] = useState('Karachi')
  const [activeId, setActiveId] = useState(null)
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [geo, setGeo] = useState(null) // { lat, lng } only after the visitor allows it
  const [geoMsg, setGeoMsg] = useState('')

  useEffect(() => {
    document.title = 'Markets Near You — MarketLink'
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true); setError('')
    const path = geo ? `/markets/nearby?lat=${geo.lat}&lng=${geo.lng}&radius=${RADIUS_KM}` : '/markets?limit=100'
    api(path)
      .then((res) => { if (!cancelled) setMarkets(normalizeList(res.data?.markets, normalizeMarket)) })
      .catch((e) => { if (!cancelled) setError(e.message || 'Could not load markets.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [geo])

  const useMyLocation = () => {
    if (!navigator.geolocation) { setGeoMsg('Your browser does not support location.'); return }
    setGeoMsg('Requesting your location…')
    navigator.geolocation.getCurrentPosition(
      (pos) => { setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGeoMsg('') },
      () => setGeoMsg('Location permission was not granted. Showing all markets instead.'),
      { timeout: 10000 }
    )
  }

  const results = useMemo(() => {
    const list = geo ? markets : filterMarkets(markets, { location })
    return sortByDistance(list)
  }, [markets, location, geo])

  return (
    <>
      <Navbar />
      <main className="bg-cream min-h-screen">
        <header className="relative overflow-hidden bg-forest-deep pt-32 pb-12 md:pt-40 md:pb-16">
          <OrganicLeaf className="absolute -right-32 -top-24 h-[30rem] w-[30rem] opacity-60 pointer-events-none" />
          <div className="container-page relative">
            <span className="block text-olive-light text-xs tracking-widest2 uppercase mb-4">Nearby</span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-[1.06]">Markets Near You</h1>
            <p className="mt-4 text-cream/75 max-w-xl">Explore local markets close to your area.</p>
          </div>
        </header>

        <div className="container-page py-8 md:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="sm:w-72">
              <LocationSelector value={location} onChange={setLocation} />
              <button type="button" onClick={useMyLocation} className="mt-3 text-sm text-olive hover:underline">Use my location (within {RADIUS_KM} km)</button>
              {geoMsg && <p className="mt-1 text-xs text-forest-deep/60" role="status">{geoMsg}</p>}
            </div>
            <p className="text-sm text-forest-deep/60" role="status" aria-live="polite">
              {loading ? 'Loading…' : error ? error : `${results.length} ${results.length === 1 ? 'market' : 'markets'}${geo ? ` within ${RADIUS_KM} km` : ''}`}
            </p>
          </div>

          {loading ? (
            <MarketSkeletonGrid count={3} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" />
          ) : results.length === 0 ? (
            <MarketEmptyState
              title="No Nearby Markets"
              description={geo ? `No markets with known coordinates within ${RADIUS_KM} km of you.` : 'There are no markets in this area yet. Try another location.'}
              actionLabel="Show All of Karachi"
              onAction={() => { setGeo(null); setLocation('Karachi') }}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] gap-8 lg:gap-10 items-start">
              <div className="lg:order-2 lg:sticky lg:top-24">
                <MarketMapView
                  markets={results}
                  zoom={results.length > 1 ? 13 : 14}
                  activeId={activeId ?? undefined}
                  onSelect={setActiveId}
                  linkToMarket
                  height="h-[380px] lg:h-[calc(100vh-9rem)] lg:max-h-[680px]"
                  className="border border-forest/10"
                />
              </div>

              <ol className="lg:order-1 flex flex-col gap-4 min-w-0">
                {results.map((m, i) => (
                  <li key={m.id}>
                    <NearbyRow market={m} closest={i === 0} active={activeId === m.id} onActivate={() => setActiveId(m.id)} />
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
