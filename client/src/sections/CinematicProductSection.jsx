import CinematicScene from '../components/cinematic/CinematicScene.jsx'
import { productStory } from '../data/productStory.js'

/**
 * Thin section wrapper around CinematicScene — keeps scene content
 * (data/productStory.js) separate from the scroll/animation mechanics
 * (components/cinematic/CinematicScene.jsx), matching the pattern
 * already used for the Step 1 hero story (StorySection + ScrollScene).
 */
export default function CinematicProductSection({ onExploreProducts }) {
  return (
    <section aria-label="Product story">
      <CinematicScene scenes={productStory} onExploreProducts={onExploreProducts} />
    </section>
  )
}
