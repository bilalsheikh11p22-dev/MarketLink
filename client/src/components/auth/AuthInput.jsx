import { forwardRef, useId } from 'react'

/**
 * Labelled input with an accessible error message.
 * The error is linked via aria-describedby and announced (role="alert").
 */
const AuthInput = forwardRef(function AuthInput({ label, error, hint, icon: Icon, trailing, className = '', multiline = false, ...props }, ref) {
  const id = useId()
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  const Tag = multiline ? 'textarea' : 'input'

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm text-forest-deep mb-2">
        {label}
        {props.required && (
          <span className="text-olive" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      <div className="relative">
        {Icon && <Icon size={17} aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-deep/40 pointer-events-none" />}
        <Tag
          ref={ref}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...(multiline ? { rows: props.rows ?? 3 } : {})}
          {...props}
          className={`w-full bg-white/90 border py-3 text-sm text-forest-deep placeholder:text-forest-deep/35 focus:outline-none focus:ring-1 transition-colors ${
            Icon ? 'pl-11' : 'pl-4'
          } ${trailing ? 'pr-12' : 'pr-4'} ${multiline ? 'resize-none' : ''} ${
            error ? 'border-red-600/60 focus:border-red-600 focus:ring-red-600/30' : 'border-forest/15 focus:border-olive focus:ring-olive/40'
          }`}
        />
        {trailing && <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-xs text-red-700">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-forest-deep/50">
          {hint}
        </p>
      ) : null}
    </div>
  )
})

export default AuthInput
