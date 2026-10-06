import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import AppImage from './AppImage.jsx'

/**
 * Image with a gentle reveal (fade + slow zoom-in) and optional scroll parallax.
 * Animation is disabled entirely for users who prefer reduced motion.
 * Use sparingly for hero/story imagery — not for cards or dashboard thumbnails.
 */
export default function CinematicImage({ src, alt = '', kind = 'generic', parallax = false, zoom = true, priority = false, className = '', ...rest }) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])
  const animate = !reduce
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0"
        style={animate && parallax ? { y, scale: 1.12 } : undefined}
        initial={animate ? { opacity: 0, scale: zoom ? 1.08 : 1 } : false}
        whileInView={animate ? { opacity: 1, scale: 1 } : undefined}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <AppImage fill src={src} alt={alt} kind={kind} priority={priority} {...rest} />
      </motion.div>
    </div>
  )
}
