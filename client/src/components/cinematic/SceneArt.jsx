/**
 * Designed placeholder visual for a cinematic scene.
 *
 * The project's /public/images/* files (farm-1.jpg, story/farm-fresh.jpg,
 * farmer photos, etc.) are not real photography — they are auto-generated
 * "title card" mockups that already have text like "MARKETLINK" and the
 * scene title baked into the pixels. Rendering them as <img> duplicated
 * the on-screen heading and, since most of each card is a flat gradient
 * with no real subject, made large parts of every scroll section look
 * empty.
 *
 * SceneArt replaces that with an intentional gradient + grain + line-art
 * icon panel, so every scene reads as designed rather than empty even
 * before real photos/video exist. Swap this back out for a real <img>
 * once actual photography is available.
 */

import { Sprout, Users, Carrot, ShoppingBasket, Handshake, CalendarClock, Leaf } from 'lucide-react'

export const sceneIcons = {
  sprout: Sprout,
  users: Users,
  carrot: Carrot,
  basket: ShoppingBasket,
  handshake: Handshake,
  calendar: CalendarClock,
  leaf: Leaf
}

const GRADIENTS = [
  'radial-gradient(circle at 30% 20%, #345943 0%, #1E3F30 55%, #0B1D15 100%)',
  'radial-gradient(circle at 70% 25%, #4F8A5B 0%, #2F4B3B 55%, #0B1D15 100%)',
  'radial-gradient(circle at 25% 75%, #7CB88A 0%, #375A45 55%, #0B1D15 100%)',
  'radial-gradient(circle at 75% 70%, #D4BC7E 0%, #2F4B3B 55%, #0B1D15 100%)',
  'radial-gradient(circle at 50% 50%, #4F8A5B 0%, #1E3F30 60%, #0B1D15 100%)'
]

// Inline SVG fractal-noise grain — cheap, no network request, keeps the
// gradient panels from looking perfectly flat/empty.
export const GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export default function SceneArt({ icon: Icon, tone = 0, className = '' }) {
  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{ background: GRADIENTS[tone % GRADIENTS.length] }}
    >
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: GRAIN_URL }}
      />
      {Icon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Icon strokeWidth={0.85} className="h-24 w-24 sm:h-28 sm:w-28 text-cream/20" />
        </div>
      )}
    </div>
  )
}
