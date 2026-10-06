import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnalyticsHeader from '../../components/analytics/AnalyticsHeader.jsx'
import RecommendationCard from '../../components/analytics/RecommendationCard.jsx'
import AnalyticsCard from '../../components/analytics/AnalyticsCard.jsx'
import DataState from '../../components/common/DataState.jsx'
import useFetch from '../../hooks/useFetch.js'
import { customerInsights } from '../../services/insightService.js'
import { normalizeProduct } from '../../utils/normalize.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function CustomerInsights() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data, loading, error, reload } = useFetch(
    () => customerInsights(),
    [user?.id]
  )

  const recs = (data?.recommendations || [])
    .map(normalizeProduct)
    .filter(Boolean)
    .map((p) => ({
      id: p.id,
      productId: p.id,
      name: p.name,
      image: p.images?.[0],
      price: p.price,
      unit: p.unit,
      rating: p.rating || null,
      farmerName: p.farmer?.name,
      marketName: p.market?.name || '',
      reason: data.basis,
    }))

  return (
    <div className="min-h-screen bg-cream">
      <div className="container-page py-10 md:py-14 space-y-10">

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="
            group
            inline-flex
            items-center
            gap-2
            px-4
            py-2.5
            rounded-xl
            border
            border-forest/15
            bg-cream/60
            text-forest
            transition-all
            duration-300
            hover:bg-forest
            hover:text-cream
            hover:-translate-x-0.5
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-olive-light
          "
        >
          <span className="text-lg transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>

          <span className="text-sm font-medium">
            Back
          </span>
        </button>

        <AnalyticsHeader
          title="Your Market Insights"
          subtitle="Based only on your own orders and favourites."
        />

        <DataState loading={loading} error={error} onRetry={reload}>
          {data && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AnalyticsCard title="Orders">
                  <p className="font-display text-3xl tabular-nums">
                    {data.stats.orders}
                  </p>
                </AnalyticsCard>

                <AnalyticsCard title="Total spent">
                  <p className="font-display text-3xl tabular-nums">
                    Rs. {data.stats.totalSpent.toLocaleString()}
                  </p>
                </AnalyticsCard>

                <AnalyticsCard title="Average order">
                  <p className="font-display text-3xl tabular-nums">
                    Rs. {data.stats.averageOrder.toLocaleString()}
                  </p>
                </AnalyticsCard>
              </div>

              {data.topCategories.length > 0 && (
                <p className="text-sm text-forest/70">
                  Your most-bought categories:{' '}
                  {data.topCategories.join(', ')}.
                </p>
              )}

              <section>
                <h2 className="font-display text-xl text-forest-deep mb-1">
                  Recommended for you
                </h2>

                <p className="text-sm text-forest/60 mb-4">
                  {data.basis}
                </p>

                {recs.length === 0 ? (
                  <p className="text-sm text-forest/55">
                    No recommendations yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recs.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <RecommendationCard item={item} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>

              <p className="text-center">
                <Link
                  to="/ai-assistant"
                  className="text-sm font-medium text-olive hover:underline"
                >
                  Ask the MarketLink assistant →
                </Link>
              </p>
            </>
          )}
        </DataState>
      </div>
    </div>
  )
}