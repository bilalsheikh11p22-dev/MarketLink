import { forwardRef } from 'react'

const Textarea = forwardRef(function Textarea(
  { label, error, id, className = '', ...props },
  ref
) {
  const tid = id || props.name
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={tid} className="mb-1.5 block text-sm font-medium text-forest/80">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={tid}
        aria-invalid={error ? 'true' : undefined}
        className={`w-full rounded-xl border bg-cream-soft px-3.5 py-2.5 text-sm text-forest placeholder:text-forest/35 focus:outline-none focus:ring-2 focus:ring-olive/40 resize-y min-h-[96px] ${
          error ? 'border-red-300' : 'border-forest/15'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-700" role="alert">{error}</p>}
    </div>
  )
})

export default Textarea
