import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

/**
 * Reusable call-to-action button.
 * variant: 'solid' | 'outline' | 'outline-dark'
 * Pass `to` for React Router navigation.
 */
export default function CTAButton({ children, onClick, variant = 'solid', className = '', type = 'button', to, href, external = false }) {
  const base =
    'inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm tracking-wide font-body font-medium transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-light focus-visible:ring-offset-2 focus-visible:ring-offset-forest-deep'

  const styles =
    variant === 'outline'
      ? 'border border-cream/70 text-cream hover:bg-cream hover:text-forest-deep'
      : variant === 'outline-dark'
        ? 'border border-forest-deep/40 text-forest-deep hover:bg-forest-deep hover:text-cream'
        : 'bg-olive text-forest-deep hover:bg-olive-light'

  const cls = `${base} ${styles} ${className}`

  if (to) {
    return (
      <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }} transition={{ duration: 0.2 }} className="inline-flex">
        <Link to={to} onClick={onClick} className={cls}>
          {children}
        </Link>
      </motion.div>
    )
  }

  if (href) {
    return (
      <motion.a
        href={href}
        onClick={onClick}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
        transition={{ duration: 0.2 }}
        className={cls}
      >
        {children}
      </motion.a>
    )
  }

  return (
    <motion.button type={type} onClick={onClick} whileHover={{ y: -2 }} whileTap={{ y: 0 }} transition={{ duration: 0.2 }} className={cls}>
      {children}
    </motion.button>
  )
}
