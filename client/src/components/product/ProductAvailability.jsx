export default function ProductAvailability({ available, stock }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`h-2 w-2 rounded-full ${available ? 'bg-sage' : 'bg-forest-deep/30'}`} />
      <span className={available ? 'text-sage' : 'text-forest-deep/50'}>{available ? 'Available' : 'Sold Out'}</span>
      {available && typeof stock === 'number' && <span className="text-forest-deep/45">· {stock} left</span>}
    </div>
  )
}
