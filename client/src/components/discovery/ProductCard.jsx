import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import FavoriteButton from '../favorites/FavoriteButton.jsx'
import ImageWithLoader from '../common/ImageWithLoader.jsx'

export default function ProductCard({ product }) {
  const thumbnail = product.images?.[0] ?? product.image

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group relative flex flex-col overflow-hidden border border-forest/10 bg-cream-soft hover:border-olive/50 transition-colors"
    >
      <div className="relative aspect-square overflow-hidden">
        <Link to={`/products/${product.id}`} tabIndex={-1} aria-hidden="true" className="absolute inset-0 block">
          <ImageWithLoader
            src={thumbnail}
            alt={product.name}
            wrapperClassName="absolute inset-0 h-full w-full"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        </Link>

        <FavoriteButton type="product" entity={product} className="absolute top-3 right-3 !h-8 !w-8" />

        {!product.available && <span className="absolute bottom-3 left-3 bg-forest-deep/80 text-cream text-[11px] px-2.5 py-1">Sold Out</span>}
      </div>

      <div className="flex flex-col gap-1.5 p-5">
        <span className="text-[11px] uppercase tracking-wide text-olive">{product.category}</span>
        <h3 className="font-display text-lg text-forest-deep leading-snug">
          <Link to={`/products/${product.id}`} className="hover:text-olive transition-colors focus:outline-none focus-visible:underline">
            {product.name}
          </Link>
        </h3>
        <p className="text-xs text-forest-deep/55">{product.farmer?.name ?? product.farmer}</p>

        <div className="flex items-center gap-1 text-xs text-forest-deep/70 mt-0.5">
          <span className="text-olive">★</span>
          {product.rating}
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-forest-deep font-medium">
            Rs. {product.price} <span className="text-forest-deep/50 font-normal text-sm">/ {product.unit}</span>
          </p>
          <span className={`flex items-center gap-1.5 text-xs ${product.available ? 'text-sage' : 'text-forest-deep/40'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${product.available ? 'bg-sage' : 'bg-forest-deep/30'}`} />
            {product.available ? 'Available' : 'Sold Out'}
          </span>
        </div>

        <Link to={`/products/${product.id}`} className="mt-2 inline-flex items-center gap-2 text-sm text-forest-deep group-hover:text-olive transition-colors w-fit">
          View Product
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </motion.article>
  )
}
