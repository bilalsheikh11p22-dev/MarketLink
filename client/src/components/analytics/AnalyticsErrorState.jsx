export default function AnalyticsErrorState({ message = 'Something went wrong loading analytics.', onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 py-12 px-6 text-center">
      <h3 className="font-display text-lg text-red-900">Unable to load</h3>
      <p className="mt-1 text-sm text-red-800/80">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-4 rounded-xl bg-forest px-4 py-2 text-sm text-cream">
          Try again
        </button>
      )}
    </div>
  )
}
