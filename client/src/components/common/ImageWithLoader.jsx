import AppImage from '../image/AppImage.jsx'

/**
 * Backwards-compatible wrapper used across the app. Now powered by AppImage, so it resolves backend
 * upload paths and falls back to local SVG placeholders (never to files that may not exist).
 * `fallbackSrc` is kept for older call sites and used only to pick a placeholder kind.
 */
export default function ImageWithLoader({ src, alt = '', className = '', wrapperClassName = 'absolute inset-0 h-full w-full', fallbackSrc = '', onLoad, kind, ...rest }) {
  const inferred = kind || (/farmer/.test(fallbackSrc) ? 'farmer' : /market/.test(fallbackSrc) ? 'market' : /product/.test(fallbackSrc) ? 'product' : 'generic')
  return <AppImage fill src={src} alt={alt} kind={inferred} className={className} wrapperClassName={wrapperClassName.replace('absolute inset-0 h-full w-full', '')} onLoad={onLoad} {...rest} />
}
