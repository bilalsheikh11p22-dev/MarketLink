import { memo, useEffect, useState } from 'react'
import { placeholderFor, resolveImageUrl } from '../../config/images.js'

/**
 * Base image: resolves local/backend URLs, shows a skeleton while loading, and a local placeholder if the
 * file is missing or the src is empty. `fill` makes it cover its positioned parent (absolute inset-0);
 * otherwise pass `aspect` (e.g. "4 / 3") to reserve space and avoid layout shift.
 */
function AppImage({
  src, alt = '', kind = 'generic', fit = 'cover', aspect, fill = false, priority = false,
  className = '', wrapperClassName = '', width, height, sizes, onLoad, ...rest
}) {
  const resolved = resolveImageUrl(src)
  const [state, setState] = useState(resolved ? 'loading' : 'missing')
  useEffect(() => { setState(resolved ? 'loading' : 'missing') }, [resolved])

  const showPlaceholder = state === 'missing' || state === 'error'
  const url = showPlaceholder ? placeholderFor(kind) : resolved
  const frame = fill ? 'absolute inset-0 h-full w-full' : aspect ? 'relative w-full' : 'relative h-full w-full'
  const fitClass = fit === 'contain' ? 'object-contain' : 'object-cover'

  return (
    <div className={`${frame} overflow-hidden ${wrapperClassName}`} style={!fill && aspect ? { aspectRatio: aspect } : undefined}>
      {state === 'loading' && (
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-forest/10 via-cream-soft to-forest/10 bg-[length:200%_100%] animate-shimmer motion-reduce:animate-none" />
      )}
      <img
        src={url}
        alt={showPlaceholder ? (alt ? `${alt} (photo not available)` : '') : alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        fetchpriority={priority ? 'high' : undefined}
        decoding="async"
        onLoad={(e) => {
          if (state !== 'error' && state !== 'missing') setState('loaded')
          onLoad?.(e)
          window.dispatchEvent(new Event('marketlink:image-loaded')) // lets scroll-linked scenes re-measure
        }}
        onError={() => setState((s) => (s === 'loading' || s === 'loaded' ? 'error' : s))}
        className={`h-full w-full ${fitClass} transition-opacity duration-500 motion-reduce:transition-none ${state === 'loading' ? 'opacity-0' : 'opacity-100'} ${className}`}
        {...rest}
      />
    </div>
  )
}
export default memo(AppImage)
