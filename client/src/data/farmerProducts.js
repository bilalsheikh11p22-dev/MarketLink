// Products owned by farmer-001 — a farmer-side dataset distinct from the
// customer-facing data/products.js, matching the {id, farmerId, ...}
// shape from the Step 5 spec. Seeds FarmerContext; edits persist to
// localStorage under marketlink_farmer_products.

export const CATEGORIES = ['Vegetables', 'Fruits', 'Herbs', 'Dairy', 'Grains']

export const initialFarmerProducts = [
  {
    id: 'p-001',
    farmerId: 'farmer-001',
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    description: 'Vine-ripened tomatoes, picked at peak ripeness.',
    price: 180,
    unit: 'kg',
    stock: 24,
    available: true,
    rating: 4.8,
    reviewCount: 42,
    images: ['/images/products/tomatoes-1.jpg'],
    tags: ['Fresh', 'Local'],
    updatedAt: '2026-09-20T08:00:00.000Z'
  },
  {
    id: 'p-002',
    farmerId: 'farmer-001',
    name: 'Organic Spinach',
    category: 'Vegetables',
    description: 'Tender organic spinach leaves, bundled fresh each morning.',
    price: 90,
    unit: 'bunch',
    stock: 8,
    available: true,
    rating: 4.6,
    reviewCount: 19,
    images: ['/images/products/spinach-1.jpg'],
    tags: ['Organic'],
    updatedAt: '2026-09-19T08:00:00.000Z'
  },
  {
    id: 'p-003',
    farmerId: 'farmer-001',
    name: 'Seasonal Carrots',
    category: 'Vegetables',
    description: 'Sweet seasonal carrots, harvested young for a tender bite.',
    price: 130,
    unit: 'kg',
    stock: 3,
    available: true,
    rating: 4.7,
    reviewCount: 21,
    images: ['/images/products/carrots-1.jpg'],
    tags: ['Fresh', 'Seasonal'],
    updatedAt: '2026-09-18T08:00:00.000Z'
  },
  {
    id: 'p-004',
    farmerId: 'farmer-001',
    name: 'Fresh Mint',
    category: 'Herbs',
    description: 'Fragrant fresh mint, cut to order.',
    price: 60,
    unit: 'bunch',
    stock: 0,
    available: false,
    rating: 4.8,
    reviewCount: 9,
    images: ['/images/products/mint-1.jpg'],
    tags: ['Herbs'],
    updatedAt: '2026-09-17T08:00:00.000Z'
  },
  {
    id: 'p-005',
    farmerId: 'farmer-001',
    name: 'Green Chillies',
    category: 'Vegetables',
    description: 'Locally grown spicy green chillies.',
    price: 110,
    unit: 'kg',
    stock: 9,
    available: true,
    rating: 4.5,
    reviewCount: 11,
    images: ['/images/products/chillies-1.jpg'],
    tags: ['Fresh'],
    updatedAt: '2026-09-16T08:00:00.000Z'
  },
  {
    id: 'p-006',
    farmerId: 'farmer-001',
    name: 'Bell Peppers',
    category: 'Vegetables',
    description: 'Crisp, colorful bell peppers.',
    price: 210,
    unit: 'kg',
    stock: 20,
    available: true,
    rating: 4.6,
    reviewCount: 14,
    images: ['/images/products/peppers-1.jpg'],
    tags: ['Fresh', 'Local'],
    updatedAt: '2026-09-15T08:00:00.000Z'
  }
]

export function getStockStatus(stock) {
  if (stock === 0) return 'Sold Out'
  if (stock <= 10) return 'Low Stock'
  return 'In Stock'
}
