import { useCallback, useEffect, useRef, useState } from 'react'
import AppImage from './AppImage.jsx'
import { resolveImageUrl } from '../../config/images.js'

/** Keyboard-accessible gallery: arrow keys move, thumbnails are real buttons, empty list shows a placeholder. */
export default function ImageGallery({ images = [], alt = 'Photo', kind = 'generic', aspect = '4 / 3', className = '' }) {
  const list = images.filter(Boolean)
  const [index, setIndex] = useState(0)
  const ref = useRef(null)
  useEffect(() => { if (index >= list.length) setIndex(0) }, [list.length, index])
  const go = useCallback((d) => setIndex((i) => (list.length ? (i + d + list.length) % list.length : 0)), [list.length])
  const onKey = (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(1) } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) } }
  const count = list.length || 1
  return (
    <div className={className} ref={ref}>
      <div role="group" aria-roledescription="carousel" aria-label={`${alt} gallery`} tabIndex={0} onKeyDown={onKey}
        className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-olive">
        <AppImage src={list[index]} alt={`${alt} — photo ${index + 1} of ${count}`} kind={kind} aspect={aspect} priority={index === 0} />
        {list.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-cream/90 text-forest-deep focus-visible:ring-2 focus-visible:ring-olive">‹</button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-cream/90 text-forest-deep focus-visible:ring-2 focus-visible:ring-olive">›</button>
          </>
        )}
        <p className="sr-only" aria-live="polite">Photo {index + 1} of {count}</p>
      </div>
      {list.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto" aria-label="Choose photo">
          {list.map((src, i) => (
            <li key={`${resolveImageUrl(src)}-${i}`} className="shrink-0">
              <button type="button" onClick={() => setIndex(i)} aria-label={`Show photo ${i + 1}`} aria-current={i === index}
                className={`block h-14 w-14 overflow-hidden border ${i === index ? 'border-olive' : 'border-transparent opacity-70 hover:opacity-100'} focus-visible:ring-2 focus-visible:ring-olive`}>
                <AppImage src={src} alt="" kind={kind} aspect="1 / 1" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
