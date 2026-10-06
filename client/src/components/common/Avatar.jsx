import { useState } from 'react'
import { resolveImageUrl } from '../../config/images.js'

/** Round avatar with an initials fallback when there is no (or a broken) image. */
export default function Avatar({ src, name = '', size = 40, className = '' }) {
  const [failed, setFailed] = useState(false)
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

  const style = { width: size, height: size }
  if (!src || failed)
    return (
      <span style={style} className={`inline-flex shrink-0 items-center justify-center rounded-full bg-olive/25 text-forest-deep font-medium ${className}`} aria-hidden="true">
        <span style={{ fontSize: size * 0.38 }}>{initials || '?'}</span>
      </span>
    )
  return <img src={resolveImageUrl(src)} alt="" style={style} loading="lazy" onError={() => setFailed(true)} className={`shrink-0 rounded-full object-cover ${className}`} />
}
