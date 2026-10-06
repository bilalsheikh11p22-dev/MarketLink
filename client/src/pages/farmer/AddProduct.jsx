import { useNavigate } from 'react-router-dom'
import { useFarmer } from '../../context/FarmerContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import ProductForm from '../../components/farmer/ProductForm.jsx'

export default function AddProduct() {
  const { addProduct } = useFarmer()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (values) => {
    try { await addProduct(values); showToast('Product added'); navigate('/farmer/products') }
    catch (e) { showToast(e.message || 'Could not add the product') }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-forest-deep mb-8">Add Product</h1>
      <ProductForm onSubmit={handleSubmit} onCancel={() => navigate('/farmer/products')} submitLabel="Add Product" />
    </div>
  )
}
