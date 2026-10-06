import { forwardRef } from 'react'

const variants = {
  primary: 'bg-forest text-cream hover:bg-forest-light border-transparent',
  secondary: 'bg-transparent text-forest border-forest/20 hover:bg-forest/5',
  outline: 'bg-cream-soft text-forest border-forest/15 hover:border-olive/40',
  ghost: 'bg-transparent text-forest/70 border-transparent hover:bg-forest/5 hover:text-forest',
  danger: 'bg-red-700 text-cream hover:bg-red-800 border-transparent',
  olive: 'bg-olive text-cream hover:bg-olive/90 border-transparent'
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-xl'
}

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className = '', disabled, loading, children, type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-50 disabled:pointer-events-none ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      )}
      {children}
    </button>
  )
})

export default Button
