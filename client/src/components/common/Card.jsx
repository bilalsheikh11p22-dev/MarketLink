export default function Card({ children, className = '', padding = true }) {
  return (
    <div className={`rounded-2xl border border-forest/8 bg-cream-soft shadow-sm ${padding ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  )
}
