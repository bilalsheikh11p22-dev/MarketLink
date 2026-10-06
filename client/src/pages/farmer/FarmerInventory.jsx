import { useMemo } from 'react'
import { useFarmer } from '../../context/FarmerContext.jsx'
import { getStockStatus } from '../../data/farmerProducts.js'
import useFetch from '../../hooks/useFetch.js'
import { farmerForecast } from '../../services/insightService.js'
import InventoryTable from '../../components/farmer/InventoryTable.jsx'

function SummaryCard({ label, value }) {
  return (
    <div className="border border-forest/10 bg-cream-soft p-5">
      <p className="font-display text-2xl text-forest-deep">{value}</p>
      <p className="text-forest-deep/55 text-xs mt-1">{label}</p>
    </div>
  )
}

export default function FarmerInventory() {
  const { getProducts } = useFarmer()
  const products = getProducts()
  const forecast = useFetch(() => farmerForecast(8), [])
  const suggestions = useMemo(() => Object.fromEntries((forecast.data?.forecasts || []).filter((f) => f.suggestedStock != null).map((f) => [f.productId, f.suggestedStock])), [forecast.data])

  const summary = useMemo(() => {
    const inStock = products.filter((p) => getStockStatus(p.stock) === 'In Stock').length
    const lowStock = products.filter((p) => getStockStatus(p.stock) === 'Low Stock').length
    const soldOut = products.filter((p) => getStockStatus(p.stock) === 'Sold Out').length
    return { total: products.length, inStock, lowStock, soldOut }
  }, [products])

  return (
    <div>
      <h1 className="font-display text-3xl text-forest-deep mb-8">Inventory</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <SummaryCard label="Total Products" value={summary.total} />
        <SummaryCard label="In Stock" value={summary.inStock} />
        <SummaryCard label="Low Stock" value={summary.lowStock} />
        <SummaryCard label="Sold Out" value={summary.soldOut} />
      </div>

      <p className="mb-4 text-xs text-forest-deep/55">{forecast.data && !forecast.data.sufficientData ? 'Suggested stock appears once there is enough order history (sales in at least 3 weeks). Nothing is guessed.' : 'Suggested stock is an estimate from recent weekly sales plus a 15% buffer.'}</p>
      <InventoryTable products={products} suggestions={suggestions} />
    </div>
  )
}
