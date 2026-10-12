import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Configurator from './components/Configurator.jsx'
import Inspirations from './components/Inspirations.jsx'
import HeroShowcase from './components/HeroShowcase.jsx'
import Icon from './components/Icon.jsx'
import { useConfig, defaults } from './state/useConfig.js'
import { brand, tel } from './config.js'

const Editor = lazy(() => import('./pages/Editor.jsx'))

export default function App() {
  const [cfg, set] = useConfig()
  const [step, setStep] = useState('room')
  const [mode, setMode] = useState('full') // full | embed | editor — известен только в браузере
  const viewer = useRef(null)

  useEffect(() => {
    const q = new URLSearchParams(location.search)
    if (q.has('editor')) setMode('editor')
    else if (q.has('embed')) setMode('embed')
  }, [])

  const applyPreset = (p) => {
    set({ ...defaults, ...p.cfg })
    setStep('summary')
    viewer.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (mode === 'editor')
    return (
      <Suspense fallback={null}>
        <Editor />
      </Suspense>
    )

  const configurator = <Configurator cfg={cfg} set={set} step={step} setStep={setStep} />
  if (mode === 'embed') return <main className="embed">{configurator}</main>

  return (
    <>
      <header className="header">
        <div className="wrap header__in">
          <a className="logo" href={brand.mainSite} aria-label="Sufitowski — strona główna">
            <img src="/logo.png" alt="Sufitowski" width="186" height="48" />
          </a>
          <nav className="header__nav" aria-label="Nawigacja">
            <a href="#wizualizator">Wizualizator</a>
            <a href="#inspiracje">Inspiracje</a>
            <a className="header__tel" href={tel(brand.phone)}>
              <Icon name="phone" size={16} /> {brand.phone}
            </a>
          </nav>
          <a className="btn btn--gold btn--sm" href={brand.calcUrl}>
            Oblicz cenę
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="wrap hero__in">
            <div className="hero__text">
              <p className="eyebrow">Wizualizator sufitów napinanych</p>
              <h1>
                Zobacz swój sufit, <span className="gold">zanim go zamontujemy</span>
              </h1>
              <p className="hero__lead">
                Wybierz wnętrze, płótno, profil, oświetlenie i karnisz — zmiany zobaczysz od razu na zdjęciu. Przełącz na wieczór, aby
                sprawdzić linie LED, spoty i podświetlenie.
              </p>
              <div className="hero__cta">
                <a className="btn btn--gold" href="#wizualizator">
                  Zaprojektuj sufit <Icon name="arrow-right" />
                </a>
                <a className="btn btn--ghost" href="#inspiracje">
                  Gotowe inspiracje
                </a>
              </div>
              <ul className="stats">
                {brand.stats.map((s) => (
                  <li key={s.label}>
                    <b>
                      {s.value}
                      {s.unit && <small> {s.unit}</small>}
                    </b>
                    <span>{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <HeroShowcase />
          </div>
        </section>

        <section className="section section--config" id="wizualizator" ref={viewer} aria-labelledby="config-title">
          <div className="wrap">
            <div className="section__head">
              <p className="eyebrow">Konfigurator</p>
              <h2 id="config-title">
                Zaprojektuj <span className="gold">swój sufit</span>
              </h2>
            </div>
            {configurator}
          </div>
        </section>

        <Inspirations onApply={applyPreset} />

        <section className="section cta">
          <div className="wrap cta__in">
            <div>
              <h2>
                Podoba się? <span className="gold">Policzmy koszt.</span>
              </h2>
              <p>
                Orientacyjną cenę poznasz w kalkulatorze w mniej niż minutę. Dokładną wycenę przygotujemy po bezpłatnym pomiarze laserowym.
              </p>
            </div>
            <div className="cta__actions">
              <a className="btn btn--gold" href={brand.calcUrl}>
                Oblicz cenę <Icon name="arrow-right" />
              </a>
              <a className="btn btn--ghost" href={tel(brand.phone)}>
                <Icon name="phone" /> {brand.phone}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer__in">
          <img src="/logo.png" alt="Sufitowski" width="140" height="36" loading="lazy" />
          <p>{brand.tagline} · Indywidualne podejście do każdego projektu</p>
          <div className="footer__links">
            <a href={brand.mainSite}>sufitowski.pl</a>
            <a href={brand.instagram} rel="noopener" target="_blank">
              <Icon name="instagram" size={16} /> Instagram
            </a>
          </div>
          <p className="footer__small">
            © {new Date().getFullYear()} Sufitowski. Zdjęcia wnętrz w wizualizatorze: Unsplash. Wizualizacja ma charakter poglądowy.
          </p>
        </div>
      </footer>
    </>
  )
}
