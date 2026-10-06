/**
 * Frontend-only location indicator for the discovery experience.
 * Later this can connect to Google Maps / OpenStreetMap and real
 * geolocation — for now it's a static, editable display component,
 * kept separate so that wiring in real coordinates later only
 * touches this file.
 */
export default function LocationSelector({ city = 'Karachi', helperText = 'Showing markets near you' }) {
  return (
    <button
      type="button"
      className="flex items-center gap-2.5 border border-forest/15 bg-white/60 px-4 py-2.5 text-left hover:border-olive/60 transition-colors"
      aria-label={`Location: ${city}. ${helperText}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-olive shrink-0">
        <path d="M12 21s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12Z" />
        <circle cx="12" cy="9" r="2.4" />
      </svg>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-medium text-forest-deep">{city}</span>
        <span className="text-xs text-forest-deep/55">{helperText}</span>
      </span>
    </button>
  )
}
