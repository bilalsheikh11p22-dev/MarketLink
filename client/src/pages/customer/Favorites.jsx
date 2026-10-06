import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, X } from 'lucide-react'
import PageLayout from '../../components/PageLayout.jsx'
import FavoriteTabs from '../../components/favorites/FavoriteTabs.jsx'
import FavoritesEmptyState from '../../components/favorites/FavoritesEmptyState.jsx'
import { StarIcon } from '../../components/market/MarketIcons.jsx'
import { useFavorites } from '../../context/FavoritesContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import AppImage from '../../components/image/AppImage.jsx'

const TYPE_TO_TAB = { product: 'products', farmer: 'farmers', market: 'markets' }
const ROUTE = { product: (id) => `/products/${id}`, farmer: (id) => `/farmers/${id}`, market: (id) => `/markets/${id}` }

function FavoriteRow({ item }) {
  const { removeFavorite } = useFavorites()
  const { showToast } = useToast()

  const remove = () => {
    removeFavorite(item.type, item.id)
    showToast('Removed from favorites')
  }

  const sub =
    item.type === 'product'
      ? [item.metadata?.category, item.metadata?.farmer].filter(Boolean).join(' · ')
      : item.type === 'farmer'
        ? item.metadata?.specialty
        : item.metadata?.location

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className="group flex items-center gap-4 border border-forest/10 bg-cream-soft p-4"
    >
      <Link to={ROUTE[item.type](item.id)} className="relative h-20 w-20 shrink-0 overflow-hidden bg-forest-light">
        <AppImage fill src={item.image} alt="" kind={item.type === 'farmer' ? 'farmer' : item.type === 'market' ? 'market' : 'product'} />
      </Link>

      <div className="min-w-0 flex-1">
        <span className="text-[10px] uppercase tracking-widest2 text-olive">{item.type}</span>
        <p className="font-display text-lg text-forest-deep leading-snug truncate">
          <Link to={ROUTE[item.type](item.id)} className="hover:text-olive transition-colors">
            {item.name}
          </Link>
        </p>
        {sub && <p className="text-sm text-forest-deep/55 truncate">{sub}</p>}
        {item.metadata?.rating && (
          <span className="mt-1 inline-flex items-center gap-1 text-xs text-forest-deep/60">
            <StarIcon size={11} className="text-olive" />
            {item.metadata.rating}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link to={ROUTE[item.type](item.id)} className="hidden sm:inline-flex px-4 py-2 text-xs border border-forest/20 text-forest-deep hover:border-olive hover:text-olive transition-colors">
          View Details
        </Link>
        <button
          type="button"
          onClick={remove}
          aria-label={`Remove ${item.name} from favorites`}
          className="flex h-9 w-9 items-center justify-center text-forest-deep/50 hover:text-[#A9482F] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </motion.article>
  )
}

export default function Favorites() {
  const { favorites } = useFavorites()
  const [tab, setTab] = useState('all')

  const counts = useMemo(
    () => ({
      all: favorites.length,
      products: favorites.filter((f) => f.type === 'product').length,
      farmers: favorites.filter((f) => f.type === 'farmer').length,
      markets: favorites.filter((f) => f.type === 'market').length
    }),
    [favorites]
  )

  const visible = tab === 'all' ? favorites : favorites.filter((f) => TYPE_TO_TAB[f.type] === tab)

  return (
    <PageLayout eyebrow="Saved for later" title="Your Favorites" subtitle="Everything you've saved — products, farmers and markets — in one place.">
      <FavoriteTabs value={tab} onChange={setTab} counts={counts} />
      <div className="pt-8">
        {favorites.length === 0 ? (
          <FavoritesEmptyState tab="all" />
        ) : visible.length === 0 ? (
          <FavoritesEmptyState tab={tab} />
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((item) => (
              <FavoriteRow key={`${item.type}:${item.id}`} item={item} />
            ))}
          </div>
        )}
      </div>
      {favorites.length > 0 && (
        <p className="mt-6 flex items-center gap-2 text-xs text-forest-deep/45">
          <Heart size={13} aria-hidden="true" /> {favorites.length} saved
        </p>
      )}
    </PageLayout>
  )
}
