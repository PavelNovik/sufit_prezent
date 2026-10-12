import { useEffect, useState } from 'react'
import CeilingView from '../engine/CeilingView.jsx'
import { sceneById } from '../data/scenes.js'
import { defaults } from '../state/useConfig.js'

// Витрина в hero: один салон, потолок сам перебирает варианты
const looks = [
  { label: 'Mat · profil cieniowy · spoty', cfg: { material: 'matte', color: 'white', profile: 'shadowStandard', spot: 'spotStd', spotCount: 6 } },
  { label: 'Połysk grafit · linie LED · wieczór', cfg: { material: 'gloss', color: 'graphite', profile: 'eurokraab', spot: 'none', led: 'parallel', curtain: 'hiddenLux', mode: 'night' } },
  { label: 'Satyna kremowa · podświetlany profil', cfg: { material: 'satin', color: 'cream', profile: 'floating', spot: 'spotPrem', spotStyle: 'black', spotCount: 6, mode: 'night' } },
  { label: 'Gwieździste niebo · lampa premium', cfg: { material: 'starSky', profile: 'shadowStandard', spot: 'none', lamp: 'chandPrem', mode: 'night' } },
]

export default function HeroShowcase() {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI((n) => (n + 1) % looks.length), 3800)
    return () => clearInterval(t)
  }, [])
  const look = looks[i]
  return (
    <figure className="showcase">
      <CeilingView scene={sceneById('salon-1')} cfg={{ ...defaults, ...look.cfg }} />
      <figcaption>
        <span className="showcase__dots" aria-hidden="true">
          {looks.map((l, n) => (
            <i key={l.label} className={n === i ? 'is-on' : ''} />
          ))}
        </span>
        {look.label}
      </figcaption>
    </figure>
  )
}
