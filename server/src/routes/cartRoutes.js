import { Router } from 'express'
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cartController.js'
import { requireAuth } from '../middleware/auth.js'
const router = Router()
router.use(requireAuth)
router.get('/', getCart)
router.post('/', addToCart)
router.put('/:productId', updateCartItem)
router.delete('/:productId', removeCartItem)
router.delete('/', clearCart)
export default router
