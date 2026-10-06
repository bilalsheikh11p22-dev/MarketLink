import { motion } from 'framer-motion'
import { Check, ShoppingBasket, Sprout } from 'lucide-react'

const ROLES = [
  { id: 'customer', title: 'Customer', text: 'Shop fresh products and discover local markets.', Icon: ShoppingBasket },
  { id: 'farmer', title: 'Farmer', text: 'Sell your products and connect with local customers.', Icon: Sprout }
]

/** Two selectable role cards (radiogroup). */
export default function RoleSelector({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Choose your account type" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {ROLES.map(({ id, title, text, Icon }) => {
        const active = value === id
        return (
          <motion.button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(id)}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className={`relative text-left border p-6 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
              active ? 'border-forest-deep bg-forest-deep text-cream' : 'border-forest/15 bg-white/70 text-forest-deep hover:border-olive/70'
            }`}
          >
            <span className={`flex h-12 w-12 items-center justify-center rounded-full mb-5 ${active ? 'bg-cream/15 text-olive-light' : 'bg-olive/20 text-forest-deep'}`}>
              <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="block font-display text-2xl mb-1.5">{title}</span>
            <span className={`block text-sm leading-relaxed ${active ? 'text-cream/75' : 'text-forest-deep/65'}`}>{text}</span>
            {active && (
              <span className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-olive text-forest-deep" aria-hidden="true">
                <Check size={14} />
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
