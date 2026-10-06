import { Router } from 'express'
import { body, param } from 'express-validator'
import { listProducts, listCategories, getProduct, createProduct, updateProduct, deleteProduct, adjustStock, nearbyProducts } from '../controllers/productController.js'
import { requireAuth, requireRole, requireApprovedFarmer } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
const router = Router()
router.get('/', listProducts)
router.get('/categories', listCategories)
router.get('/nearby', nearbyProducts)
router.get('/:id', param('id').isMongoId().withMessage('invalid id'), validate, getProduct)
const farmerOrAdmin = [requireAuth, requireRole('farmer', 'admin'), requireApprovedFarmer]
router.post('/', ...farmerOrAdmin,
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('2-120 characters'),
  body('price').isFloat({ min: 0 }).withMessage('must be >= 0'),
  body('stock').optional().isFloat({ min: 0 }).withMessage('must be >= 0'),
  validate, createProduct)
router.put('/:id', ...farmerOrAdmin, param('id').isMongoId(), validate, updateProduct)
router.patch('/:id/stock', ...farmerOrAdmin, param('id').isMongoId(), validate, adjustStock)
router.delete('/:id', ...farmerOrAdmin, param('id').isMongoId(), validate, deleteProduct)
export default router
