import Favorite from '../models/Favorite.js'
import Product from '../models/Product.js'
import Farmer from '../models/Farmer.js'
import Market from '../models/Market.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { success } from '../utils/ApiResponse.js'
const MODELS = { product: Product, farmer: Farmer, market: Market }
export const listFavorites = asyncHandler(async (req, res) => {
  const favs = await Favorite.find({ user: req.user._id }).sort({ createdAt: -1 })
  const out = { products: [], farmers: [], markets: [] }
  for (const type of ['product', 'farmer', 'market']) {
    const ids = favs.filter((f) => f.targetType === type).map((f) => f.target)
    const docs = await MODELS[type].find({ _id: { $in: ids } })
    out[`${type}s`] = docs
  }
  success(res, { favorites: out, ids: favs.map((f) => ({ type: f.targetType, id: f.target })) })
})
export const addFavorite = asyncHandler(async (req, res) => {
  const { targetType, target } = req.body
  if (!MODELS[targetType]) throw new ApiError(422, 'targetType must be product, farmer or market')
  if (!/^[a-f\d]{24}$/i.test(String(target))) throw new ApiError(422, 'Invalid target id')
  if (!(await MODELS[targetType].exists({ _id: target }))) throw new ApiError(404, `${targetType} not found`)
  await Favorite.updateOne({ user: req.user._id, targetType, target }, { $setOnInsert: { user: req.user._id, targetType, target } }, { upsert: true })
  success(res, null, 'Added to favorites', 201)
})
export const removeFavorite = asyncHandler(async (req, res) => {
  await Favorite.deleteOne({ user: req.user._id, targetType: req.params.type, target: req.params.id })
  success(res, null, 'Removed from favorites')
})
