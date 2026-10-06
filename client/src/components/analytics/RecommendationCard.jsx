import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AppImage from '../image/AppImage.jsx'
export default function RecommendationCard({ item }) {
  if (!item) return null
  return (
    <motion.article
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-forest/8 bg-cream-soft overflow-hidden shadow-sm flex flex-col"
    >
      <div className="aspect-[4/3] bg-forest/5 overflow-hidden">
        <AppImage src={item.image} alt="" kind="product" />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-olive">{item.reason}</p>
        <h3 className="mt-1 font-display text-lg text-forest-deep leading-snug">{item.name}</h3>
        <p className="text-xs text-forest/55 mt-0.5">{item.farmerName} · {item.marketName}</p>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="font-medium tabular-nums">Rs. {item.price}<span className="text-forest/50 font-normal"> / {item.unit}</span></span>
          {item.rating != null && <span className="text-forest/60 text-xs">{item.rating}★</span>}
        </div>
        <Link
          to={`/products/${item.productId}`}
          className="mt-4 inline-flex justify-center rounded-xl bg-forest py-2.5 text-sm font-medium text-cream hover:bg-forest-light focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
        >
          View Product
        </Link>
      </div>
    </motion.article>
  )
}
