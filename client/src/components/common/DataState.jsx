import AnalyticsSkeleton from '../analytics/AnalyticsSkeleton.jsx'
import AnalyticsErrorState from '../analytics/AnalyticsErrorState.jsx'
/** Standard loading / error wrapper for API-backed pages. */
export default function DataState({ loading, error, onRetry, children }) {
  if (loading) return <AnalyticsSkeleton />
  if (error) return <AnalyticsErrorState message={error} onRetry={onRetry} />
  return children
}
