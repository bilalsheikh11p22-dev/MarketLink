import { useState } from 'react'
import { GRAIN_URL } from './cinematic/SceneArt.jsx'

export default function CinematicBackground({
  src = '/videos/marketlink-hero.mp4',
  poster,
}) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-forest-deep">
      {!failed && (
        <video
          data-hero="background"
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          onError={() => setFailed(true)}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}

      {failed && (
        <div
          className="absolute inset-0 h-full w-full"
          style={{
            background:
              'radial-gradient(circle at 30% 20%, #7FA98D 0%, #4C7A62 45%, #2F4B3B 100%)',
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
            style={{ backgroundImage: GRAIN_URL }}
          />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/70 via-forest-deep/50 to-forest-deep/80" />
      <div className="absolute inset-0 bg-forest-deep/20" />
    </div>
  )
}