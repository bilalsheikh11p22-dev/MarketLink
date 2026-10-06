import ProductImage from '../image/ProductImage.jsx'

export default function CheckoutSummary({ items, subtotal, pickupDateLabel, pickupTime, marketName, onPlaceOrder, errors, placing }) {
  return (
    <div className="bg-cream-soft border border-forest/10 p-6 md:p-8 md:sticky md:top-28">
      <h3 className="font-display text-xl text-forest-deep mb-6">Order Review</h3>

      <div className="flex flex-col gap-3 mb-6 max-h-64 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center justify-between text-sm gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden bg-cream"><ProductImage src={item.image} alt="" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-forest-deep truncate">{item.name}</p>
              <p className="text-forest-deep/50 text-xs">
                {item.quantity} {item.unit}
              </p>
            </div>
            <p className="text-forest-deep whitespace-nowrap">Rs. {item.price * item.quantity}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 text-sm border-t border-forest/10 pt-4">
        <div className="flex justify-between text-forest-deep/70">
          <span>Subtotal</span>
          <span>Rs. {subtotal}</span>
        </div>
        <div className="flex justify-between text-forest-deep/70">
          <span>Pickup</span>
          <span>Free</span>
        </div>
        <div className="flex justify-between font-display text-lg text-forest-deep pt-2 border-t border-forest/10">
          <span>Total</span>
          <span>Rs. {subtotal}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-1.5 text-sm text-forest-deep/70">
        <p className="text-forest-deep/50">Pickup</p>
        <ul className="flex flex-col gap-1">{(pickupDateLabel || 'Not selected').split(' | ').map((l) => <li key={l}>{l}</li>)}</ul>
        {marketName && <p><span className="text-forest-deep/50">Market:</span> {marketName}</p>}
      </div>

      <p className="mt-6 text-xs text-forest-deep/55 leading-relaxed border-t border-forest/10 pt-4">
        Payment is made directly to the farmer during pickup.
      </p>

      {errors.length > 0 && (
        <ul className="mt-4 flex flex-col gap-1" role="alert">
          {errors.map((err) => (
            <li key={err} className="text-xs text-red-700/80">
              {err}
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onPlaceOrder}
        disabled={placing}
        className="mt-6 w-full py-3.5 bg-forest-deep text-cream text-sm tracking-wide hover:bg-forest-light transition-colors disabled:opacity-60"
      >
        {placing ? 'Placing Pre-Order…' : 'Place Pre-Order'}
      </button>
    </div>
  )
}
