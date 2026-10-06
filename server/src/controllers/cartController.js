import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { success } from '../utils/ApiResponse.js'

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId })
  if (!cart) cart = await Cart.create({ user: userId, items: [] })
  return cart
}

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id)
  await cart.populate({ path: 'items.product', populate: [{ path: 'farmer', select: 'businessName' }, { path: 'market', select: 'name location' }] })
  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0)
  success(res, { cart, subtotal })
})

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body
  if (!productId) throw new ApiError(400, 'productId is required')
  if (!/^[a-f\d]{24}$/i.test(String(productId))) throw new ApiError(422, 'Invalid productId')
  const product = await Product.findById(productId)
  if (!product || !product.isActive || product.status !== 'published') throw new ApiError(404, 'Product not found')
  const cart = await getOrCreateCart(req.user._id)
  const idx = cart.items.findIndex((i) => i.product.toString() === productId)
  const qty = Number(quantity)
  if (!Number.isInteger(qty) || qty < 1) throw new ApiError(422, 'Quantity must be a whole number of at least 1')
  const nextQty = (idx >= 0 ? cart.items[idx].quantity : 0) + qty
  if (nextQty > product.stock) throw new ApiError(409, `Only ${product.stock} ${product.unit} of "${product.name}" available`)
  const unitPrice = Math.round(product.price * (1 - (product.discountPercent || 0) / 100) * 100) / 100
  if (idx >= 0) { cart.items[idx].quantity = nextQty; cart.items[idx].price = unitPrice }
  else cart.items.push({ product: product._id, quantity: qty, price: unitPrice })
  await cart.save(); await cart.populate('items.product')
  success(res, { cart }, 'Added to cart')
})

export const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id)
  const item = cart.items.find((i) => i.product.toString() === req.params.productId)
  if (!item) throw new ApiError(404, 'Item not in cart')
  if (Number(req.body.quantity) <= 0) cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId)
  else {
    const q = Number(req.body.quantity)
    if (!Number.isInteger(q) || q < 1) throw new ApiError(422, 'Quantity must be a whole number')
    const product = await Product.findById(item.product)
    if (!product || !product.isActive) throw new ApiError(404, 'Product no longer available')
    if (q > product.stock) throw new ApiError(409, `Only ${product.stock} ${product.unit} of "${product.name}" available`)
    item.quantity = q
    item.price = Math.round(product.price * (1 - (product.discountPercent || 0) / 100) * 100) / 100
  }
  await cart.save(); await cart.populate('items.product')
  success(res, { cart }, 'Cart updated')
})

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id)
  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId)
  await cart.save()
  success(res, { cart }, 'Item removed')
})

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id)
  cart.items = []; await cart.save()
  success(res, { cart }, 'Cart cleared')
})
