import { forwardRef } from 'react'

const Select = forwardRef(function Select(
  { label, error, id, children, className = '', ...props },
  ref
) {
  const selectId = id || props.name
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-forest/80">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        aria-invalid={error ? 'true' : undefined}
        className={`w-full rounded-xl border bg-cream-soft px-3.5 py-2.5 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-olive/40 disabled:opacity-50 ${
          error ? 'border-red-300' : 'border-forest/15'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-700" role="alert">{error}</p>}
    </div>
  )
})

export default Select
