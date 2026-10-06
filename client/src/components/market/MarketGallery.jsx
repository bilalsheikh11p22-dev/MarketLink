import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CloseIcon } from './MarketIcons.jsx'
import MarketImage from '../image/MarketImage.jsx'
import { resolveImageUrl } from '../../config/images.js'

/**
 * Large image + thumbnails with next/previous, active state and a
 * fullscreen view. Keyboard: ← / → change the image (while the gallery
 * has focus, or the fullscreen view is open), Esc closes fullscreen.
 * Only the active image is rendered large; thumbnails are lazy-loaded.
 */
export default function MarketGallery({ images = [], name = 'Market' }) {
  const [index, setIndex] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const count = images.length

  const goTo = useCallback((i) => setIndex((i + count) % count), [count])
  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  // Fullscreen: global keys + scroll lock (cleaned up on close/unmount).
  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setFullscreen(false)
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [fullscreen, next, prev])

  if (!count) return null

  const onRegionKey = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      next()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prev()
    }
  }

  const arrow =
    'absolute top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center bg-cream/90 text-forest-deep hover:bg-cream transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive'

  return (
    <section aria-label={`${name} photo gallery`} onKeyDown={onRegionKey}>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-forest-light">
        <AnimatePresence mode="wait">
          <motion.button
            key={images[index]}
            type="button"
            onClick={() => setFullscreen(true)}
            aria-label={`Open photo ${index + 1} of ${count} full screen`}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-0 h-full w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-olive"
          >
            <MarketImage fill priority={index === 0} src={images[index]} alt={`${name} — photo ${index + 1} of ${count}`} />
          </motion.button>
        </AnimatePresence>

        {count > 1 && (
          <>
            <button type="button" onClick={prev} aria-label="Previous photo" className={`${arrow} left-3`}>
              ←
            </button>
            <button type="button" onClick={next} aria-label="Next photo" className={`${arrow} right-3`}>
              →
            </button>
          </>
        )}
        <span className="absolute bottom-3 right-3 bg-forest-deep/70 text-cream text-xs px-2.5 py-1" aria-live="polite">
          {index + 1} / {count}
        </span>
      </div>

      {count > 1 && (
        <ul className="mt-3 grid grid-cols-4 gap-3">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={`relative block aspect-[16/10] w-full overflow-hidden border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive ${
                  i === index ? 'border-olive' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <MarketImage fill src={src} alt="" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${name} photo viewer`}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-forest-deep/95 p-4 md:p-10"
            onClick={() => setFullscreen(false)}
          >
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              aria-label="Close photo viewer (Escape)"
              autoFocus
              className="absolute top-5 right-5 flex h-11 w-11 items-center justify-center text-cream hover:text-olive-light focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
            >
              <CloseIcon size={22} />
            </button>
            <img
              src={resolveImageUrl(images[index])}
              alt={`${name} — photo ${index + 1} of ${count}`}
              onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full object-contain"
            />
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    prev()
                  }}
                  aria-label="Previous photo"
                  className={`${arrow} left-4`}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    next()
                  }}
                  aria-label="Next photo"
                  className={`${arrow} right-4`}
                >
                  →
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
