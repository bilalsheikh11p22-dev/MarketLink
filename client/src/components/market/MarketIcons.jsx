// Small inline icons shared by the Market pages (kept together so the
// visual weight — 1.6–1.8 stroke, rounded — stays consistent).

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

export function PinIcon({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 21s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.4" />
    </svg>
  )
}

export function ClockIcon({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

export function SearchIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

export function FilterIcon({ size = 15, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="11" y1="17" x2="13" y2="17" />
    </svg>
  )
}

export function ChevronIcon({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function CloseIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function StarIcon({ size = 13, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="m12 2.8 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.6l-5.8 3.1 1.1-6.5L2.6 9.6l6.5-.9L12 2.8Z" />
    </svg>
  )
}

export function OrganicLeaf({ className = '' }) {
  // Large decorative leaf + rings used behind the hero sections.
  return (
    <svg viewBox="0 0 600 600" className={className} fill="none" stroke="#A98B4F" strokeWidth="1.2" aria-hidden="true">
      <circle cx="300" cy="300" r="290" opacity=".25" />
      <circle cx="300" cy="300" r="220" opacity=".2" />
      <circle cx="300" cy="300" r="150" opacity=".15" />
      <path d="M520 90C300 90 90 230 90 510c190 0 410-130 430-420Z" opacity=".55" />
      <path d="M130 480C220 380 330 270 500 120" opacity=".55" />
      <path d="M230 400c30-8 60-8 96-2M290 340c26-4 52-2 84 4M350 280c18-2 38 0 64 6" opacity=".4" />
    </svg>
  )
}
