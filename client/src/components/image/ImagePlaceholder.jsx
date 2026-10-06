import { placeholderFor } from '../../config/images.js'
/** Explicit placeholder block (e.g. for empty galleries). Decorative unless a label is given. */
export default function ImagePlaceholder({ kind = 'generic', label = '', className = '', aspect = '4 / 3' }) {
  return (
    <div className={`relative w-full overflow-hidden bg-cream-soft ${className}`} style={{ aspectRatio: aspect }}>
      <img src={placeholderFor(kind)} alt={label} className="h-full w-full object-cover" loading="lazy" decoding="async" />
    </div>
  )
}
