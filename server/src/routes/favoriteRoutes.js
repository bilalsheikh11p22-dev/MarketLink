import { Router } from 'express'
import { listFavorites, addFavorite, removeFavorite } from '../controllers/favoriteController.js'
import { requireAuth } from '../middleware/auth.js'
const router = Router()
router.use(requireAuth)
router.get('/', listFavorites)
router.post('/', addFavorite)
router.delete('/:type/:id', removeFavorite)
export default router
