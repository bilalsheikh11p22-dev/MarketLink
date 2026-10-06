import { Link } from 'react-router-dom'
import Button from './Button.jsx'

export default function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again or return home.',
  onRetry,
  showHome = true
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <h3 className="font-display text-lg text-forest-deep">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-forest/60">{message}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {onRetry && (
          <Button type="button" onClick={onRetry}>Try again</Button>
        )}
        {showHome && (
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-forest/20 px-4 py-2.5 text-sm font-medium text-forest hover:bg-forest/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
          >
            Go Home
          </Link>
        )}
      </div>
    </div>
  )
}
