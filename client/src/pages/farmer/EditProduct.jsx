import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useFarmer } from '../../context/FarmerContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import ProductForm from '../../components/farmer/ProductForm.jsx'

export default function EditProduct() {
  const { id } = useParams()
  const { getProducts, updateProduct } = useFarmer()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const product = getProducts().find((p) => p.id === id)

  if (!product) {
    return <Navigate to="/farmer/products" replace />
  }

  const handleSubmit = async (values) => {
    try { await updateProduct(id, values); showToast('Product updated successfully.'); navigate('/farmer/products') }
    catch (e) { showToast(e.message || 'Could not update the product') }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-forest-deep mb-8">Edit Product</h1>
      <ProductForm initialProduct={product} onSubmit={handleSubmit} onCancel={() => navigate('/farmer/products')} submitLabel="Save Changes" />
    </div>
  )
}
