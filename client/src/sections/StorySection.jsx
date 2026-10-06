import { landingScenes } from '../data/landingScenes.js'
import ScrollScene from '../components/ScrollScene.jsx'

/**
 * The cinematic scroll story: renders one ScrollScene per entry in
 * landingScenes.js, stacked over the fixed CinematicBackground video
 * that lives in Home.jsx.
 */
export default function StorySection() {
  return (
    <div className="relative">
      {landingScenes.map((scene, index) => (
        <ScrollScene key={scene.id} scene={scene} index={index} />
      ))}
    </div>
  )
}
