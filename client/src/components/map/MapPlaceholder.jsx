import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AREA_COORDINATES, KARACHI_CENTER } from '../../data/markets.js'
import { formatCoordinates, getDirectionsUrl } from '../../utils/marketUtils.js'
import { DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM } from './mapConfig.js'
import MarketImage from '../image/MarketImage.jsx'

// Deterministic PRNG so every market gets its own (stable) street pattern.
function mulberry32(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function useSize(ref) {
  const [size, setSize] = useState({ w: 800, h: 480 })
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width && height) setSize((s) => (Math.abs(s.w - width) > 1 || Math.abs(s.h - height) > 1 ? { w: width, h: height } : s))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return size
}

function Pin({ active, muted }) {
  return (
    <svg width={active ? 44 : 32} height={active ? 54 : 40} viewBox="0 0 32 40" aria-hidden="true" className="drop-shadow-[0_4px_4px_rgba(11,29,21,0.35)]">
      <path d="M16 39S3 25.5 3 15.5a13 13 0 1 1 26 0C29 25.5 16 39 16 39Z" fill={active ? '#A98B4F' : muted ? '#5B7A5E' : '#122A20'} />
      <circle cx="16" cy="15.5" r="5.2" fill="#F6F1E7" />
    </svg>
  )
}

/**
 * Map-style UI built with HTML + SVG — no tiles, no API key. A scaled
 * background layer (streets, parks, sea, labels) is zoomed with CSS while
 * markers stay crisp at a fixed size on top of it.
 */
