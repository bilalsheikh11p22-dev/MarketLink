import { useState } from 'react'
import { Star } from 'lucide-react'

/** Read-only stars with fractional fill (4.6 -> four full + 60% of the fifth). */
export function RatingStars({ value = 0, size = 16, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} role="img" aria-label={`Rated ${Number(value).toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)))
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }} aria-hidden="true">
            <Star size={size} className="absolute inset-0 text-forest-deep/20" strokeWidth={1.6} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} className="text-olive fill-olive" strokeWidth={1.6} />
            </span>
          </span>
        )
      })}
    </span>
  )
}

/** Interactive 1–5 selector: radio semantics, hover preview, ←/→ keys. */
export function StarRatingInput({ value, onChange, size = 30, labelledBy, invalid }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  const labels = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent']

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      onChange(Math.min(5, (value || 0) + 1))
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      onChange(Math.max(1, (value || 2) - 1))
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div role="radiogroup" aria-labelledby={labelledBy} aria-invalid={invalid || undefined} onKeyDown={onKeyDown} onMouseLeave={() => setHover(0)} className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} star${i > 1 ? 's' : ''} — ${labels[i - 1]}`}
            tabIndex={value === i || (!value && i === 1) ? 0 : -1}
            onClick={() => onChange(i)}
            onMouseEnter={() => setHover(i)}
            className="p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
          >
            <Star size={size} strokeWidth={1.6} className={i <= shown ? 'text-olive fill-olive' : 'text-forest-deep/25'} />
          </button>
        ))}
      </div>
      <span className="text-sm text-forest-deep/60 min-w-20" aria-live="polite">
        {shown ? labels[shown - 1] : ''}
      </span>
    </div>
  )
}

export default RatingStars
