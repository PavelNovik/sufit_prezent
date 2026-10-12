import { useEffect, useRef, useState } from 'react'
import CeilingView from '../engine/CeilingView.jsx'
import { presets } from '../data/presets.js'
import { sceneById } from '../data/scenes.js'
import { defaults } from '../state/useConfig.js'
import Icon from './Icon.jsx'

// Живое превью конфигурации — монтируется, только когда карточка близко к экрану
function LivePreview({ cfg }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setOn(true), { rootMargin: '300px' })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  const full = { ...defaults, ...cfg }
  return (
    <div ref={ref} className="insp__live">
      {on && <CeilingView scene={sceneById(full.scene)} cfg={full} />}
    </div>
  )
}

export default function Inspirations({ onApply }) {
  return (
    <section className="section" id="inspiracje" aria-labelledby="insp-title">
      <div className="wrap">
        <div className="section__head">
          <p className="eyebrow">Inspiracje</p>
          <h2 id="insp-title">
            Gotowe <span className="gold">zestawienia</span>
          </h2>
          <p>Konfiguracje wzorowane na naszych realizacjach. Otwórz dowolną w wizualizatorze i dopasuj do siebie.</p>
        </div>
        <ul className="insp">
          {presets.map((p) => (
            <li key={p.id} className="insp__card">
              <div className="insp__media">
                {p.real ? <img src={p.photo} alt={`${p.title} — realizacja Sufitowski: ${p.tags}`} width="800" height="600" loading="lazy" /> : <LivePreview cfg={p.cfg} />}
                {p.real && <span className="insp__badge">Realizacja</span>}
              </div>
              <div className="insp__body">
                <h3>{p.title}</h3>
                <p>{p.tags}</p>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => onApply(p)}>
                  <Icon name="eye" /> Otwórz w wizualizatorze
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