export default function MapPlaceholder({
  market,
  markets,
  center,
  zoom: initialZoom = DEFAULT_ZOOM,
  activeId,
  onSelect,
  showPopup = true,
  controls = true,
  linkToMarket = false,
  height = 'h-[400px] md:h-[600px]',
  className = ''
}) {
  const list = useMemo(() => (markets?.length ? markets : market ? [market] : []), [markets, market])
  const multi = list.length > 1
  const mapCenter = center ?? market?.coordinates ?? KARACHI_CENTER
  const ppd = multi ? 2200 : 6000 // pixels per degree at the default zoom

  const [zoom, setZoom] = useState(initialZoom)
  const [selectedId, setSelectedId] = useState(activeId ?? (multi ? null : list[0]?.id))
  const [popupOpen, setPopupOpen] = useState(true)
  const rootRef = useRef(null)
  const { w, h } = useSize(rootRef)

  useEffect(() => setZoom(initialZoom), [initialZoom])
  useEffect(() => {
    if (activeId !== undefined) {
      setSelectedId(activeId)
      setPopupOpen(true)
    }
  }, [activeId])

  const scale = Math.pow(1.3, zoom - DEFAULT_ZOOM)
  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, z + 1))
  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, z - 1))
  const reset = () => setZoom(initialZoom)

  const project = (c) => ({ x: (c.lng - mapCenter.lng) * ppd, y: -(c.lat - mapCenter.lat) * ppd })

  // ----- static background (regenerated only when centre/size changes) -----
  const bg = useMemo(() => {
    const rnd = mulberry32(Math.round(mapCenter.lat * 1e4) * 31 + Math.round(mapCenter.lng * 1e4))
    const BW = w * 2.4
    const BH = h * 2.4
    const cx = BW / 2
    const cy = BH / 2

    const minor = []
    const stepX = 80 + rnd() * 30
    const stepY = 70 + rnd() * 30
    for (let x = -BW; x < BW; x += stepX + (rnd() - 0.5) * 24) minor.push(`M${cx + x},0 L${cx + x + (rnd() - 0.5) * 30},${BH}`)
    for (let y = -BH; y < BH; y += stepY + (rnd() - 0.5) * 24) minor.push(`M0,${cy + y} L${BW},${cy + y + (rnd() - 0.5) * 30}`)

    const major = []
    for (let i = 0; i < 2; i++) {
      const y0 = cy + (i ? 1 : -1) * (h * 0.22 + rnd() * h * 0.2)
      const y1 = y0 + (rnd() - 0.5) * h * 0.4
      major.push(`M0,${y0} C${BW * 0.3},${y0 + (rnd() - 0.5) * 120} ${BW * 0.65},${y1 + (rnd() - 0.5) * 120} ${BW},${y1}`)
    }
    {
      const x0 = cx + (rnd() - 0.5) * w * 0.9
      const x1 = x0 + (rnd() - 0.5) * w * 0.4
      major.push(`M${x0},0 C${x0 + (rnd() - 0.5) * 120},${BH * 0.3} ${x1 + (rnd() - 0.5) * 120},${BH * 0.65} ${x1},${BH}`)
    }

    const parks = Array.from({ length: 6 }, () => ({
      x: cx + (rnd() - 0.5) * w * 1.8,
      y: cy + (rnd() - 0.5) * h * 1.8,
      rx: 50 + rnd() * 70,
      ry: 34 + rnd() * 50,
      r: rnd() * 30
    }))

    // Sea sits south of ~24.775° N, like the real Karachi coastline.
    const seaY = cy + (mapCenter.lat - 24.775) * ppd
    const coast = []
    for (let x = 0; x <= BW; x += 40) coast.push(`${x},${seaY + Math.sin(x / 150) * 16 + Math.sin(x / 60) * 5}`)

    // Area labels; one that would sit under a market pin is nudged below the pin's name chip.
    const labels = Object.entries(AREA_COORDINATES).map(([name, c]) => {
      const x = cx + (c.lng - mapCenter.lng) * ppd
      let y = cy + -(c.lat - mapCenter.lat) * ppd
      const nearPin = list.some((m) => Math.hypot(x - (cx + (m.coordinates.lng - mapCenter.lng) * ppd), y - (cy - (m.coordinates.lat - mapCenter.lat) * ppd)) < 90)
      if (nearPin) y += 120
      return { name, x, y }
    })

    return { BW, BH, cx, cy, minor, major, parks, seaY, coast, labels }
  }, [mapCenter.lat, mapCenter.lng, w, h, ppd, list])

  const selected = list.find((m) => m.id === selectedId)

  const choose = (m) => {
    setSelectedId(m.id)
    setPopupOpen(true)
    onSelect?.(m.id)
  }

  const onKeyDown = (e) => {
    if (!controls) return
    if (e.key === '+' || e.key === '=') zoomIn()
    if (e.key === '-' || e.key === '_') zoomOut()
  }

  const ctrl =
    'flex h-10 w-10 items-center justify-center bg-cream text-forest-deep text-lg leading-none border border-forest/15 hover:bg-white disabled:opacity-40 disabled:hover:bg-cream transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive'

  return (
    <div
      ref={rootRef}
      role="region"
      aria-label={multi ? 'Map of nearby markets' : `Map showing ${list[0]?.name ?? 'market'}`}
      tabIndex={controls ? 0 : -1}
      onKeyDown={onKeyDown}
      className={`relative w-full overflow-hidden bg-[#EFE9D8] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-olive ${height} ${className}`}
    >
      {/* Zoomable background */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none transition-transform duration-300 ease-out"
        style={{
          width: bg.BW,
          height: bg.BH,
          left: w / 2 - bg.cx,
          top: h / 2 - bg.cy,
          transform: `scale(${scale})`,
          transformOrigin: `${bg.cx}px ${bg.cy}px`
        }}
      >
        <svg width={bg.BW} height={bg.BH} viewBox={`0 0 ${bg.BW} ${bg.BH}`}>
          <rect width={bg.BW} height={bg.BH} fill="#EFE9D8" />
          {/* subtle map grid */}
          <defs>
            <pattern id="ml-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M60 0H0V60" fill="none" stroke="#122A20" strokeOpacity=".05" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={bg.BW} height={bg.BH} fill="url(#ml-grid)" />
          {/* parks */}
          {bg.parks.map((p, i) => (
            <ellipse key={i} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} transform={`rotate(${p.r} ${p.x} ${p.y})`} fill="#D9E5C6" />
          ))}
          {/* sea */}
          <polygon points={`0,${bg.BH} ${bg.coast.join(' ')} ${bg.BW},${bg.BH}`} fill="#C5DCE0" />
          {/* streets */}
          <path d={bg.minor.join(' ')} stroke="#FFFFFF" strokeWidth="3" fill="none" />
          {bg.major.map((d, i) => (
            <g key={i} fill="none" strokeLinecap="round">
              <path d={d} stroke="#DDD2B4" strokeWidth="11" />
              <path d={d} stroke="#FFFFFF" strokeWidth="7" />
            </g>
          ))}
          {/* sea clipped again so roads never cross the water */}
          <polygon points={`0,${bg.BH} ${bg.coast.join(' ')} ${bg.BW},${bg.BH}`} fill="#C5DCE0" />
          {bg.seaY < bg.cy + h / 2 && (
            <text x={bg.cx - 40} y={bg.seaY + 90} fontSize="13" letterSpacing="4" fill="#3C6B78" opacity=".7">
              ARABIAN SEA
            </text>
          )}
          {/* neighbourhood labels */}
          {bg.labels.map((l) => (
            <text key={l.name} x={l.x} y={l.y} textAnchor="middle" fontSize="12" letterSpacing="3" fill="#122A20" opacity=".42">
              {l.name.toUpperCase()}
            </text>
          ))}
        </svg>
      </div>

      {/* compass */}
      <div aria-hidden="true" className="absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-[10px] font-medium text-forest-deep border border-forest/10">
        N
      </div>

      {/* Markers (fixed size, positioned from the zoomed projection) */}
      {list.map((m) => {
        const p = project(m.coordinates)
        const x = w / 2 + p.x * scale
        const y = h / 2 + p.y * scale
        if (x < -40 || x > w + 40 || y < -60 || y > h + 40) return null
        const active = m.id === selectedId
        const showLabel = active || !multi
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => choose(m)}
            aria-label={`${m.name}, ${m.distanceKm} km away`}
            aria-pressed={active}
            title={m.name}
            style={{ left: x, top: y, zIndex: active ? 20 : 10 }}
            className="absolute -translate-x-1/2 -translate-y-full transition-[left,top] duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-olive rounded"
          >
            {active && <span aria-hidden="true" className="absolute left-1/2 bottom-0 h-5 w-5 -translate-x-1/2 translate-y-1/2 rounded-full bg-olive/40 animate-ping" />}
            <Pin active={active} muted={multi && !active} />
            {showLabel && (
              <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap bg-forest-deep px-2.5 py-1 text-[11px] text-cream shadow">
                {m.name}
              </span>
            )}
          </button>
        )
      })}

      {/* Controls */}
      {controls && (
        <div className="absolute top-3 right-3 z-30 flex flex-col gap-px">
          <button type="button" onClick={zoomIn} disabled={zoom >= MAX_ZOOM} aria-label="Zoom in" className={ctrl}>
            +
          </button>
          <button type="button" onClick={zoomOut} disabled={zoom <= MIN_ZOOM} aria-label="Zoom out" className={ctrl}>
            −
          </button>
          <button type="button" onClick={reset} aria-label="Reset zoom" className={`${ctrl} text-xs mt-2`}>
            ⌖
          </button>
        </div>
      )}

      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 bg-cream/90 px-2.5 py-1 text-[11px] text-forest-deep/70" aria-live="polite">
        <span aria-hidden="true" className="h-px w-8 bg-forest-deep/60" />
        Zoom {zoom}
      </div>

      {/* Popup card — bottom overlay on every screen size */}
      {showPopup && selected && popupOpen && (
        <div className="absolute z-30 left-3 right-3 bottom-3 sm:right-auto sm:w-80 bg-cream border border-forest/15 shadow-[0_18px_40px_-16px_rgba(11,29,21,0.5)]">
          <button
            type="button"
            onClick={() => setPopupOpen(false)}
            aria-label="Close market card"
            className="absolute top-1.5 right-1.5 h-7 w-7 flex items-center justify-center text-forest-deep/50 hover:text-forest-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
          >
            ×
          </button>
          <div className="flex gap-3 p-4 pr-8">
            <div className="h-16 w-16 shrink-0"><MarketImage src={selected.image} alt="" /></div>
            <div className="min-w-0">
              <p className="font-display text-base text-forest-deep leading-snug">{selected.name}</p>
              <p className="text-xs text-forest-deep/65 mt-0.5">{selected.address}</p>
              <p className="text-xs text-forest-deep/50 mt-1">
                {selected.distanceKm} km · {formatCoordinates(selected.coordinates)}
              </p>
            </div>
          </div>
          <div className="flex gap-2 px-4 pb-4">
            <a
              href={getDirectionsUrl(selected)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2 text-xs bg-forest-deep text-cream hover:bg-forest-light transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
            >
              Get Directions<span className="sr-only"> (opens in a new tab)</span>
            </a>
            {linkToMarket && (
              <Link
                to={`/markets/${selected.id}`}
                className="flex-1 text-center py-2 text-xs border border-forest/25 text-forest-deep hover:border-olive transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
              >
                View Market
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
