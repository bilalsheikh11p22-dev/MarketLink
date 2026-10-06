import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, hint, id, className = '', ...props },
  ref
) {
  const inputId = id || props.name
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-forest/80">
          {label}
          {props.required && <span className="text-red-600 ml-0.5" aria-hidden>*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={`w-full rounded-xl border bg-cream-soft px-3.5 py-2.5 text-sm text-forest placeholder:text-forest/35 transition-colors focus:outline-none focus:ring-2 focus:ring-olive/40 focus:border-olive/40 disabled:opacity-50 ${
          error ? 'border-red-300 focus:ring-red-300/40' : 'border-forest/15'
        } ${className}`}
        {...props}
      />
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-forest/45">{hint}</p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-red-700" role="alert">{error}</p>
      )}
    </div>
  )
})

export default Input
