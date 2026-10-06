import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import ProductGallery from '../components/product/ProductGallery.jsx'
import ProductInfo from '../components/product/ProductInfo.jsx'
import FavoriteButton from '../components/favorites/FavoriteButton.jsx'
import ReviewsSection from '../components/reviews/ReviewsSection.jsx'
import { InlineLoader } from '../components/common/PageLoader.jsx'
import * as productService from '../services/productService.js'
import { normalizeProduct } from '../utils/normalize.js'
import { useCart } from '../context/CartContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function ProductDetails() {
  const { id } = useParams()
  const { addToCart, cartItems } = useCart()
  const { showToast } = useToast()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    window.scrollTo(0, 0)
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    setProduct(null)
    productService
      .getProduct(id)
      .then((res) => { if (!cancelled) setProduct(normalizeProduct(res.data?.product)) })
      .catch(() => { if (!cancelled) setNotFound(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-cream pt-28"><InlineLoader /></div>
        <Footer />
      </>
    )
  }

  if (notFound || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-cream text-center px-6 pt-24">
          <h1 className="font-display text-3xl text-forest-deep mb-4">Product not found</h1>
          <Link to="/" className="text-olive hover:text-forest-deep transition-colors">
            Back to MarketLink
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  const alreadyInCart = cartItems.find((item) => item.productId === product.id)?.quantity ?? 0
  const remainingStock = Math.max(0, (product.stock ?? 0) - alreadyInCart)
  const atMax = quantity >= remainingStock

  const handleDecrease = () => setQuantity((q) => Math.max(1, q - 1))
  const handleIncrease = () => {
    if (atMax) {
      showToast('Maximum available quantity reached')
      return
    }
    setQuantity((q) => Math.min(remainingStock, q + 1))
  }

  const handleAddToCart = () => {
    const result = addToCart(product, quantity)
    if (result.success) {
      showToast('Added to your cart ✓')
      setQuantity(1)
    } else if (result.reason === 'stock-limit') {
      showToast('Maximum available quantity reached')
    } else {
      showToast('This product is currently unavailable')
    }
  }

  return (
    <>
      <Navbar />
      <main className="bg-cream min-h-screen pt-28 pb-24">
        <div className="container-page">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-forest-deep/60 hover:text-forest-deep transition-colors mb-10"
          >
            ← Back to MarketLink
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <ProductGallery images={product.images} alt={product.name} />

            <div className="flex flex-col gap-8">
              <div className="flex items-start justify-between gap-4">
                <ProductInfo product={product} />
                <FavoriteButton type="product" entity={product} variant="pill" className="shrink-0 mt-1" />
              </div>

              <div className="border-t border-forest/10 pt-6 flex flex-col gap-4">
                <div className="bg-cream-soft border border-forest/10 p-4 text-sm text-forest-deep/75">
                  <p>
                    <span className="text-forest-deep/50">Farmer:</span>{' '}
                    <Link to={`/farmers/${product.farmer.id}`} className="text-forest-deep hover:text-olive underline-offset-4 hover:underline transition-colors">
                      {product.farmer.name}
                    </Link>
                  </p>
                  {product.market && (
                    <p className="mt-1">
                      <span className="text-forest-deep/50">Market:</span>{' '}
                      <Link to={`/markets/${product.market.id}`} className="text-forest-deep hover:text-olive underline-offset-4 hover:underline transition-colors">
                        {product.market.name}
                      </Link>
                    </p>
                  )}
                </div>

                {product.available ? (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-forest/15">
                        <button
                          type="button"
                          onClick={handleDecrease}
                          disabled={quantity <= 1}
                          aria-label="Decrease quantity"
                          className="h-11 w-11 flex items-center justify-center text-forest-deep disabled:opacity-30 hover:bg-cream-soft transition-colors"
                        >
                          −
                        </button>
                        <span className="w-12 text-center text-forest-deep" aria-live="polite">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={handleIncrease}
                          disabled={remainingStock <= quantity}
                          aria-label="Increase quantity"
                          className="h-11 w-11 flex items-center justify-center text-forest-deep disabled:opacity-30 hover:bg-cream-soft transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm text-forest-deep/55">
                        {remainingStock > 0 ? `${remainingStock} available` : 'No more available'}
                      </span>
                    </div>

                    {atMax && remainingStock > 0 && (
                      <p className="text-xs text-forest-deep/50">Maximum available quantity reached</p>
                    )}

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={remainingStock <= 0}
                      className="w-full py-3.5 bg-forest-deep text-cream text-sm tracking-wide hover:bg-forest-light transition-colors disabled:opacity-50"
                    >
                      Add to Cart
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3.5 bg-forest-deep/20 text-forest-deep/50 text-sm tracking-wide cursor-not-allowed"
                  >
                    Currently Unavailable
                  </button>
                )}

                <Link
                  to="/products"
                  className="text-center text-sm text-forest-deep/60 hover:text-forest-deep transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-20 md:mt-28 pt-4 border-t border-forest/10">
            <ReviewsSection kind="product" product={product} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
