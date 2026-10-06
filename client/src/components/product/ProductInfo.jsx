import { Link } from 'react-router-dom'
import ProductRating from './ProductRating.jsx'
import ProductAvailability from './ProductAvailability.jsx'
import ProductTags from './ProductTags.jsx'

export default function ProductInfo({ product }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className="text-xs uppercase tracking-wide text-olive">{product.category}</span>
        <h1 className="font-display text-3xl md:text-4xl text-forest-deep mt-2 leading-snug">{product.name}</h1>
      </div>

      <ProductRating rating={product.rating} reviewCount={product.reviewCount} />

      <p className="text-forest-deep/70 leading-relaxed max-w-md">{product.description}</p>

      <p className="font-display text-2xl text-forest-deep">
        Rs. {product.price} <span className="text-base font-body font-normal text-forest-deep/50">/ {product.unit}</span>
      </p>

      <ProductAvailability available={product.available} stock={product.stock} />

      <ProductTags tags={product.tags} />

      <div className="flex flex-col gap-2 pt-4 border-t border-forest/10 text-sm">
        <Link to={`/farmers/${product.farmer.id}`} className="text-forest-deep hover:text-olive transition-colors w-fit">
          View Farmer — {product.farmer.name}
        </Link>
        <Link to={`/markets/${product.market.id}`} className="text-forest-deep hover:text-olive transition-colors w-fit">
          View Market — {product.market.name}
        </Link>
      </div>
    </div>
  )
}
